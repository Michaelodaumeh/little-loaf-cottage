/**
 * Netlify Serverless Function for SendGrid Email Notifications
 * 
 * This function handles sending email notifications for Little Loaf Cottage.
 * It sends order confirmations to customers and notifications to admin.
 * 
 * Environment Variables Required:
 * - This function uses SendGrid; the API key is stored in an environment variable
 */

import sgMail from '@sendgrid/mail';

export const handler = async (event) => {
  try {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: '',
      };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Method not allowed',
          status: 'FAILED'
        }),
      };
    }

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'FAILED',
          error: 'Email service not configured'
        }),
      };
    }

    // Set SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Parse request body
    const { to, subject, text, html, from } = JSON.parse(event.body);

    // Validate required fields
    if (!to || !subject || !text) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'FAILED',
          error: 'Missing required fields: to, subject, text'
        }),
      };
    }

    // Prepare email message
    const msg = {
      to: to,
      from: from || process.env.FROM_EMAIL || 'no-reply@example.com', // Default placeholder sender (replace in env)
      subject: subject,
      text: text,
      html: html || text, // Use text as HTML if no HTML provided
    };

    // Send email
    await sgMail.send(msg);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'SENT',
        message: 'Email sent successfully'
      }),
    };

  } catch (error) {
    // Handle specific SendGrid errors
    let errorMessage = 'Email sending failed';
    if (error.response) {
      const { body } = error.response;
      if (body && body.errors && body.errors.length > 0) {
        errorMessage = body.errors.map(err => err.message).join(', ');
      }
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'FAILED',
        error: errorMessage
      }),
    };
  }
};
