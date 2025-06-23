// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
// You should configure this with your actual email service provider details.
// For Gmail, use these settings. For other providers, refer to their documentation.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', // e.g., smtp.sendgrid.net, smtp.mailgun.org
  port: process.env.EMAIL_PORT || 587, // Common ports: 587 (TLS), 465 (SSL)
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

/**
 * Sends an email notification.
 * @param {object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.text - Plain text body.
 * @param {string} [options.html] - HTML body (optional).
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER, // Sender address
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error);
    // You might want to log this error more persistently or alert an admin
  }
};

module.exports = sendEmail;