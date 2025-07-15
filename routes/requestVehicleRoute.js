const express = require('express');
const router = express.Router();
const vehicleRequestController = require('../controllers/vehicleRequestController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// USER: Create a vehicle request
router.post('/', verifyToken, vehicleRequestController.createVehicleRequest);

// USER: Get logged-in user's requests
router.get('/my', verifyToken, vehicleRequestController.getUserVehicleRequests);

// ADMIN: Get all requests
router.get('/', verifyToken, isAdmin, vehicleRequestController.getAllVehicleRequests);

// ADMIN: Update a request (status, assign vehicle)
router.put('/:id', verifyToken, isAdmin, vehicleRequestController.updateVehicleRequest);

// ADMIN or USER: Delete a request
router.delete('/:id', verifyToken, vehicleRequestController.deleteVehicleRequest);

module.exports = router;
