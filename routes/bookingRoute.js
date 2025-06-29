const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticateUser } = require("../middlewares/authenticateUser");

// If you don't have auth middleware yet, you can omit verifyToken for now.
// Later, add it to protect these routes.

router.post("/", authenticateUser,  bookingController.createBooking);        // Create booking
router.get("/my",authenticateUser, bookingController.getUserBookings);     // Get bookings of logged-in user
router.get("/", bookingController.getAllBookings);        // Admin: get all bookings
router.patch("/:bookingId/cancel", bookingController.cancelBooking);  // Cancel booking

module.exports = router;