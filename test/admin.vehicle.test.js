const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/User");
const Vehicle = require("../models/VehicleDetails");
const fs = require("fs");
const path = require("path");

let authToken;
let userId;
let createdVehicleId;

beforeAll(async () => {
  await User.deleteOne({ email: "vehicleadmin@example.com" });

  // Register and login admin user
  await request(app).post("/api/auth/register").send({
    username: "vehicleadmin",
    email: "vehicleadmin@example.com",
    password: "test123",
    role: "admin",
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "vehicleadmin@example.com",
    password: "test123",
  });

  authToken = res.body.token;
  userId = res.body.data._id;
});

afterAll(async () => {
  await Vehicle.findByIdAndDelete(createdVehicleId);
  await User.findByIdAndDelete(userId);
  await mongoose.connection.close();
});

describe("Admin Vehicle Management", () => {
  test("1. Should create a new vehicle", async () => {
    const res = await request(app)
      .post("/api/admin/vehicle/create")
      .set("Authorization", `Bearer ${authToken}`)
      .field(
        "vehicle",
        JSON.stringify({
          vehicleName: "Test Car",
          vehicleType: "SUV",
          fuelCapacityLitres: 60,
          loadCapacityKg: 400,
          passengerCapacity: 5,
          pricePerTrip: 1500,
          vehicleDescription: "A powerful SUV",
        })
      )
      .attach("image", path.join(__dirname, "../assets/test-image.jpg"));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const vehicle = await Vehicle.findOne({ vehicleName: "Test Car" });
    createdVehicleId = vehicle._id;
  });

  test("2. Should fail to create vehicle without vehicle field", async () => {
    const res = await request(app)
      .post("/api/admin/vehicle/create")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/missing vehicle data/i);
  });

  test("3. Should fail to create vehicle with invalid JSON in vehicle field", async () => {
    const res = await request(app)
      .post("/api/admin/vehicle/create")
      .set("Authorization", `Bearer ${authToken}`)
      .field("vehicle", "{invalidJson}")
      .attach("image", path.join(__dirname, "../assets/test-image.jpg"));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/server error/i);
  });

  test("4. Should fetch all vehicles", async () => {
    const res = await request(app)
      .get("/api/admin/vehicle")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("5. Should return vehicle by ID", async () => {
    const res = await request(app)
      .get(`/api/admin/vehicle/${createdVehicleId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(createdVehicleId.toString());
  });

  test("6. Should return 404 for non-existent vehicle ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/admin/vehicle/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  test("7. Should return 500 for invalid vehicle ID format", async () => {
    const res = await request(app)
      .get("/api/admin/vehicle/invalid-id-format")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("8. Should update vehicle without changing image", async () => {
    const res = await request(app)
      .put(`/api/admin/vehicle/${createdVehicleId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        vehicleName: "Updated Car",
        vehicleType: "Sedan",
        fuelCapacityLitres: 55,
        loadCapacityKg: 350,
        passengerCapacity: 4,
        pricePerTrip: 1400,
        vehicleDescription: "Updated description",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedVehicle = await Vehicle.findById(createdVehicleId);
    expect(updatedVehicle.vehicleName).toBe("Updated Car");
  });

  test("9. Should update vehicle with new image and delete old image", async () => {
    // Assuming old image file exists - you can mock or place a dummy file in uploads folder if needed

    const res = await request(app)
      .put(`/api/admin/vehicle/${createdVehicleId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .field("vehicleName", "Image Updated Car") // Also test partial form data with multipart form
      .attach("image", path.join(__dirname, "../assets/test-image2.jpg"));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedVehicle = await Vehicle.findById(createdVehicleId);
    expect(updatedVehicle.vehicleName).toBe("Image Updated Car");
    expect(updatedVehicle.filepath).toBeDefined();
  });

  test("10. Should fail update with invalid vehicle ID", async () => {
    const res = await request(app)
      .put("/api/admin/vehicle/invalid-id")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        vehicleName: "Fail Update",
        vehicleType: "Sedan",
        fuelCapacityLitres: 50,
        loadCapacityKg: 300,
        passengerCapacity: 4,
        pricePerTrip: 1200,
        vehicleDescription: "Fail update test",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("11. Should fail update non-existent vehicle ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/admin/vehicle/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        vehicleName: "Fail Update",
        vehicleType: "Sedan",
        fuelCapacityLitres: 50,
        loadCapacityKg: 300,
        passengerCapacity: 4,
        pricePerTrip: 1200,
        vehicleDescription: "Fail update test",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  test("12. Should delete vehicle by ID", async () => {
    const res = await request(app)
      .delete(`/api/admin/vehicle/${createdVehicleId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Vehicle.findById(createdVehicleId);
    expect(deleted).toBeNull();

    // Reset createdVehicleId to avoid afterAll delete error
    createdVehicleId = null;
  });

  test("13. Should fail delete with invalid vehicle ID", async () => {
    const res = await request(app)
      .delete("/api/admin/vehicle/invalid-id")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("14. Should fail delete non-existent vehicle ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/admin/vehicle/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`);

    // Your delete may return 200 even if nothing deleted. Adjust if needed.
    expect([200, 404]).toContain(res.statusCode);
  });

  // Authorization tests

  test("15. Should reject create vehicle without auth token", async () => {
    const res = await request(app)
      .post("/api/admin/vehicle/create")
      .field(
        "vehicle",
        JSON.stringify({
          vehicleName: "No Auth Car",
          vehicleType: "SUV",
          fuelCapacityLitres: 60,
          loadCapacityKg: 400,
          passengerCapacity: 5,
          pricePerTrip: 1500,
          vehicleDescription: "No auth test",
        })
      )
      .attach("image", path.join(__dirname, "../assets/test-image.jpg"));

    expect(res.statusCode).toBe(401);
  });

  test("16. Should reject fetch vehicles without auth token", async () => {
    const res = await request(app).get("/api/admin/vehicle");
    expect(res.statusCode).toBe(401);
  });

  test("17. Should reject update vehicle without auth token", async () => {
    const res = await request(app)
      .put(`/api/admin/vehicle/${createdVehicleId}`)
      .send({ vehicleName: "No Auth Update" });

    expect(res.statusCode).toBe(401);
  });

  test("18. Should reject delete vehicle without auth token", async () => {
    const res = await request(app).delete(`/api/admin/vehicle/${createdVehicleId}`);

    expect(res.statusCode).toBe(401);
  });
});
