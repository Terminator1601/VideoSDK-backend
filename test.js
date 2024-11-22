const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
require('dotenv').config(); // Load environment variables
const { MongoClient } = require('mongodb'); // MongoDB Native Driver

const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB connection
const uri = process.env.MONGO_URI; // Load MongoDB URI from .env

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: '1', // Server API version
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to the database
async function connectToDb() {
  try {
    await client.connect();
    console.log("MongoDB connected!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

// Call connectToDb to establish the connection
connectToDb();

// Endpoint to store data from file.json
app.post('/store-data', async (req, res) => {
  try {
    // Read the data from the file
    const data = JSON.parse(fs.readFileSync('./data/file.json', 'utf-8'));

    // Get the database and collection
    const db = client.db("CloudSDK"); // Replace with your actual database name
    const collection = db.collection("meetings"); // Replace with your desired collection name

    // Insert data into the collection
    await collection.insertMany(data);

    res.status(200).json({ message: 'Data stored successfully!' });
  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).json({ error: 'Failed to store data' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
