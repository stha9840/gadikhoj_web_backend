const express = require("express");
const router = express.Router();

const {
    createVehicle,
    getAllVehicles,
    updateVehicle,
    deleteVehicle
} = require("../../controllers/admin/vehicleController");

// CREATE vehicle
router.post(
    '/create',
    createVehicle
);

// READ all vehicles
router.get(
    '/',
    getAllVehicles
);

// UPDATE vehicle by ID
router.put(
    '/:id',
    updateVehicle
);

// DELETE vehicle by ID
router.delete(
    '/:id',
    deleteVehicle
);

module.exports = router;
