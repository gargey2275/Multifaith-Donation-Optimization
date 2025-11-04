// Add this line to the very top
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5001;

// --- CORS FIX ---
// List of all URLs that are allowed to make requests to your backend
const allowedOrigins = [
  "https://multifaith-donation-optimization.vercel.app", // Your main production URL
  "https://multifaith-donation-op.vercel.app", // Your other Vercel URL
  "https://multifaith-donation-op-git-bd0821-gargey-ajay-mahajans-projects.vercel.app", // The preview URL you showed me
  // You can add 'http://localhost:3000' here if you need to test from your local computer
];

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the incoming origin is in our allowed list (or if it's not a browser request, like from Postman)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("This URL is not allowed by CORS"));
    }
  },
};

// Middleware
app.use(cors(corsOptions)); // Use the new advanced CORS options
app.use(express.json()); // This was missing, you need it to read JSON bodies
// --- END OF FIX ---

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
