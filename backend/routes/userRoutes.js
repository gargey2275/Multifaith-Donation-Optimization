const express = require("express");
const router = express.Router();
const User = require("../models/userModel"); // Or ../models/User
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  try {
    const { name, phoneNumber, password } = req.body;

    // --- 🛡️ START OF VALIDATION FIX ---
    // This regular expression checks for exactly 10 digits
    const phoneRegex = /^\d{10}$/;

    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 10 digits." });
    }
    // --- END OF VALIDATION FIX ---

    // Check if user already exists
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user (this part is probably what you have)
    user = new User({
      name,
      phoneNumber,
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create and return JWT (so they are logged in)
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" }, // Optional: '5h' or '360000'
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

// (You probably have a /login route here too)

module.exports = router;
