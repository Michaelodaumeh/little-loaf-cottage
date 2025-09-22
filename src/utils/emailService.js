/**
 * Email Service Utility for Little Loaf Cottage
 * 
 * This utility handles sending email notifications for orders and payments.
 * It uses the Netlify serverless function for email delivery via SendGrid.
 */

/**
 * Send email using the Netlify serverless function
 * @param {Object} emailData - Email data object
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.text - Plain text content
 * @param {string} emailData.html - HTML content (optional)
 * @param {string} emailData.from - Sender email (optional, defaults to bakery email)
 * @returns {Promise<Object>} Response from email service
 */
export const sendEmail = async (emailData) => {
  try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    // Check if the response is valid JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Invalid response from email service: ${text}`);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      throw new Error(`Failed to parse JSON response: ${text}`);
    }

    if (!response.ok) {
      throw new Error(result.error || `Email sending failed with status ${response.status}`);
    }

    // Check if the email was actually sent
    if (result.status !== 'SENT') {
      throw new Error(result.error || 'Email sending failed');
    }

    return result;
  } catch (error) {
    // For local development, show a helpful message instead of failing
    if (error.message.includes('404') || error.message.includes('Failed to fetch') || error.message.includes('Email service not configured')) {
      return {
        status: 'LOCAL_DEV_SKIP',
        message: 'Email sending skipped in local development'
      };
    }
    
    throw error;
  }
};

/**
 * Send order confirmation email to customer
 * @param {Object} orderData - Order information
 * @param {string} orderData.customerEmail - Customer's email address
 * @param {number} orderData.amount - Order amount
 * @param {string} orderData.orderId - Order ID (optional)
 * @returns {Promise<Object>} Email sending result
 */
export const sendOrderConfirmation = async ({ customerEmail, amount, orderId }) => {
  const subject = 'Thank You for Your Order - Little Loaf Cottage';
  
  const text = `Hi there!

Thank you for your order at Little Loaf Cottage! 

Order Details:
- Amount: $${amount.toFixed(2)}
${orderId ? `- Order ID: ${orderId}` : ''}

We're preparing your delicious baked goods and will have them ready soon. You'll receive another email when your order is ready for pickup.

Thank you for choosing Little Loaf Cottage!

Best regards,
The Little Loaf Cottage Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e91e63;">Thank You for Your Order!</h2>
      
      <p>Hi there!</p>
      
      <p>Thank you for your order at <strong>Little Loaf Cottage</strong>!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ''}
      </div>
      
      <p>We're preparing your delicious baked goods and will have them ready soon. You'll receive another email when your order is ready for pickup.</p>
      
      <p>Thank you for choosing Little Loaf Cottage!</p>
      
      <p>Best regards,<br>
      The Little Loaf Cottage Team</p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    text,
    html
  });
};

/**
 * Send order notification email to admin
 * @param {Object} orderData - Order information
 * @param {string} orderData.customerEmail - Customer's email address
 * @param {number} orderData.amount - Order amount
 * @param {string} orderData.orderId - Order ID (optional)
 * @returns {Promise<Object>} Email sending result
 */
export const sendAdminNotification = async ({ customerEmail, amount, orderId }) => {
  const subject = 'New Order Received - Little Loaf Cottage';
  
  const text = `New Order Alert!

A new order has been placed on Little Loaf Cottage:

Order Details:
- Customer Email: ${customerEmail}
- Amount: $${amount.toFixed(2)}
${orderId ? `- Order ID: ${orderId}` : ''}
- Payment Status: Completed

Please prepare the order and notify the customer when ready.

Order Management System`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e91e63;">New Order Alert!</h2>
      
      <p>A new order has been placed on <strong>Little Loaf Cottage</strong>:</p>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">Order Details:</h3>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ''}
        <p><strong>Payment Status:</strong> <span style="color: green;">Completed</span></p>
      </div>
      
      <p>Please prepare the order and notify the customer when ready.</p>
      
      <p><strong>Order Management System</strong></p>
    </div>
  `;

  return sendEmail({
    to: import.meta.env.VITE_ADMIN_EMAIL || "", // Admin email
    subject,
    text,
    html
  });
};

/**
 * Send both customer confirmation and admin notification
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Results from both emails
 */
export const sendOrderEmails = async (orderData) => {
  try {
    // Send emails in parallel
    const [customerResult, adminResult] = await Promise.all([
      sendOrderConfirmation(orderData),
      sendAdminNotification(orderData)
    ]);

    return {
      success: true,
      customerEmail: customerResult,
      adminEmail: adminResult
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
