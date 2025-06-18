// models/Volunteer.js
const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // password: { type: String, required: true }, // Uncomment if you need passwords
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update `updatedAt` on save/update
volunteerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});



module.exports = mongoose.model('Volunteer', volunteerSchema);