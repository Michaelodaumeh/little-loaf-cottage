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
  const { to, subject, text, html, from } = JSON.parse(event.body || '{}');

  const debug = process.env.DEBUG_SEND_EMAIL === 'true';

  // Basic email format check (simple, not exhaustive)
  const isValidEmail = (addr) => typeof addr === 'string' && /.+@.+\..+/.test(addr);

  // Log incoming payload (safe to log recipient/subject; do NOT log API keys)
  // Netlify function logs are visible in the site deploy/function logs
  // This helps diagnose misconfigurations like missing recipients or bad env
  // eslint-disable-next-line no-console
  console.log('send-email request:', { to, subject, from: from || process.env.FROM_EMAIL });

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

    if (!isValidEmail(to)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'FAILED',
          error: 'Invalid recipient email address'
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
    try {
      const sgResponse = await sgMail.send(msg);

      // Log SendGrid response summary for debugging
      // eslint-disable-next-line no-console
      console.log('SendGrid response:', Array.isArray(sgResponse) ? sgResponse.map(r => ({ statusCode: r.statusCode })) : { statusCode: sgResponse && sgResponse.statusCode });

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debug ? { status: 'SENT', message: 'Email sent successfully', detail: sgResponse } : { status: 'SENT', message: 'Email sent successfully' }),
      };
    } catch (sendError) {
      // Log detailed SendGrid error to function logs
      // eslint-disable-next-line no-console
      console.error('SendGrid send error:', sendError);
      let errorMessage = 'Email sending failed';
      let sgErrors = null;
      if (sendError && sendError.response && sendError.response.body) {
        sgErrors = sendError.response.body;
        if (sgErrors && sgErrors.errors && sgErrors.errors.length) {
          errorMessage = sgErrors.errors.map(err => err.message).join(', ');
        }
      }

      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debug ? { status: 'FAILED', error: errorMessage, detail: sgErrors } : { status: 'FAILED', error: errorMessage }),
      };
    }

  } catch (error) {
    // Fallback catch-all (shouldn't be reached due to inner try/catch)
    // eslint-disable-next-line no-console
    console.error('Unexpected send-email error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'FAILED',
        error: 'Unexpected server error'
      }),
    };
  }
};
