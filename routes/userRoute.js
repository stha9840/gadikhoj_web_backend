const express = require('express');
const router = express.Router();

//Import your controller function
const {registerUser, loginUser} = require("../controllers/userController");

// Define routes
router.post('/register', registerUser);


module.exports = router;
