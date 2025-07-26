const express = require('express');
const router = express.Router();
const {
  getVehicleById,
  getRelatedVehicles,
} = require('../controllers/vehicleController');

router.get('/related/:id', getRelatedVehicles);
router.get('/:id', getVehicleById);

module.exports = router;
