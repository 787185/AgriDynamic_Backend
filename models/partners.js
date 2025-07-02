// backend/models/Partner.js
const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  logo: {
    type: String, // Storing the URL or path to the logo image
    required: true,
  },
  description: {
    type: String,
    required: false, // Description is optional
  },
  link: {
    type: String, // The URL for the partner's website
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;