
const app = require("../index");
const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/User");
const Vehicle = require("../models/VehicleDetails");
const Booking = require("../models/Booking");

let authToken;
let userId;
let vehicleId;
let bookingId;

beforeAll(async () => {
  await User.deleteOne({ email: "testuser@example.com" });

  // Register user
  await request(app).post("/api/auth/register").send({
    username: "testuser",
    email: "testuser@example.com",
    password: "testpass123",
    role: "user"
  });

  // Login user
  const res = await request(app).post("/api/auth/login").send({
    email: "testuser@example.com",
    password: "testpass123"
  });

  authToken = res.body.token;
  userId = res.body.data._id;

  // Create vehicle
  const vehicle = new Vehicle({
    vehicleName: "Test Car",
    vehicleType: "SUV",
    pricePerTrip: 1000,
    filepath: "test.jpg",
    passengerCapacity: 4,
    loadCapacityKg: 300,
    fuelCapacityLitres: 50,
  });

  const savedVehicle = await vehicle.save();
  vehicleId = savedVehicle._id;
});

afterAll(async () => {
  await Booking.deleteMany({ userId });
  await Vehicle.findByIdAndDelete(vehicleId);
  await User.findByIdAndDelete(userId);
  await mongoose.connection.close();
});

describe("Booking APIs", () => {
  test("should create a booking", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        vehicleId,
        startDate: "2025-08-01",
        endDate: "2025-08-03",
        pickupLocation: "default",
        dropLocation: "default",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Booking successful");
    expect(res.body.booking).toHaveProperty("_id");

    bookingId = res.body.booking._id;
  });

  test("should get user bookings", async () => {
    const res = await request(app)
      .get("/api/bookings/my")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("should get one booking by ID", async () => {
    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(bookingId);
  });

  test("should update booking", async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ pickupLocation: "Updated Location" });

    expect(res.statusCode).toBe(200);
    expect(res.body.booking.pickupLocation).toBe("Updated Location");
  });

  test("should cancel booking", async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.booking.status).toBe("cancelled");
  });

  test("should delete booking", async () => {
    const res = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Booking deleted");
  });
});
