const express = require("express");
const router = express.Router();

// Corrected middleware import — change "uploads" to "upload" if your file is upload.js
const upload = require("../../middlewares/uploads");

const {
    createVehicle,
    getAllVehicles,
    updateVehicle,
    deleteVehicle
} = require("../../controllers/admin/vehicleManagementController");

// Route to create a vehicle with a single file upload named 'file'
router.post(
    "/",
    upload.single("image"),
    createVehicle
);

// Get all vehicles
router.get(
    "/",
    getAllVehicles
);

// Update vehicle by ID
router.put(
    "/:id",
    updateVehicle
);

// Delete vehicle by ID
router.delete(
    "/:id",
    deleteVehicle
);

module.exports = router;
