/**
 * Square Payment Configuration
 * 
 * This file contains the configuration for Square payment processing.
 * All sensitive values are loaded from environment variables.
 */

/* global __SQUARE_APP_ID__, __SQUARE_LOCATION_ID__, __SQUARE_ENVIRONMENT__ */

// Square configuration using environment variables
// Note: Vite exposes environment variables that start with VITE_ to the client.
// For local dev and builds with Vite, use VITE_SQUARE_APPLICATION_ID and VITE_SQUARE_LOCATION_ID.
// When deploying to Netlify, set the same build environment variables (VITE_ prefixed)
// so they are embedded into the client bundle at build time.
export const squareConfig = {
  // Square Application ID (public key - safe to expose to client-side)
  // Prefer VITE_ prefixed vars (Vite) -> import.meta.env.VITE_SQUARE_APPLICATION_ID
  applicationId:
    import.meta.env.VITE_SQUARE_APPLICATION_ID ||
    import.meta.env.SQUARE_APPLICATION_ID ||
    typeof __SQUARE_APP_ID__ !== 'undefined' && __SQUARE_APP_ID__ ||
    '',

  // Square Location ID (public - safe to expose)
  locationId:
    import.meta.env.VITE_SQUARE_LOCATION_ID ||
    import.meta.env.SQUARE_LOCATION_ID ||
    typeof __SQUARE_LOCATION_ID__ !== 'undefined' && __SQUARE_LOCATION_ID__ ||
    '',

  // Payment processing endpoint
  paymentEndpoint: '/.netlify/functions/process-payment',
  
  // Currency
  currency: 'USD',
  
  // Card form styling (only Square-supported CSS properties)
  styles: {
    // Base input styling
    '.input-container': {
      borderColor: '#e0e0e0',
      borderRadius: '8px',
    },
    // Focus state
    '.input-container.is-focus': {
      borderColor: '#e91e63',
    },
    // Error state
    '.input-container.is-error': {
      borderColor: '#f44336',
    },
    // Message text styling
    '.message-text': {
      color: '#666666',
    },
    '.message-text.is-error': {
      color: '#f44336',
    }
  }
};

// Validation function to check if Square is properly configured
export const isSquareConfigured = () => {
  const hasAppId = !!squareConfig.applicationId;
  const hasLocationId = !!squareConfig.locationId;
  
  return hasAppId && hasLocationId;
};

// Get Square environment (sandbox or production)
export const getSquareEnvironment = () => {
  return (
    import.meta.env.VITE_SQUARE_ENVIRONMENT ||
    import.meta.env.SQUARE_ENVIRONMENT ||
    (typeof __SQUARE_ENVIRONMENT__ !== 'undefined' && __SQUARE_ENVIRONMENT__) ||
    'sandbox'
  );
};

// Helper: warn at runtime if config is missing (useful to debug deployed builds)
if (typeof window !== 'undefined') {
  // Delay to avoid spamming during server-side rendering (if any)
  setTimeout(() => {
    if (!isSquareConfigured()) {
      // Provide actionable advice in the message
      // eslint-disable-next-line no-console
      console.warn(
        '[Square] applicationId or locationId is missing.\n' +
          'Set VITE_SQUARE_APPLICATION_ID and VITE_SQUARE_LOCATION_ID in your .env (for local dev)\n' +
          'and in your Netlify site build environment variables (for deployed builds).'
      );
    }
  }, 200);
}

