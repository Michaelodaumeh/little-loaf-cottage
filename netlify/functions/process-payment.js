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

// Use the platform global fetch when available (Netlify / Node 18+ provides it).
// Avoid importing `node-fetch` at module top-level because its ESM/CJS
// bundling pulls in `fetch-blob` and `formdata-polyfill` which can crash
// during lambda init with "Class extends value #<Object> is not a constructor or null".
const getFetch = async () => {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch;
  // If not present, attempt a dynamic import. This should be rare on Netlify.
  try {
    // dynamic import to avoid top-level ESM issues
    // eslint-disable-next-line import/no-extraneous-dependencies
    const mod = await import('node-fetch');
    return mod.default || mod;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('No fetch available and dynamic import failed:', err);
    throw err;
  }
};

export const handler = async (event, context) => {
  // Handle CORS preflight requests
  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.VITE_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

  const getCorsHeaders = (origin) => {
    const allowed = ALLOWED_ORIGINS.length === 0 || (origin && ALLOWED_ORIGINS.includes(origin));
    return {
      'Access-Control-Allow-Origin': allowed ? (origin || '*') : 'null',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  };

  if (event.httpMethod === 'OPTIONS') {
    const origin = event.headers && (event.headers.origin || event.headers.Origin);
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
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
    // Parse request body (defensive)
    let body;
    try {
      body = event.body && typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (err) {
      // Bad JSON
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body', status: 'FAILED' }),
      };
    }

    const { sourceId, amount, amountCents, currency = 'USD', idempotencyKey } = body || {};

    const debug = process.env.DEBUG_PROCESS_PAYMENT === 'true';

    // Log a small, non-sensitive summary for diagnostics (do NOT log card tokens or secrets)
    if (debug) {
      // eslint-disable-next-line no-console
      console.log('[process-payment] incoming request summary:', {
        hasSourceId: !!sourceId,
        amountRaw: amount,
        amountCentsRaw: amountCents,
        origin: event.headers && (event.headers.origin || event.headers.Origin)
      });
    }

    // Validate required fields
    const origin = event.headers && (event.headers.origin || event.headers.Origin);
    if (!sourceId) {
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing sourceId (payment token)',
          status: 'FAILED'
        }),
      };
    }

    // Basic validation for Square source token (non-empty string); modify as needed for stricter patterns
    if (typeof sourceId !== 'string' || sourceId.trim().length === 0) {
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid sourceId', status: 'FAILED' }),
      };
    }

    // Determine final amount in smallest currency unit (cents for USD)
    let finalAmount;
    if (typeof amountCents !== 'undefined' && amountCents !== null) {
      finalAmount = Number(amountCents);
    } else {
      // amount may be sent as dollars (float) or cents (integer)
      const rawAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (rawAmount == null || Number.isNaN(rawAmount)) {
        finalAmount = NaN;
      } else if (Number.isInteger(rawAmount)) {
        // Ambiguity: assume integer > 1000 is already cents; else treat as dollars
        finalAmount = rawAmount > 1000 ? rawAmount : Math.round(rawAmount * 100);
      } else {
        // Float -> dollars, convert to cents
        finalAmount = Math.round(rawAmount * 100);
      }
    }

    // Enforce allowed currency and amount bounds (env-configurable)
    const ALLOWED_CURRENCIES = (process.env.ALLOWED_CURRENCIES || 'USD').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (!ALLOWED_CURRENCIES.includes((currency || 'USD').toUpperCase())) {
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unsupported currency', status: 'FAILED' }),
      };
    }

    const MIN_AMOUNT_CENTS = Number(process.env.MIN_AMOUNT_CENTS || process.env.VITE_MIN_AMOUNT_CENTS || 50); // default 50 cents
    const MAX_AMOUNT_CENTS = Number(process.env.MAX_AMOUNT_CENTS || process.env.VITE_MAX_AMOUNT_CENTS || 1000000); // default $10,000

    if (!Number.isFinite(finalAmount) || finalAmount < MIN_AMOUNT_CENTS || finalAmount > MAX_AMOUNT_CENTS) {
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid payment amount (out of bounds)',
          status: 'FAILED',
          details: { min: MIN_AMOUNT_CENTS, max: MAX_AMOUNT_CENTS }
        }),
      };
    }

    // Get environment variables
  // Server-side environment variables. Try both canonical and VITE_ variants as a fallback
  const accessToken = process.env.SQUARE_ACCESS_TOKEN || process.env.VITE_SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID || process.env.VITE_SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT || process.env.VITE_SQUARE_ENVIRONMENT || 'sandbox';
  const applicationId = process.env.SQUARE_APPLICATION_ID || process.env.VITE_SQUARE_APPLICATION_ID;

    if (!accessToken || !locationId) {
      return {
        statusCode: 500,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
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

    // Generate idempotency key if not provided; provide a small fallback if randomUUID isn't available
    const uuidv4 = () => {
      // RFC4122 version 4 compliant UUID generator
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (crypto.randomBytes ? crypto.randomBytes(1)[0] : Math.floor(Math.random() * 256)) % 16;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    const finalIdempotencyKey = idempotencyKey || (crypto.randomUUID ? crypto.randomUUID() : uuidv4());


    // Prepare Square payment request
    const paymentRequest = {
      source_id: sourceId,
      idempotency_key: finalIdempotencyKey,
      amount_money: {
        amount: finalAmount,
        currency: currency
      },
      location_id: locationId,
      note: 'Little Loaf Cottage - Online Order'
    };

    // Make request to Square API
    const _fetch = await getFetch();

    const response = await _fetch(squareApiUrl, {
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
      // Log server-side for debugging
      // eslint-disable-next-line no-console
      const dataStr = (() => {
        try { return JSON.stringify(data); } catch (e) { return String(data); }
      })();
      console.error('[Square] API error', { status: response.status, body: dataStr });

      // Extract error details from Square response
      const errorMessage = data && data.errors && data.errors.length > 0
        ? data.errors.map((err) => err.detail || err.message || JSON.stringify(err)).join(', ')
        : 'Payment processing failed';

      const debug = process.env.DEBUG_PROCESS_PAYMENT === 'true';
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify(debug ? {
          error: errorMessage,
          status: 'FAILED',
          squareErrors: data && data.errors ? data.errors : [],
          squareResponse: dataStr
        } : {
          error: errorMessage,
          status: 'FAILED',
          squareErrors: data && data.errors ? data.errors : []
        }),
      };
    }

    // Payment successful
    return {
      statusCode: 200,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'COMPLETED',
        payment: data && data.payment ? data.payment : data,
        message: 'Payment processed successfully'
      }),
    };

  } catch (error) {
    // Log the error for server-side debugging
    // eslint-disable-next-line no-console
    console.error('[process-payment] unexpected error:', error && (error.stack || error.message || error));

    const debug = process.env.DEBUG_PROCESS_PAYMENT === 'true';
    const responseBody = debug ? {
      error: error && (error.message || 'Internal server error'),
      status: 'FAILED',
      detail: (error && (error.stack || null))
    } : {
      error: 'Internal server error',
      status: 'FAILED',
      message: 'Payment processing failed. Please try again.'
    };

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseBody),
    };
  }
};
