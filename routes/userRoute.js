const express = require('express');
const router = express.Router();

// Import your controller functions
const { registerUser, loginUser } = require("../controllers/userController");
const { 
  updateOneUser, 
  deleteOneUser, 
  getOneUser, 
  getLoggedInUserProfile, 
  updateLoggedInUserProfile,
  deleteLoggedInUser       
} = require('../controllers/admin/userManagementController');
const { authenticateUser } = require('../middlewares/authenticateUser');

// --- Public Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- Authenticated Routes ---
// SPECIFIC routes must come BEFORE generic parameterized routes.

// Route to get the currently logged-in user's profile
router.get('/me', authenticateUser, getLoggedInUserProfile);

// Route to update the currently logged-in user's profile
router.put('/update', authenticateUser, updateLoggedInUserProfile);

// Delete the currently logged-in user's account
router.delete('/delete', authenticateUser, deleteLoggedInUser);


// --- Generic (parameterized) routes ---
// These should come last.

// Get a single user by their ID
router.get("/:id", authenticateUser, getOneUser);

// Update a single user by their ID (likely for an admin)
router.put("/:id", authenticateUser, updateOneUser);

// Delete a single user by their ID (likely for an admin)
router.delete("/:id", authenticateUser, deleteOneUser);

module.exports = router;