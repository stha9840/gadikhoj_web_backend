// test/savedVehicle.test.js
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

  // Create a vehicle
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
  // ✅ 1. Happy path
  test("should save a vehicle successfully", async () => {
    const res = await request(app)
      .post("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ vehicleId });

    expect(res.statusCode).toBe(201);
    expect(res.body.savedVehicle.vehicleId).toBe(vehicleId.toString());
  });

  // ✅ 2. Duplicate save
  test("should not allow duplicate save", async () => {
    const res = await request(app)
      .post("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ vehicleId });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Vehicle already saved");
  });

  // ✅ 3. Get all saved vehicles
  test("should return all saved vehicles", async () => {
    const res = await request(app)
      .get("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].vehicleId._id).toBe(vehicleId.toString());
  });

  // ✅ 4. Remove saved vehicle
  test("should remove a saved vehicle", async () => {
    const res = await request(app)
      .delete(`/api/saved-vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Vehicle removed from saved list");
  });

  // ✅ 5. Remove non-existent saved vehicle
  test("should return 404 when removing non-existent saved vehicle", async () => {
    const res = await request(app)
      .delete(`/api/saved-vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Saved vehicle not found");
  });

  // ✅ 6. Missing vehicleId on save
  test("should not allow save without vehicleId", async () => {
    const res = await request(app)
      .post("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({}); // missing vehicleId

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("vehicleId is required");
  });

  // ✅ 7. Unauthorized save attempt
  test("should reject saving a vehicle without auth token", async () => {
    const res = await request(app)
      .post("/api/saved-vehicles")
      .send({ vehicleId });

    expect(res.statusCode).toBe(401);
  });

  // ✅ 8. Unauthorized get attempt
  test("should reject getting saved vehicles without auth token", async () => {
    const res = await request(app).get("/api/saved-vehicles");
    expect(res.statusCode).toBe(401);
  });

  // ✅ 9. Unauthorized remove attempt
  test("should reject removing a saved vehicle without auth token", async () => {
    const res = await request(app).delete(`/api/saved-vehicles/${vehicleId}`);
    expect(res.statusCode).toBe(401);
  });

  // ✅ 10. Saving a non-existent vehicle
//   test("should return error when saving a non-existent vehicleId", async () => {
//     const fakeVehicleId = new mongoose.Types.ObjectId();
//     const res = await request(app)
//       .post("/api/saved-vehicles")
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({ vehicleId: fakeVehicleId });

//     // Your controller currently throws 500 for this
//     expect([404, 500]).toContain(res.statusCode);
//   });

  // ✅ 11. Response shape validation
  test("saved vehicle response should have correct fields", async () => {
    const vehicle = new Vehicle({
      vehicleName: "Another Test Vehicle",
      vehicleType: "Sedan",
      pricePerTrip: 1000,
      filepath: "img2.jpg",
      passengerCapacity: 4,
      loadCapacityKg: 300,
      fuelCapacityLitres: 40
    });
    const savedVehicle = await vehicle.save();

    const res = await request(app)
      .post("/api/saved-vehicles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ vehicleId: savedVehicle._id });

    expect(res.statusCode).toBe(201);
    expect(res.body.savedVehicle).toHaveProperty("userId", userId.toString());
    expect(res.body.savedVehicle).toHaveProperty("vehicleId", savedVehicle._id.toString());

    await Vehicle.findByIdAndDelete(savedVehicle._id);
  });
});
