// server/Back End/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/authMiddleware');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, phoneNumber, password } = req.body;
    try {
        const userExists = await User.findOne({ phoneNumber });
        if (userExists) {
            return res.status(400).json({ message: 'User with this phone number already exists' });
        }
        const user = await User.create({ name, phoneNumber, password });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                message: 'User registered successfully!',
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users/login
// @desc    Authenticate a user and get a token
// @access  Public
router.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;
    try {
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({
                message: 'Login successful!',
                token,
                user: { id: user.id, name: user.name }
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users/donate
// @desc    Make a donation and update user's total
// @access  Private
router.post('/donate', auth, async (req, res) => {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: 'Please provide a valid donation amount.' });
    }
    try {
        const user = req.user;
        user.totalDonated += amount;
        await user.save();
        res.json({
            message: `Thank you for your generous donation of ${amount}!`,
            totalDonated: user.totalDonated,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during donation process.' });
    }
});

module.exports = router;