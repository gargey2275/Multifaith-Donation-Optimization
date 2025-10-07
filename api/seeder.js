// server/Back End/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { religions } = require('./data.js'); // Import data from the file you just copied
const Religion = require('./models/religionModel.js'); // Import your model

dotenv.config();

const importData = async () => {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected for seeding...');

        // Clear existing data
        await Religion.deleteMany();
        console.log('Existing data destroyed...');

        // Insert new data
        await Religion.insertMany(religions);
        console.log('Data imported successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error}`);
        process.exit(1);
    }
};

// This allows you to run "node seeder.js" to import the data
importData();