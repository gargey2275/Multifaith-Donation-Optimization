// Add this line to the very top
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully ✅"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- ROUTES ---

// 1. Temporary Debug Route
app.get("/api/debug-env", (req, res) => {
  res.status(200).json({
    message: "Debug Information",
    mongoUriExists: !!process.env.MONGO_URI,
    jwtSecretExists: !!process.env.JWT_SECRET,
    mongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
  });
});

// 2. Main API Routes
const dataRoutes = require("./routes/dataRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api", dataRoutes);
app.use("/api/users", userRoutes);

// 3. Root Route
app.get("/", (req, res) => {
  res.send("The MultiFaith Donation API is running!");
});

// --- SERVER START ---

// This is for local development
app.listen(PORT, () => {
  console.log(`Server is live and running on port ${PORT}`);
});
