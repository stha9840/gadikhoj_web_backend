const express = require('express');
const router = express.Router();

//Import your controller function
const {registerUser, loginUser} = require("../controllers/userController");
const {updateOneUser , deleteOneUser , getOneUser , getLoggedInUserProfile} = require('../controllers/admin/userManagementController');
const { authenticateUser } = require('../middlewares/authenticateUser');

// Define routes
router.post('/register', registerUser);
router.post('/login', loginUser)

router.put(
    "/:id",
    authenticateUser,
    updateOneUser
)
router.get(
    "/",
    authenticateUser,
    getOneUser
)

router.delete(
    "/:id",
    authenticateUser,
    deleteOneUser
)

router.get(
    "/me",
    authenticateUser,
    getLoggedInUserProfile
);


module.exports = router;

