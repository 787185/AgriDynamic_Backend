const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Import asyncHandler

// Replace this with your real JWT secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

exports.register = asyncHandler(async (req, res) => { // Wrap in asyncHandler
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

exports.login = asyncHandler(async (req, res) => { // Wrap in asyncHandler
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// New: Update User Profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id); // req.user is populated by the protect middleware

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password; // Mongoose pre-save hook will hash this
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware (from the token payload)
  const user = await User.findById(req.user.id).select('-password'); // Exclude password hash from response

  if (user) {
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      // Add other user fields if you want them in the response, e.g., isAdmin: user.isAdmin
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// ... (ensure all your exports are correct at the end of the file) ...
// module.exports = {
//   register,
//   login,
//   getProfile, // <--- Make sure this is exported!
//   updateUserProfile,
// };