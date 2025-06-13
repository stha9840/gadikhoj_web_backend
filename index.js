// Import core dependencies
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables from .env file
require('dotenv').config();


// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());
const cors = require('cors')
let corsOptions = {
    origin : '*',
 }
 app.use(cors(corsOptions))


// Load Routes
const userRoute = require("./routes/userRoute"); 
// Mount routes with prefix
app.use("/api/auth", userRoute) 
// Define server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
