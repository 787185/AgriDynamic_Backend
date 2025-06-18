// controllers/authController.js
const User = require('../models/userModel'); // Adjust path if needed
const bcrypt = require('bcrypt'); // Already imported in your userModel, but good to have here too for clarity
const jwt = require('jsonwebtoken'); // Assuming you have this for token generation

// Helper function to generate a JWT (as seen in your admin routes snippet)
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};

// Register User
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password, // Password will be hashed by pre-save hook in userModel
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            msg: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// Login User
exports.login = async (req, res) => {
    // For login, your schema uses 'email' as unique identifier, not 'username'.
    // Adjust frontend to send 'email' or change schema if 'username' is truly intended for login.
    const { email, password } = req.body; // Changed from 'username' to 'email'

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            msg: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};