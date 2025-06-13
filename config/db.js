const mongoose = require("mongoose");

// ===============================
// Connect to MongoDB using Mongoose
// ===============================
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the URI from environment variables
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,      // Use the new URL string parser
      useUnifiedTopology: true    // Use the new server discovery and monitoring engine
    });

    // Log success message if connection is successful
    console.log("MongoDB connected successfully");
  } catch (error) {
    // Log error message if connection fails
    console.error("Database connection error:", error);
  }
};

// Export the function so it can be used in server.js or app.js
module.exports = connectDB;
