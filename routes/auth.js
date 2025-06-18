const express = require('express');
const jwt = require('jsonwebtoken');
const { register, login, updateUserProfile } = require('../controllers/authController'); // Import updateUserProfile
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

module.exports = router;
