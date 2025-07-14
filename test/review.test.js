const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); 
const User = require("../models/User");
const Vehicle = require("../models/VehicleDetails");
const Review = require("../models/Review");

let authToken;
let userId;
let vehicleId;

beforeAll(async () => {
  await User.deleteOne({ email: "reviewer@example.com" });

  // Register user
  await request(app).post("/api/auth/register").send({
    username: "reviewuser",
    email: "reviewer@example.com",
    password: "testpass123",
    role: "user"
  });

  // Login user
  const res = await request(app).post("/api/auth/login").send({
    email: "reviewer@example.com",
    password: "testpass123"
  });

  authToken = res.body.token;
  userId = res.body.data._id;

  // Create a vehicle
  const vehicle = new Vehicle({
    vehicleName: "Review Car",
    vehicleType: "Sedan",
    pricePerTrip: 1000,
    filepath: "car.jpg",
    passengerCapacity: 4,
    loadCapacityKg: 300,
    fuelCapacityLitres: 40
  });

  const savedVehicle = await vehicle.save();
  vehicleId = savedVehicle._id;
});

afterAll(async () => {
  await Review.deleteMany({ vehicleId });
  await Vehicle.findByIdAndDelete(vehicleId);
  await User.findByIdAndDelete(userId);
  await mongoose.connection.close();
});

describe("Review API Tests", () => {
  test("should allow user to add a review", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        vehicleId,
        rating: 4,
        comment: "Great car!"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.review).toHaveProperty("_id");
    expect(res.body.review.rating).toBe(4);
  });

  test("should not allow adding review without token", async () => {
    const res = await request(app).post("/api/reviews").send({
      vehicleId,
      rating: 5,
      comment: "Should fail"
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Authentication required");
  });

  test("should not allow review with missing fields", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        vehicleId,
        // rating missing
        comment: "Incomplete review"
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Failed to add review");
  });

  test("should return all reviews for a vehicle", async () => {
    const res = await request(app).get(`/api/reviews/${vehicleId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("comment");
    expect(res.body[0].vehicleId).toBe(vehicleId.toString());
  });

  test("should return empty array if no reviews for vehicle", async () => {
    const newVehicle = new Vehicle({
      vehicleName: "No Review Car",
      vehicleType: "Hatchback",
      pricePerTrip: 800,
      filepath: "none.jpg",
      passengerCapacity: 4,
      loadCapacityKg: 200,
      fuelCapacityLitres: 30
    });

    const saved = await newVehicle.save();
    const res = await request(app).get(`/api/reviews/${saved._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);

    await Vehicle.findByIdAndDelete(saved._id);
  });

  test("should return error for invalid vehicle ID", async () => {
    const res = await request(app).get(`/api/reviews/invalidid`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Failed to get reviews");
  });
});
