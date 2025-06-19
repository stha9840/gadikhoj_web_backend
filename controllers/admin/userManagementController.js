const User = require("../../models/User");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// Register User
exports.createUser = async (req, res) => {
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



exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json(
            {
                "success": true,
                "message": "Data fetched",
                "data": users
            }
        )
    } catch (err) {
        console.log(err)
        return res.status(500).json(
            {
                "success": false,
                "message": "Server error"
            }
        )
    }
}

// update
exports.updateOneUser = async (req, res) => {
    const { username, email } = req.body
    const _id = req.params.id
    try {
        const user = await User.updateOne(
            {
                "_id": _id
            },
            {
                $set: {
                    "username": username,
                    "email": email
                }
            }
        )

        return res.status(200).json(
            {
                "success": true,
                "message": "User data updated"
            }
        )
    } catch (err) {
        return res.status(500).json(
            {
                "success": false,
                "message": "Server Error"
            }
        )
    }
}


// Delete
exports.deleteOneUser = async (req, res) => {
    try {
        const _id = req.params.id
        const user = await User.deleteOne(
            {
                "_id": _id
            }
        )
        console.log(user)
        return res.status(200).json(
            {
                "success": true,
                "message": "User deleted"
            }
        )
    } catch (err) {
        return res.status(500).json(
            {
                "success": false,
                "message": "Server Error"
            }
        )
    }
}

