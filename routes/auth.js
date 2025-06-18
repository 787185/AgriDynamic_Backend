const express = require('express');
const jwt = require('jsonwebtoken');
const { register, login, updateUserProfile, getProfile } = require('../controllers/authController'); // Import updateUserProfile
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// const generateToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: '1d',
//   });
// };

// Register
router.post('/register', register);

// Login
router.post('/login', login);

router.get('/profile', protect, getProfile); // <--- ADD THIS LINE!

// PUT Update User Profile (the one causing the 404)
router.put('/profile', protect, updateUserProfile); // <--- ADD THIS LINE!

module.exports = router;
