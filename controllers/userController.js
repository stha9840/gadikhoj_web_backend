const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register User
exports.registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if a user with the same username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        // Save user to the database
        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Basic field validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing fields"
        });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare entered password with hashed password in DB
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Create a JWT payload (avoid including sensitive data like password)
        const payload = {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        };

        // Sign the JWT token with a 7-day expiration
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" });

        // Convert user document to plain object and exclude password from response
        const { password: _, ...userData } = user.toObject();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: userData,
            token : token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


