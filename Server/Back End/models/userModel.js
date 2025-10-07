// server/Back End/models/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true, // No two users can have the same phone number
    },
    password: {
        type: String,
        required: true,
    },
    totalDonated: {
        type: Number,
        required: true,
        default: 0, // Users start with 0 donations
    },
}, {
    timestamps: true, // Automatically adds "createdAt" and "updatedAt" fields
});

// This function runs BEFORE a user is saved to the database
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    // Generate a "salt" to make the hash more secure
    const salt = await bcrypt.genSalt(10);
    // Re-assign the plain-text password to its hashed version
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;