// models/VehicleRequest.js
const mongoose = require('mongoose');

const vehicleRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  preferredVehicleType: {
    type: String,
    required: true,
    enum: ['car', 'bike', 'van', 'truck', 'other'], // update based on your types
  },
  preferredBrand: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  dropLocation: {
    type: String,
    required: true,
  },
  additionalNotes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  assignedVehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('VehicleRequest', vehicleRequestSchema);
