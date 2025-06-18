const asyncHandler = require('express-async-handler'); // Assuming you use express-async-handler
const Enquiry = require('../models/enquiryModel');

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