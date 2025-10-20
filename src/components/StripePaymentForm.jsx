import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { stripeConfig, isStripeConfigured, getStripeEnvironment } from '../config/stripeConfig';
import { sendOrderEmails } from '../utils/emailService';
import './css/SquarePaymentForm.css'; // Reuse the same CSS

// Payment form component using Stripe Elements
const StripePaymentForm = ({ 
  amount, 
  customerEmail, 
  onPaymentSuccess, 
  onPaymentError,
  disabled = false 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || disabled) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get the card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: customerEmail,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Send payment to backend
      const response = await fetch(stripeConfig.paymentEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: Math.round(amount * 100), // Convert to cents
          currency: stripeConfig.currency,
          customerEmail,
        }),
      });

      let paymentResult = {};
      let responseText = '';
      
      try {
        // Get response text first to debug empty responses
        responseText = await response.text();
        if (responseText.trim()) {
          paymentResult = JSON.parse(responseText);
        } else {
          console.warn('[Stripe][debug] Empty response from payment endpoint');
          paymentResult = { status: 'FAILED', error: 'Empty response from server' };
        }
      } catch (jsonErr) {
        // eslint-disable-next-line no-console
        console.error('[Stripe][debug] failed to parse payment response JSON', {
          error: jsonErr,
          responseText,
          status: response.status,
          statusText: response.statusText
        });
        paymentResult = { status: 'FAILED', error: 'Invalid response from server' };
      }

      if (import.meta.env.VITE_DEBUG_STRIPE === 'true' && typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.log('[Stripe][debug] payment endpoint response', { status: response.status, body: paymentResult });
      }

      if (response.ok && paymentResult.status === 'succeeded') {
        // Send email notifications if customer email is provided
        if (customerEmail) {
          try {
            const emailResult = await sendOrderEmails({
              customerEmail,
              amount,
              orderId: paymentResult.paymentIntent?.id
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
        // Provide more specific error messages
        let errorMessage = 'Payment processing failed';
        
        if (!response.ok) {
          if (response.status === 500) {
            errorMessage = paymentResult.error || 'Server error. Please try again.';
          } else if (response.status === 400) {
            errorMessage = paymentResult.error || 'Invalid payment information.';
          } else {
            errorMessage = `Server error (${response.status}). Please try again.`;
          }
        } else if (paymentResult.error) {
          errorMessage = paymentResult.error;
        } else if (paymentResult.errorMessage) {
          errorMessage = paymentResult.errorMessage;
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || 'Payment processing failed';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (event) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
    setIsComplete(event.complete);
  };

  if (!isStripeConfigured()) {
    return (
      <div className="payment-form-container">
        <div className="payment-error">
          <h3>Payment Configuration Error</h3>
          <p>Stripe configuration not complete. Please update stripeConfig.js with your actual Publishable Key.</p>
          <p>Environment: {getStripeEnvironment()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-section">
          <h3>Payment Information</h3>
          
          <div className="card-element-container">
            <CardElement
              options={{
                style: stripeConfig.appearance,
                hidePostalCode: true,
              }}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="payment-error">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || !isComplete || isProcessing || disabled}
            className="payment-button"
          >
            {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main component that wraps Stripe Elements
const StripePaymentFormWrapper = (props) => {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    if (isStripeConfigured()) {
      const stripe = loadStripe(stripeConfig.publishableKey);
      setStripePromise(stripe);
    }
  }, []);

  if (!stripePromise) {
    return (
      <div className="payment-form-container">
        <div className="payment-error">
          <h3>Loading Payment Form...</h3>
          <p>Please wait while we initialize the payment system.</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentFormWrapper;
