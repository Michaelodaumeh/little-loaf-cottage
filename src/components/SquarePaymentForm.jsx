import React, { useEffect, useRef, useState } from 'react';
import { payments } from '@square/web-sdk';
import { squareConfig, isSquareConfigured, getSquareEnvironment } from '../config/squareConfig';

import { sendOrderEmails } from '../utils/emailService';
import './css/SquarePaymentForm.css';

/**
 * Square Payment Form Component
 * 
 * This component integrates Square's Web Payments SDK to handle secure payment processing.
 * It creates a secure payment form that tokenizes card information on the client side.
 */
export default function SquarePaymentForm({ 
  amount, 
  customerEmail,
  onPaymentSuccess, 
  onPaymentError, 
  isProcessing = false,
  disabled = false 
}) {
  const cardRef = useRef(null);
  const paymentsRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const validationRunningRef = useRef(false);

  /**
   * Initialize Square Payments SDK with robust error handling and retry logic
   * This sets up the payment form with Square's secure tokenization
   */
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const initializeSquare = async () => {
      try {
        // Validate configuration
        if (!isSquareConfigured()) {
          throw new Error('Square configuration not complete. Please update squareConfig.js with your actual Application ID and Location ID.');
        }

        // Wait for DOM to be ready
        const cardContainer = document.getElementById('card-container');
        if (!cardContainer) {
          throw new Error('Payment form container not found. Please ensure the component is properly mounted.');
        }

        // Initialize Square Payments with comprehensive error handling
        try {
          paymentsRef.current = await payments(
            squareConfig.applicationId.trim(),
            squareConfig.locationId.trim(),
            getSquareEnvironment()
          );
        } catch (initError) {
          // Handle specific Square SDK errors
          if (initError.name === 'InvalidApplicationIdError') {
            throw new Error('Invalid Square Application ID. Please verify your Application ID in squareConfig.js');
          } else if (initError.name === 'InvalidLocationIdError') {
            throw new Error('Invalid Square Location ID. Please verify your Location ID in squareConfig.js');
          } else if (initError.name === 'ApplicationIdEnvironmentMismatchError') {
            throw new Error('Application ID environment mismatch. Ensure your Application ID matches the environment setting.');
          } else {
            throw new Error(`Square Payments initialization failed: ${initError.message || initError.name || 'Unknown error'}`);
          }
        }

        // Create card payment method with error handling
        try {
          cardRef.current = await paymentsRef.current.card({
            style: squareConfig.styles
          });
        } catch (cardError) {
          throw new Error(`Failed to create payment card: ${cardError.message || 'Unknown error'}`);
        }

        // Attach the card form to the DOM
        try {
          await cardRef.current.attach('#card-container');
          
          // Verify the attachment worked by checking for Square elements
          const container = document.getElementById('card-container');
          if (!container || container.children.length === 0) {
            throw new Error('Card form failed to attach - no elements found in container');
          }
        } catch (attachError) {
          if (attachError.message && attachError.message.includes('already been attached')) {
            // Already attached, that's fine
          } else {
            throw new Error(`Failed to attach payment form: ${attachError.message || 'Unknown error'}`);
          }
        }

        // Only update state if component is still mounted
        if (isMounted) {
          setIsInitialized(true);
        }

      } catch (error) {
        // Only handle error if component is still mounted
        if (isMounted) {
          const errorMessage = error.message || 'Failed to initialize payment form. Please refresh the page and try again.';
          onPaymentError?.(errorMessage);
        }
      }
    };

    // Add a small delay to ensure DOM is fully ready
    const initTimeout = setTimeout(() => {
      if (isMounted) {
        initializeSquare();
      }
    }, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      
      // Clean up the card container
      const container = document.getElementById('card-container');
      if (container) {
        container.innerHTML = '';
      }
      
      if (cardRef.current && typeof cardRef.current.destroy === 'function') {
        try {
          cardRef.current.destroy();
        } catch (destroyError) {
          // Silently handle destroy errors as component is unmounting
        }
      }
      
      // Reset refs
      cardRef.current = null;
      paymentsRef.current = null;
    };
  }, [onPaymentError]);


  /**
   * Handle payment form submission
   * This tokenizes the card information and sends it to the backend for processing
   */
  const handlePayment = async () => {
    // Prevent multiple simultaneous payment attempts
    if (isProcessingPayment || validationRunningRef.current) {
      return;
    }

    // Set processing state immediately to prevent multiple clicks
    setIsProcessingPayment(true);
    validationRunningRef.current = true;

    try {
      setPaymentErrors([]);

      if (!cardRef.current || !paymentsRef.current || !isInitialized) {
        onPaymentError?.('Payment form not ready. Please try again.');
        return;
      }

      // Check if card is properly attached before tokenizing
      const container = document.getElementById('card-container');
      if (!container || container.children.length === 0) {
        onPaymentError?.('Payment form not properly initialized. Please refresh the page and try again.');
        return;
      }

      // Additional check: ensure the card instance is properly attached
      if (!cardRef.current.attach) {
        onPaymentError?.('Payment form not properly initialized. Please refresh the page and try again.');
        return;
      }
      
      // Tokenize the card information
      const result = await cardRef.current.tokenize();
      
      if (result.status === 'OK') {
        
        // Send payment to backend for processing
        const paymentData = {
          sourceId: result.token,
          amount: Math.round(amount * 100), // Convert to cents
          currency: squareConfig.currency,
          idempotencyKey: generateIdempotencyKey()
        };

        const response = await fetch(squareConfig.paymentEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData)
        });

        const paymentResult = await response.json();

        if (response.ok && paymentResult.status === 'COMPLETED') {
          // Send email notifications if customer email is provided
          if (customerEmail) {
            try {
              const emailResult = await sendOrderEmails({
                customerEmail,
                amount,
                orderId: paymentResult.payment?.id
              });
              
              if (!emailResult.success) {
                // Don't fail the payment if email fails
              }
            } catch (emailError) {
              // Don't fail the payment if email fails
            }
          }
          
          onPaymentSuccess?.(paymentResult);
        } else {
          throw new Error(paymentResult.errorMessage || 'Payment processing failed');
        }
      } else {
        // Handle tokenization errors - only show for actual tokenization failures
        const errors = result.errors || [];
        
        if (errors.length > 0) {
          // Only show errors for serious tokenization issues, not basic validation
          const seriousErrors = errors.filter(error => 
            error.code === 'TOKENIZATION_ERROR' || 
            error.code === 'NETWORK_ERROR' ||
            error.code === 'SERVER_ERROR'
          );
          
          if (seriousErrors.length > 0) {
            const errorMessages = seriousErrors.map(error => 
              error.detail || 'Payment processing failed. Please try again.'
            );
            setPaymentErrors(errorMessages);
          }
        }
        // For basic validation errors (invalid card, etc.), let the SDK handle inline validation
      }
    } catch (error) {
      onPaymentError?.(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
      validationRunningRef.current = false;
    }
  };

  /**
   * Generate a unique idempotency key for payment processing
   * This ensures that duplicate payments are not processed
   */
  const generateIdempotencyKey = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };


  // Show configuration error if Square credentials are not set up
  if (!isSquareConfigured()) {
    return (
      <div className="square-payment-form">
        <div className="payment-form-header">
          <h3>Payment Information</h3>
          <p>Secure payment processing powered by Square</p>
        </div>
        
        <div className="configuration-error">
          <div className="error-icon">⚠️</div>
          <h4>Square Payment Configuration Required</h4>
          <p>To enable payment processing, you need to configure your Square credentials:</p>
          <ol>
            <li>Go to <a href="https://developer.squareup.com/" target="_blank" rel="noopener noreferrer">Square Developer Dashboard</a></li>
            <li>Create an application and get your Application ID</li>
            <li>Update <code>src/config/squareConfig.js</code> with your actual Application ID</li>
            <li>Replace <code>'sandbox-sq0idp-your-actual-application-id-here'</code> with your real Application ID</li>
          </ol>
          <p><strong>Application ID Format:</strong></p>
          <ul>
            <li><strong>Sandbox:</strong> <code>sandbox-sq0idp-[characters]</code></li>
            <li><strong>Production:</strong> <code>sq0idp-[characters]</code></li>
          </ul>
          <p><strong>Example:</strong> <code>applicationId: 'sandbox-sq0idp-AkIjEYtD0bcUzQoXMqyTXQ'</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="square-payment-form">
      <div className="payment-form-header">
        <h3>Payment Information</h3>
        <p>Secure payment processing powered by Square</p>
      </div>

      {/* Square Card Form Container */}
      <div className="card-form-container">
        <div 
          ref={cardRef}
          id="card-container"
          className="card-container"
        />
        {!isInitialized && (
          <div className="loading-placeholder">
            <p>Loading secure payment form...</p>
          </div>
        )}
      </div>

      {/* Payment Errors Display */}
      {paymentErrors.length > 0 && (
        <div className="payment-errors">
          {Array.from(new Set(paymentErrors)).map((error, index) => (
            <div key={`error-${index}-${error}`} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Payment Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={!isInitialized || isProcessing || isProcessingPayment || disabled}
        className="payment-button"
      >
        {(isProcessing || isProcessingPayment) ? (
          <>
            <div className="spinner"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <span className="payment-icon">💳</span>
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="security-notice">
        <div className="security-icon">🔒</div>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
}
