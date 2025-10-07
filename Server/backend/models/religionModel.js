// server/Back End/models/religionModel.js

const mongoose = require('mongoose');

// This defines the structure for each individual "cause"
const causeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    problemDescription: String,
    fullDescription: String,
    images: [String],
    location: String,
    mapLink: String,
});

// This defines the main structure for each "religion"
const religionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    causes: [causeSchema], // An array of documents that follow the causeSchema
});

const Religion = mongoose.model('Religion', religionSchema);

module.exports = Religion;