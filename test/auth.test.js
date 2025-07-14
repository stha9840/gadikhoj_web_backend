const request = require("supertest");
const mongoose = require("mongoose");
const app = require('../index')
const User = require("../models/User");

let testUserEmail = "testuser@example.com";
let testUserPassword = "testpass123";
let authToken;

afterAll(async () => {
  await User.deleteOne({ email: testUserEmail });
  await mongoose.disconnect();
});

describe("Auth Controller - User Registration and Login", () => {
  beforeAll(async () => {
    await User.deleteOne({ email: testUserEmail });
  });

  test("should fail to register user with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser"
      // email and password missing
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("should register user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: testUserEmail,
      password: testUserPassword,
      role: "user"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User registered successfully");
  });

  test("should not register same user again", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: testUserEmail,
      password: testUserPassword,
      role: "user"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User already exists");
  });

  test("should fail login with invalid email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "invalid@example.com",
      password: testUserPassword
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User not found");
  });

  test("should fail login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUserEmail,
      password: "wrongpass"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("should login successfully", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUserEmail,
      password: testUserPassword
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.token).toBeDefined();

    authToken = res.body.token;
  });
});
