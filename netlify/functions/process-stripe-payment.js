/**
 * Netlify Serverless Function for Stripe Payment Processing
 * 
 * This function handles secure payment processing for Little Loaf Cottage.
 * It receives payment methods from the frontend and processes them with Stripe.
 * 
 * Environment Variables Required:
 * - This function uses Stripe; the secret key is stored in an environment variable
 */

// Use the platform global fetch when available (Netlify / Node 18+ provides it).
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
  // Global error handler to ensure we always return a response
  try {
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

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Method not allowed',
          status: 'FAILED',
        }),
      };
    }

    const origin = event.headers && (event.headers.origin || event.headers.Origin);

    // Parse request body
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          status: 'FAILED',
        }),
      };
    }

    const { paymentMethodId, amount, currency = 'usd', customerEmail } = requestData;

    // Validate required fields
    if (!paymentMethodId) {
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Payment method ID is required',
          status: 'FAILED',
        }),
      };
    }

    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Valid amount is required',
          status: 'FAILED',
        }),
      };
    }

    // Get environment variables
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;

    // Debug environment variables (only log if DEBUG_PROCESS_PAYMENT is enabled)
    if (process.env.DEBUG_PROCESS_PAYMENT === 'true') {
      console.log('[process-stripe-payment] Environment variables:', {
        hasSecretKey: !!secretKey,
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('STRIPE'))
      });
    }

    // Validate that we have the required environment variables
    if (!secretKey) {
      console.error('[process-stripe-payment] Missing required environment variable: STRIPE_SECRET_KEY');
      
      return {
        statusCode: 500,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Server configuration error',
          message: 'Missing required environment variable: STRIPE_SECRET_KEY',
          status: 'FAILED',
        }),
      };
    }

    // Log Secret Key for debugging (only if debug mode is enabled)
    if (process.env.DEBUG_PROCESS_PAYMENT === 'true') {
      console.log(`[process-stripe-payment] Backend Secret Key: ${secretKey.substring(0, 10)}...`);
    }

    // Determine Stripe API endpoint
    const stripeApiUrl = 'https://api.stripe.com/v1/payment_intents';

    // Generate idempotency key
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (crypto.randomBytes ? crypto.randomBytes(1)[0] : Math.floor(Math.random() * 256)) % 16;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

    // Prepare Stripe payment request
    const paymentRequest = {
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${origin || 'https://littleloafcottage.com'}/order`,
      metadata: {
        customer_email: customerEmail || '',
        bakery_order: 'true',
      },
    };

    // Log payment request for debugging
    if (process.env.DEBUG_PROCESS_PAYMENT === 'true') {
      console.log('[process-stripe-payment] Payment request:', {
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        payment_method: paymentRequest.payment_method.substring(0, 10) + '...',
        customer_email: paymentRequest.metadata.customer_email,
      });
    }

    // Make request to Stripe
    const fetch = await getFetch();
    
    const stripeResponse = await fetch(stripeApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey,
      },
      body: new URLSearchParams(paymentRequest).toString(),
    });

    const stripeResult = await stripeResponse.json();

    if (process.env.DEBUG_PROCESS_PAYMENT === 'true') {
      console.log('[process-stripe-payment] Stripe response:', {
        status: stripeResponse.status,
        payment_intent_status: stripeResult.status,
        error: stripeResult.error?.message || null,
      });
    }

    if (!stripeResponse.ok) {
      const errorMessage = stripeResult.error?.message || 'Payment processing failed';
      console.error('[process-stripe-payment] Stripe API error:', stripeResult.error);
      
      return {
        statusCode: 400,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: errorMessage,
          status: 'FAILED',
          stripe_error: stripeResult.error,
        }),
      };
    }

    // Payment succeeded
    return {
      statusCode: 200,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'succeeded',
        paymentIntent: stripeResult,
        message: 'Payment processed successfully',
      }),
    };

  } catch (error) {
    // Log the error for server-side debugging
    // eslint-disable-next-line no-console
    console.error('[process-stripe-payment] unexpected error:', error && (error.stack || error.message || error));

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
  
  } catch (globalError) {
    // Global error handler - this should never happen, but ensures we always return a response
    console.error('[process-stripe-payment] Global error handler caught:', globalError);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        status: 'FAILED',
        message: 'Payment processing failed. Please try again.',
        debug: process.env.DEBUG_PROCESS_PAYMENT === 'true' ? globalError.message : undefined
      }),
    };
  }
};
