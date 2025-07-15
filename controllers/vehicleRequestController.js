const VehicleRequest = require('../models/VehicleRequest');

// Create a new vehicle request (User)
exports.createVehicleRequest = async (req, res) => {
  try {
    const {
      preferredVehicleType,
      preferredBrand,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      additionalNotes,
    } = req.body;

    const request = await VehicleRequest.create({
      userId: req.user._id,
      preferredVehicleType,
      preferredBrand,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      additionalNotes,
    });

    res.status(201).json({ message: 'Vehicle request created', request });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create vehicle request', error: error.message });
  }
};

// Get all vehicle requests (Admin)
exports.getAllVehicleRequests = async (req, res) => {
  try {
    const requests = await VehicleRequest.find()
      .populate('userId', 'username email')
      .populate('assignedVehicleId');

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

// Get all requests of the logged-in user
exports.getUserVehicleRequests = async (req, res) => {
  try {
    const requests = await VehicleRequest.find({ userId: req.user._id })
      .populate('assignedVehicleId')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user requests', error: error.message });
  }
};

// Update status and optionally assign a vehicle (Admin)
exports.updateVehicleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedVehicleId } = req.body;

    const updated = await VehicleRequest.findByIdAndUpdate(
      id,
      {
        status,
        assignedVehicleId: assignedVehicleId || null,
      },
      { new: true }
    )
      .populate('userId', 'username email')
      .populate('assignedVehicleId');

    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: 'Request updated', request: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request', error: error.message });
  }
};

// Delete request (Admin or user)
exports.deleteVehicleRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await VehicleRequest.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete request', error: error.message });
  }
};
