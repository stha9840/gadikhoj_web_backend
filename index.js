// Import core dependencies
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const adminUserRoute = require("./routes/admin/adminUserRoute")
const adminVehicleRoute = require("./routes/admin/adminVehicleRoute");
const bookingRoute = require("./routes/bookingRoute")
const savedVehicleRoute = require("./routes/savedVehicleRoute");

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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Load Routes
const userRoute = require("./routes/userRoute"); 
// Mount routes with prefix
app.use("/api/auth", userRoute) 
app.use("/api/admin/user", adminUserRoute)
app.use("/api/admin/vehicle", adminVehicleRoute);
app.use("/api/bookings", bookingRoute );// booking route added
app.use("/api/admin/bookings", bookingRoute );// booking route added
app.use("/api/saved-vehicles", savedVehicleRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Define server port
const PORT = process.env.PORT || 5000;


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
