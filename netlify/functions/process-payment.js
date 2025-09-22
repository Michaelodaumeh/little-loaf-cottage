/**
 * Netlify Serverless Function for Square Payment Processing
 * 
 * This function handles secure payment processing for Little Loaf Cottage.
 * It receives payment tokens from the frontend and processes them with Square.
 * 
 * Environment Variables Required:
 * - This function uses Square; the access token is stored in an environment variable
 * - Square location ID is stored in an environment variable
 * - Square environment setting (sandbox or production) is stored in an environment variable
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

export const handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Method not allowed',
        status: 'FAILED'
      }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { sourceId, amount, currency = 'USD', idempotencyKey } = body;

    // Validate required fields
    if (!sourceId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Missing sourceId (payment token)',
          status: 'FAILED'
        }),
      };
    }

    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Invalid payment amount',
          status: 'FAILED'
        }),
      };
    }

    // Get environment variables
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';

    if (!accessToken || !locationId) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Server configuration error',
          status: 'FAILED'
        }),
      };
    }

    // Determine Square API endpoint based on environment
    const squareApiUrl = environment === 'production' 
      ? 'https://connect.squareup.com/v2/payments'
      : 'https://connect.squareupsandbox.com/v2/payments';

    // Generate idempotency key if not provided
    const finalIdempotencyKey = idempotencyKey || crypto.randomUUID();


    // Prepare Square payment request
    const paymentRequest = {
      source_id: sourceId,
      idempotency_key: finalIdempotencyKey,
      amount_money: {
        amount: amount,
        currency: currency
      },
      location_id: locationId,
      note: 'Little Loaf Cottage - Online Order'
    };

    // Make request to Square API
    const response = await fetch(squareApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': '2023-10-18' // Use latest Square API version
      },
      body: JSON.stringify(paymentRequest)
    });

    const data = await response.json();

    // Handle Square API response
    if (!response.ok) {
      
      // Extract error details from Square response
      const errorMessage = data.errors && data.errors.length > 0 
        ? data.errors.map(err => err.detail).join(', ')
        : 'Payment processing failed';

      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: errorMessage,
          status: 'FAILED',
          squareErrors: data.errors || []
        }),
      };
    }

    // Payment successful

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'COMPLETED',
        payment: data.payment,
        message: 'Payment processed successfully'
      }),
    };

  } catch (error) {

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        status: 'FAILED',
        message: 'Payment processing failed. Please try again.'
      }),
    };
  }
};
