/**
 * Square Payment Configuration
 * 
 * This file contains the configuration for Square payment processing.
 * All sensitive values are loaded from environment variables.
 */

// Square configuration using environment variables
export const squareConfig = {
  // Square Application ID (public key - safe to expose)
  applicationId: import.meta.env.VITE_SQUARE_APPLICATION_ID || '',
  
  // Square Location ID (public - safe to expose)
  locationId: import.meta.env.VITE_SQUARE_LOCATION_ID || '',
  
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
  
  // Debug logging to help troubleshoot deployment issues
  if (typeof window !== 'undefined') {
    console.log('🔍 Square Configuration Debug:', {
      applicationId: squareConfig.applicationId || 'MISSING',
      locationId: squareConfig.locationId || 'MISSING',
      environment: getSquareEnvironment(),
      hasAppId,
      hasLocationId,
      isConfigured: hasAppId && hasLocationId,
      envVars: {
        VITE_SQUARE_APPLICATION_ID: import.meta.env.VITE_SQUARE_APPLICATION_ID || 'MISSING',
        VITE_SQUARE_LOCATION_ID: import.meta.env.VITE_SQUARE_LOCATION_ID || 'MISSING',
        VITE_SQUARE_ENVIRONMENT: import.meta.env.VITE_SQUARE_ENVIRONMENT || 'MISSING'
      }
    });
  }
  
  return hasAppId && hasLocationId;
};

// Get Square environment (sandbox or production)
export const getSquareEnvironment = () => {
  return import.meta.env.VITE_SQUARE_ENVIRONMENT || 'sandbox';
};

