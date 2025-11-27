const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- 1. REGISTER ROUTE (With 10-digit Fix) ---
router.post("/register", async (req, res) => {
  try {
    const { name, phoneNumber, password } = req.body;

    // Validation: Phone number must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 10 digits." });
    }

    // Check if user already exists
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      name,
      phoneNumber,
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Return Token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// --- 2. LOGIN ROUTE (This was missing!) ---
router.post("/login", async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Return Token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
