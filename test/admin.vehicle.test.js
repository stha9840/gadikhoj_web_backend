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

  // Register and login user
  await request(app).post("/api/auth/register").send({
    username: "vehicleadmin",
    email: "vehicleadmin@example.com",
    password: "test123",
    role: "admin"
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "vehicleadmin@example.com",
    password: "test123"
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
      .field("vehicle", JSON.stringify({
        vehicleName: "Test Car",
        vehicleType: "SUV",
        fuelCapacityLitres: 60,
        loadCapacityKg: 400,
        passengerCapacity: 5,
        pricePerTrip: 1500,
        vehicleDescription: "A powerful SUV"
      }))
      .attach("image", path.join(__dirname, "../assets/test-image.jpg"));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const vehicle = await Vehicle.findOne({ vehicleName: "Test Car" });
    createdVehicleId = vehicle._id;
  });

  test("2. Should fetch all vehicles", async () => {
    const res = await request(app).get("/api/admin/vehicle");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

 


  

  test("6. Should fail to create vehicle without data", async () => {
    const res = await request(app)
      .post("/api/admin/vehicle/create")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("7. Should return 404 for invalid vehicle ID (get)", async () => {
    const res = await request(app).get("/api/admin/vehicle/123invalidid123");
    expect(res.statusCode).toBe(500);
  });

  test("8. Should return 404 for non-existent vehicle", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/admin/vehicle/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });



});
