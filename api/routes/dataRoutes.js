// server/Back End/routes/dataRoutes.js

const express = require('express');
const router = express.Router();
const Religion = require('../models/religionModel'); // Import the model we created

// @route   GET /api/religions
// @desc    Get all religion and cause data
// @access  Public
router.get('/religions', async (req, res) => {
    try {
        const allData = await Religion.find(); // Fetches all documents from the collection
        res.json(allData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;