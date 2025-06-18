// routes/auth.js
const express = require('express');
const { register, login } = require('../controllers/authController'); // Make sure path is correct

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login); // This route will now use the updated login function

module.exports = router;