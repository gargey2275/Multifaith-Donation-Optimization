// server/Back End/index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
//require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully ✅"))
    .catch(err => console.error("MongoDB connection error:", err));

// A simple test route to make sure the server is reachable
app.get('/', (req, res) => {
    res.send('The MultiFaith Donation API is running!');
});

// --- USE API ROUTES --- 
const dataRoutes = require('./routes/dataRoutes');
app.use('/api', dataRoutes); // All routes in dataRoutes will be prefixed with /api
// ----------------------


// --- ADD THESE TWO LINES ---
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
// -------------------------

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is live and running on port ${PORT}`);
});

module.exports = app;