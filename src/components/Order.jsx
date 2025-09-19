import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOrder } from "../contexts/OrderContext";
import SquarePaymentForm from './SquarePaymentForm';
import "./css/Order.css";

export default function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems: contextItems, addToOrder, removeFromOrder, clearOrder } = useOrder();
  const selectedItems = location.state?.selectedItems || contextItems;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    deliveryDate: '',
    deliveryTime: '',
    specialInstructions: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'payment', 'success'
  const [paymentError, setPaymentError] = useState('');

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.price, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
    if (!formData.deliveryDate) errors.deliveryDate = 'Delivery date is required';
    if (!formData.deliveryTime) errors.deliveryTime = 'Delivery time is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Move to payment step
    setPaymentStep('payment');
    setFormErrors({});
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setIsSubmitting(true);
    setPaymentError('');
    
    try {
      const totalPrice = getTotalPrice();
      
      // Email notifications are now handled automatically by SquarePaymentForm
      
      setIsSubmitting(false);
      setPaymentStep('success');
      clearOrder(); // Clear the order from context
      
      // Redirect to home after 5 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      setIsSubmitting(false);
      setPaymentError('Payment successful, but failed to send confirmation emails. Your order has been processed.');
      setPaymentStep('success');
    }
  };

  const handlePaymentError = (error) => {
    setPaymentError(error);
    setIsSubmitting(false);
  };

  if (selectedItems.length === 0) {
    return (
      <div className="page">
        <div className="page-content text-center">
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious items from our menu to get started!</p>
            <button 
              onClick={() => navigate('/menu')} 
              className="btn-primary"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="page">
        <div className="page-content text-center">
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your order! We'll contact you soon to confirm the details.</p>
            {paymentError && (
              <div style={{ 
                background: '#fff3cd', 
                color: '#856404', 
                padding: 'var(--spacing-sm)', 
                borderRadius: 'var(--radius-sm)', 
                marginBottom: 'var(--spacing-md)',
                border: '1px solid #ffeaa7'
              }}>
                {paymentError}
              </div>
            )}
            <p>Redirecting to home page...</p>
            <div className="loading">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="text-center mb-5">
          <h2>Complete Your Order</h2>
          <p>Please fill out the form below to place your order</p>
        </div>

        <div className="order-page-grid">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            {(() => {
              // Group items by name and show unique items with quantities
              const uniqueItems = selectedItems.reduce((acc, item) => {
                const existing = acc.find(i => i.name === item.name);
                if (existing) {
                  existing.quantity += 1;
                } else {
                  acc.push({ ...item, quantity: 1 });
                }
                return acc;
              }, []);
              
              return uniqueItems.map((item, index) => (
                <div key={index} className="order-item">
                  {/* Item Image */}
                  <div style={{ width: '60px', height: '60px', marginRight: 'var(--spacing-md)', flexShrink: 0 }}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)'
                      }}
                      onError={(e) => {
                        // If image fails to load, show emoji fallback
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      style={{ 
                        display: 'none', 
                        width: '100%', 
                        height: '100%', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '2rem',
                        backgroundColor: 'var(--soft-gray)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)'
                      }} 
                      aria-hidden="true"
                    >
                      <span>{item.emoji}</span>
                    </div>
                  </div>
                  
                  {/* Item Details */}
                  <div style={{ flex: 1 }}>
                    <strong>{item.name}</strong>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>
                      {item.description}
                    </p>
                  </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginRight: 'var(--spacing-sm)' }}>
                    <button 
                      onClick={() => {
                        // Remove one instance of this item
                        const itemIndex = selectedItems.findIndex(selectedItem => selectedItem.name === item.name);
                        if (itemIndex !== -1) {
                          removeFromOrder(itemIndex);
                        }
                      }}
                      style={{ 
                        background: 'var(--soft-gray)', 
                        border: '1px solid var(--border-light)', 
                        color: 'var(--text-muted)', 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        transition: 'all var(--transition-fast)', 
                        fontSize: '0.9rem', 
                        fontWeight: '600'
                      }}
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <span style={{ 
                      minWidth: '20px', 
                      textAlign: 'center', 
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--text-dark)'
                    }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => addToOrder(item)}
                      style={{ 
                        background: 'var(--primary-pink)', 
                        border: '1px solid var(--primary-pink)', 
                        color: 'white', 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        transition: 'all var(--transition-fast)', 
                        fontSize: '0.9rem', 
                        fontWeight: '600'
                      }}
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Price */}
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-pink)', minWidth: '60px' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => {
                      // Remove all instances of this item
                      const indicesToRemove = selectedItems
                        .map((selectedItem, idx) => selectedItem.name === item.name ? idx : -1)
                        .filter(idx => idx !== -1)
                        .reverse(); // Remove from end to avoid index shifting
                      
                      indicesToRemove.forEach(idx => removeFromOrder(idx));
                    }}
                    className="remove-btn"
                    title="Remove all of this item"
                    style={{ 
                      background: 'var(--soft-gray)', 
                      border: '1px solid var(--border-light)', 
                      color: 'var(--text-muted)', 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      transition: 'all var(--transition-fast)', 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ff4757';
                      e.target.style.color = 'white';
                      e.target.style.borderColor = '#ff4757';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'var(--soft-gray)';
                      e.target.style.color = 'var(--text-muted)';
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
              ));
            })()}
            <div className="order-total">
              Total: ${getTotalPrice().toFixed(2)}
            </div>
          </div>

          {/* Order Form */}
          <form className="order-form" onSubmit={handleFormSubmit} noValidate>
            <h3>Delivery Information</h3>
            
            {formErrors.submit && (
              <div className="error-message" style={{ 
                background: '#fee', 
                color: '#c33', 
                padding: 'var(--spacing-sm)', 
                borderRadius: 'var(--radius-sm)', 
                marginBottom: 'var(--spacing-md)',
                border: '1px solid #fcc'
              }}>
                {formErrors.submit}
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  aria-invalid={formErrors.name ? 'true' : 'false'}
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                />
                {formErrors.name && (
                  <div id="name-error" className="field-error">{formErrors.name}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="deliveryDate">Preferred Delivery Date *</label>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deliveryTime">Preferred Delivery Time *</label>
              <select
                id="deliveryTime"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a time</option>
                <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                <option value="evening">Evening (5:00 PM - 8:00 PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="specialInstructions">Special Instructions</label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any special requests or delivery instructions..."
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              Continue to Payment
            </button>
          </form>

          {/* Payment Form - Only show when payment step is active */}
          {paymentStep === 'payment' && (
            <div className="payment-section">
              <div className="payment-header">
                <h3>Complete Your Payment</h3>
                <p>Secure payment processing for your order</p>
              </div>
              
              {paymentError && (
                <div className="error-message" style={{ 
                  background: '#fee', 
                  color: '#c33', 
                  padding: 'var(--spacing-sm)', 
                  borderRadius: 'var(--radius-sm)', 
                  marginBottom: 'var(--spacing-md)',
                  border: '1px solid #fcc'
                }}>
                  {paymentError}
                </div>
              )}

              <SquarePaymentForm
                amount={getTotalPrice()}
                customerEmail={formData.email}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                isProcessing={isSubmitting}
              />

              <div className="payment-actions">
                <button 
                  type="button"
                  onClick={() => setPaymentStep('form')}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  ← Back to Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}