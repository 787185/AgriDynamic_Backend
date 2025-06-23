const asyncHandler = require('express-async-handler'); // Assuming you use express-async-handler
const Enquiry = require('../models/enquiryModel');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a new enquiry
// @route   POST /api/enquiries
// @access  Public
const submitEnquiry = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // Basic server-side validation
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Please fill in all required fields (name, email, message).');
  }

  const enquiry = await Enquiry.create({
    name,
    email,
    message,
  });

  if (enquiry) {
    // --- Send email notification ---
    const adminEmail = process.env.ADMIN_EMAIL; // Ensure this env var is set
    if (adminEmail) {
      const subject = `New Enquiry from AgriDynamic Website: ${name}`;
      const text = `
        You have received a new enquiry from the AgriDynamic website:

        Name: ${name}
        Email: ${email}
        Message:
        ${message}
      `;
      const html = `
        <p>You have received a new enquiry from the AgriDynamic website:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <small>This is an automated notification. Please do not reply to this email.</small>
      `;

      // Sending email in the background; it shouldn't block the API response
      sendEmail({
        to: adminEmail,
        subject: subject,
        text: text,
        html: html,
      });
    } else {
      console.warn('ADMIN_EMAIL environment variable not set. Email notification skipped.');
    }
    // --- End email notification ---

    res.status(201).json({
      message: 'Your message has been sent successfully! We will get back to you soon.',
      _id: enquiry._id,
      name: enquiry.name,
      email: enquiry.email,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid enquiry data received.');
  }
});

// @desc    Get all enquiries (for admin dashboard)
// @route   GET /api/enquiries
// @access  Private (Admin only) - You'll add authentication middleware later
const getEnquiries = asyncHandler(async (req, res) => {
  // Sort by creation date, newest first
  const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
  res.status(200).json(enquiries);
});

// @desc    Update an enquiry (e.g., change status, edit message)
// @route   PUT /api/enquiries/:id
// @access  Private (Admin only) - You'll add authentication middleware later
const updateEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, message, status } = req.body;

  const enquiry = await Enquiry.findById(id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found.');
  }

  enquiry.name = name || enquiry.name;
  enquiry.email = email || enquiry.email;
  enquiry.message = message || enquiry.message;
  enquiry.status = status || enquiry.status; // Allow updating status

  const updatedEnquiry = await enquiry.save();

  // --- Send email reply to the user if a replyMessage is provided ---
  if (replyMessage && updatedEnquiry.email) {
    const subject = `Update on your enquiry to AgriDynamic: "${updatedEnquiry.title || 'No Subject'}"`; // Use title if available, otherwise generic
    const text = `
      Dear ${updatedEnquiry.name || 'Valued Customer'},

      Thank you for your enquiry to AgriDynamic.

      Regarding your original message:
      "${updatedEnquiry.message}"

      Here is our response:
      ${replyMessage}

      Your enquiry status has been updated to: ${updatedEnquiry.status}

      If you have any further questions, please do not hesitate to reach out.

      Sincerely,
      The AgriDynamic Team
    `;
    const html = `
      <p>Dear ${updatedEnquiry.name || 'Valued Customer'},</p>
      <p>Thank you for your enquiry to AgriDynamic.</p>
      <p>Regarding your original message:</p>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0;">
        <em>"${updatedEnquiry.message.replace(/\n/g, '<br>')}"</em>
      </blockquote>
      <p>Here is our response:</p>
      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px;">
        <p>${replyMessage.replace(/\n/g, '<br>')}</p>
      </div>
      <p>Your enquiry status has been updated to: <strong>${updatedEnquiry.status}</strong></p>
      <p>If you have any further questions, please do not hesitate to reach out.</p>
      <p>Sincerely,<br>The AgriDynamic Team</p>
    `;

    // Send email in the background
    sendEmail({
      to: updatedEnquiry.email,
      subject: subject,
      text: text,
      html: html,
    });
    console.log(`Reply email sent to ${updatedEnquiry.email}`);
  }
  // --- End email reply ---

  res.status(200).json({
    message: 'Enquiry updated successfully!',
    _id: updatedEnquiry._id,
    name: updatedEnquiry.name,
    email: updatedEnquiry.email,
    message: updatedEnquiry.message,
    status: updatedEnquiry.status,
    createdAt: updatedEnquiry.createdAt,
    updatedAt: updatedEnquiry.updatedAt,
  });
});

// @desc    Delete an enquiry
// @route   DELETE /api/enquiries/:id
// @access  Private (Admin only) - You'll add authentication middleware later
const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    res.status(404);
    throw new Error('Enquiry not found.');
  }

  await Enquiry.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Enquiry removed successfully!' });
});

module.exports = {
  submitEnquiry,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
};