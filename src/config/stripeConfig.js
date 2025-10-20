/**
 * Stripe Payment Configuration
 * 
 * This file contains the configuration for Stripe payment processing.
 * All sensitive values are loaded from environment variables.
 */

/* global __STRIPE_PUBLISHABLE_KEY__, __STRIPE_SECRET_KEY__ */

// Stripe configuration using environment variables
// Note: Vite exposes environment variables that start with VITE_ to the client.
// For local dev and builds with Vite, use VITE_STRIPE_PUBLISHABLE_KEY.
// When deploying to Netlify, set the same build environment variables (VITE_ prefixed)
// so they are embedded into the client bundle at build time.
export const stripeConfig = {
  // Stripe Publishable Key (public key - safe to expose to client-side)
  // Prefer VITE_ prefixed vars (Vite) -> import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  publishableKey:
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    import.meta.env.STRIPE_PUBLISHABLE_KEY ||
    typeof __STRIPE_PUBLISHABLE_KEY__ !== 'undefined' && __STRIPE_PUBLISHABLE_KEY__ ||
    '',

  // Payment processing endpoint
  paymentEndpoint: '/.netlify/functions/process-stripe-payment',
  
  // Currency
  currency: 'usd',
  
  // Stripe Elements appearance
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#e91e63',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px',
      },
      '.Input:focus': {
        borderColor: '#e91e63',
        boxShadow: '0 0 0 1px #e91e63',
      },
      '.Input--invalid': {
        borderColor: '#df1b41',
      },
    },
  },
};

// Validation function to check if Stripe is properly configured
export const isStripeConfigured = () => {
  const hasPublishableKey = !!stripeConfig.publishableKey;
  
  return hasPublishableKey;
};

// Get Stripe environment (test or live)
export const getStripeEnvironment = () => {
  const key = stripeConfig.publishableKey;
  if (!key) return 'unknown';
  
  // Stripe test keys start with pk_test_, live keys start with pk_live_
  return key.startsWith('pk_test_') ? 'test' : 'live';
};

// Helper: warn at runtime if config is missing (useful to debug deployed builds)
if (typeof window !== 'undefined') {
  // Delay to avoid spamming during server-side rendering (if any)
  setTimeout(() => {
    if (!isStripeConfigured()) {
      // Provide actionable advice in the message
      // eslint-disable-next-line no-console
      console.warn(
        '[Stripe] Configuration missing. Current values:',
        {
          publishableKey: stripeConfig.publishableKey || 'MISSING',
          environment: getStripeEnvironment(),
          envVars: {
            VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'MISSING',
            STRIPE_PUBLISHABLE_KEY: import.meta.env.STRIPE_PUBLISHABLE_KEY || 'MISSING'
          }
        },
        '\nTo fix: Set VITE_STRIPE_PUBLISHABLE_KEY in your Netlify site build environment variables.'
      );
    } else {
      // Log the Publishable Key being used (for debugging)
      // eslint-disable-next-line no-console
      console.log(`[Stripe] Frontend Publishable Key: ${stripeConfig.publishableKey.substring(0, 10)}...`);
    }
  }, 200);
}
