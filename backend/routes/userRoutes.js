const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Import the auth middleware to protect the donate route
const auth = require("../middleware/authMiddleware");

// --- 1. REGISTER ROUTE ---
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

// --- 2. LOGIN ROUTE ---
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

// --- 3. DONATE ROUTE (Restored!) ---
router.post("/donate", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    // Find the user who is logged in (req.user.id comes from the auth middleware)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Here you would typically save the donation to the database.
    // Since I don't know your exact User Schema, I will just return success.
    // If you have a 'donations' array in your User model, uncomment the next lines:

    // if (!user.donations) user.donations = [];
    // user.donations.push({ amount, date: new Date() });
    // await user.save();

    res.json({ message: `Thank you! Donation of ₹${amount} successful.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
