const VehicleDetail = require("../../models/VehicleDetails");

// CREATE - Add a new vehicle
exports.createVehicle = async (req, res) => {
    try {
        if (!req.body.vehicle) {
            return res.status(400).json({
                success: false,
                message: "Missing vehicle data in form",
            });
        }

        // Parse stringified vehicle JSON sent from frontend/form
        const {
            vehicleName,
            vehicleType,
            fuelCapacityLitres,
            loadCapacityKg,
            passengerCapacity,
            pricePerTrip
        } = JSON.parse(req.body.vehicle);

        const filepath = req.file ? req.file.path : null;

        const newVehicle = new VehicleDetail({
            vehicleName,
            vehicleType,
            fuelCapacityLitres,
            loadCapacityKg,
            passengerCapacity,
            pricePerTrip,
            filepath
        });

        await newVehicle.save();

        return res.status(201).json({
            success: true,
            message: "Vehicle added successfully"
        });

    } catch (error) {
        console.error("Error in createVehicle:", error.message, error.stack);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// READ - Get all vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await VehicleDetail.find();
        return res.status(200).json({
            success: true,
            message: "Vehicle data fetched successfully",
            data: vehicles
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// UPDATE - Update a vehicle by ID
exports.updateVehicle = async (req, res) => {
    const _id = req.params.id;
    const {
        vehicleName,
        vehicleType,
        fuelCapacityLitres,
        loadCapacityKg,
        passengerCapacity,
        pricePerTrip,
        filepath
    } = req.body;

    try {
        await VehicleDetail.updateOne(
            { _id },
            {
                $set: {
                    vehicleName,
                    vehicleType,
                    fuelCapacityLitres,
                    loadCapacityKg,
                    passengerCapacity,
                    pricePerTrip,
                    filepath
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Vehicle updated successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// DELETE - Delete a vehicle by ID
exports.deleteVehicle = async (req, res) => {
    const _id = req.params.id;

    try {
        await VehicleDetail.deleteOne({ _id });

        return res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
// READ - Get one vehicle by ID
exports.getOneVehicle = async (req, res) => {
  const _id = req.params.id;

  try {
    const vehicle = await VehicleDetail.findById(_id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};