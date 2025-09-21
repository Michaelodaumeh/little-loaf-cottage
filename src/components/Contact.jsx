import { useState } from 'react';
import './css/Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate form submission (replace with actual email service)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-content">
        {/* Page Header */}
        <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            color: 'var(--primary-pink)', 
            marginBottom: 'var(--spacing-md)',
            fontWeight: '700'
          }}>
            Contact Us
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-light)', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            We'd love to hear from you! Get in touch with us for orders, questions, or just to say hello.
          </p>
        </div>

        {/* Contact Page Grid */}
        <div className="contact-page-grid">
          {/* Contact Information */}
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              color: 'var(--text-dark)', 
              marginBottom: 'var(--spacing-lg)',
              fontWeight: '600'
            }}>
              Get In Touch
            </h2>
            
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h4>Visit Us</h4>
                <p><strong>Little Loaf Cottage</strong></p>
                <p>123 Bakery Street</p>
                <p>Sweetville, CA 90210</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h4>Call Us</h4>
                <p><strong>Phone:</strong></p>
                <p>(555) 123-BAKE</p>
                <p><strong>Hours:</strong></p>
                <p>Mon-Sat: 6AM-6PM</p>
                <p>Sun: 7AM-4PM</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">✉️</div>
                <h4>Email Us</h4>
                <p><strong>General:</strong></p>
                <p>{import.meta.env.VITE_GENERAL_EMAIL || 'hello@littleloafcottage.com'}</p>
                <p><strong>Orders:</strong></p>
                <p>{import.meta.env.VITE_ORDERS_EMAIL || 'orders@littleloafcottage.com'}</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">🕒</div>
                <h4>Special Orders</h4>
                <p>Need something special?</p>
                <p>Contact us at least 24 hours in advance for custom orders and large quantities.</p>
              </div>
            </div>

            {/* Special Delivery Section */}
            <div style={{ 
              marginTop: 'var(--spacing-2xl)',
              padding: 'var(--spacing-xl)',
              background: 'linear-gradient(135deg, var(--soft-pink) 0%, var(--warm-white) 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--light-brown)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                color: 'var(--primary-pink)', 
                marginBottom: 'var(--spacing-md)',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                🚚 Special Delivery Service
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: 'var(--spacing-lg)',
                textAlign: 'center'
              }}>
                <div>
                  <h4 style={{ 
                    color: 'var(--text-dark)', 
                    marginBottom: 'var(--spacing-sm)',
                    fontWeight: '600'
                  }}>
                    🏠 Local Delivery
                  </h4>
                  <p style={{ color: 'var(--text-light)', lineHeight: '1.5' }}>
                    Free delivery within 5 miles for orders over $25. 
                    Same-day delivery available for orders placed before 2PM.
                  </p>
                </div>
                
                <div>
                  <h4 style={{ 
                    color: 'var(--text-dark)', 
                    marginBottom: 'var(--spacing-sm)',
                    fontWeight: '600'
                  }}>
                    🎂 Special Occasions
                  </h4>
                  <p style={{ color: 'var(--text-light)', lineHeight: '1.5' }}>
                    Birthday cakes, wedding orders, and corporate events. 
                    We'll coordinate pickup or delivery to make your day special.
                  </p>
                </div>
                
                <div>
                  <h4 style={{ 
                    color: 'var(--text-dark)', 
                    marginBottom: 'var(--spacing-sm)',
                    fontWeight: '600'
                  }}>
                    ⏰ Order Ahead
                  </h4>
                  <p style={{ color: 'var(--text-light)', lineHeight: '1.5' }}>
                    Place your order 24 hours in advance for guaranteed availability. 
                    We'll have everything fresh and ready for you!
                  </p>
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                marginTop: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(233, 30, 99, 0.2)'
              }}>
                <p style={{ 
                  color: 'var(--primary-pink)', 
                  fontWeight: '600',
                  margin: 0,
                  fontSize: '1.1rem'
                }}>
                  📞 Call (555) 123-BAKE or email us to arrange special delivery!
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="order-form">
              <h3>Send Us a Message</h3>
              
              {submitStatus === 'success' && (
                <div className="message success">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="message error">
                  Sorry, there was an error sending your message. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--light-brown)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '1rem'
                      }}
                    />
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
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--light-brown)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm)',
                      border: '1px solid var(--light-brown)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm)',
                      border: '1px solid var(--light-brown)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Question</option>
                    <option value="custom">Custom Order</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm)',
                      border: '1px solid var(--light-brown)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--primary-pink)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all var(--transition-normal)'
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = 'var(--dark-pink)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = 'var(--primary-pink)';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <div className="loading">
                      <div className="spinner"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
