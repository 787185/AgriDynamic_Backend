// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // <-- IMPORT THIS
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => { // <-- WRAP IN asyncHandler
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach to req object
      // Select '-password' to exclude password hash from the user object
      req.user = await User.findById(decoded.id).select('-password');

      // Check if user was actually found
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next(); // Call next middleware/route handler
    } catch (error) {
      console.error(error); // Log the actual error for debugging
      res.status(401);
      throw new Error('Not authorized, token failed or invalid'); // More descriptive error
    }
  }

  // If no token, throw an error
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});


// Define the admin middleware (as it's imported in articleRoutes.js)
const admin = (req, res, next) => {
    // req.user must be populated by the 'protect' middleware first
    if (req.user && req.user.isAdmin) { // Assuming your User model has an 'isAdmin' boolean field
        next(); // User is admin, proceed
    } else {
        res.status(403); // Forbidden
        throw new Error('Not authorized as an administrator');
    }
};

// EXPORT AS AN OBJECT
module.exports = {
  protect,
  admin, // Export admin as well
};