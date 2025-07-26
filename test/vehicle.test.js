const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); 
const User = require("../models/User");
const Vehicle = require("../models/VehicleDetails");
const SavedVehicle = require("../models/SavedVehicle");

let authToken;
let userId;
let vehicleId;

beforeAll(async () => {
  await User.deleteOne({ email: "saved@example.com" });

  // Register and login user
  await request(app).post("/api/auth/register").send({
    username: "saveuser",
    email: "saved@example.com",
    password: "pass123",
    role: "user"
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "saved@example.com",
    password: "pass123"
  });

  authToken = res.body.token;
  userId = res.body.data._id;

  // Create vehicle
  const vehicle = new Vehicle({
    vehicleName: "Test Vehicle",
    vehicleType: "SUV",
    pricePerTrip: 1200,
    filepath: "img.jpg",
    passengerCapacity: 5,
    loadCapacityKg: 400,
    fuelCapacityLitres: 50
  });
  const saved = await vehicle.save();
  vehicleId = saved._id;
});

afterAll(async () => {
  await SavedVehicle.deleteMany({ userId });
  await Vehicle.findByIdAndDelete(vehicleId);
  await User.findByIdAndDelete(userId);
  await mongoose.connection.close();
});

describe("Saved Vehicle API", () => {
  test("should save a vehicle successfully", async () => {
    const res = await request(app)
      .post("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ vehicleId });

    expect(res.statusCode).toBe(201);
    expect(res.body.savedVehicle.vehicleId).toBe(vehicleId.toString());
  });

  test("should not allow duplicate save", async () => {
    const res = await request(app)
      .post("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ vehicleId });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Vehicle already saved");
  });

  test("should return all saved vehicles", async () => {
    const res = await request(app)
      .get("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].vehicleId._id).toBe(vehicleId.toString());
  });

  test("should remove a saved vehicle", async () => {
    const res = await request(app)
      .delete(`/api/saved-vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Vehicle removed from saved list");
  });

  test("should return 404 when removing non-existent saved vehicle", async () => {
    const res = await request(app)
      .delete(`/api/saved-vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Saved vehicle not found");
  });

  test("should not allow save without vehicleId", async () => {
    const res = await request(app)
      .post("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({}); // missing vehicleId

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("vehicleId is required");
  });
});
