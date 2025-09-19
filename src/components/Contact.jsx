import { useState } from "react";
import { sendEmail } from '../utils/emailService';
import "./css/Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    
    try {
      // Send contact form email to business using SendGrid
      await sendEmail({
        to: 'littleloafcottagebakery@gmail.com',
        subject: `Contact Form: ${formData.subject}`,
        text: `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">New Contact Form Submission</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${formData.name}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Subject:</strong> ${formData.subject}</p>
            </div>
            <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${formData.message}</p>
            </div>
          </div>
        `
      });
      
      setIsSubmitting(false);
      
      // Check if this was a local development skip
      if (result.status === 'LOCAL_DEV_SKIP') {
        alert('Message would be sent in production! For now, please contact us directly at littleloafcottagebakery@gmail.com');
      } else {
        setShowSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      setIsSubmitting(false);
      alert('Failed to send message. Please try again or contact us directly at littleloafcottagebakery@gmail.com');
    }
  };

  return (
    <div className="page">
      <div className="page-content">
        <div className="text-center mb-5">
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you! Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="card" style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
          <h4>Special Orders</h4>
          <p>
            Need something special for an event or celebration? 
            We love creating custom orders! Please contact us at least 
            48 hours in advance for special requests.
          </p>
        </div>

        <div className="contact-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
          {/* Contact Information */}
          <div>
            <h3>Contact Information</h3>
            
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">📧</div>
                <h4>Email</h4>
                <p>littleloafcottage@gmail.com</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  We typically respond within 24 hours
                </p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h4>Phone</h4>
                <p>(555) 123-4567</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  Mon-Fri: 8 AM - 6 PM<br />
                  Sat-Sun: 9 AM - 4 PM
                </p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h4>Location</h4>
                <p>123 Baker Street<br />
                Breadville, BV 12345</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  Visit our cozy bakery for fresh bread and pastries
                </p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">🕒</div>
                <h4>Hours</h4>
                <p>
                  Monday - Friday: 7 AM - 7 PM<br />
                  Saturday: 8 AM - 6 PM<br />
                  Sunday: 9 AM - 5 PM
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  Fresh bread baked daily!
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form className="order-form" onSubmit={handleSubmit}>
              <h3>Send us a Message</h3>
              
              {showSuccess && (
                <div className="message success">
                  Thank you for your message! We'll get back to you soon. 🎉
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Question</option>
                  <option value="special">Special Order</option>
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
                  placeholder="Tell us how we can help you..."
                  rows="5"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: '20px', height: '20px', marginRight: 'var(--spacing-xs)' }}></div>
                    Sending Message...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
