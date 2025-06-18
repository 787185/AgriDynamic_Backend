const mongoose = require('mongoose');

const enquirySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true, // Remove whitespace from both ends of a string
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [/.+@.+\..+/, 'Please enter a valid email address'], // Basic email format validation
      lowercase: true, // Store emails in lowercase
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'responded', 'archived'], // Define possible statuses for admin management
      default: 'new', // Default status for new enquiries
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Enquiry = mongoose.model('Enquiry', enquirySchema);
module.exports = Enquiry;