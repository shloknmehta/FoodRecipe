const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSignUp = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashPwd = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashPwd
        });

        let token = jwt.sign({ email, id: newUser._id }, process.env.SECRET_KEY);
        return res.status(200).json({ token, user: newUser });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        let user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            let token = jwt.sign({ email, id: user._id }, process.env.SECRET_KEY);
            return res.status(200).json({ token, user });
        } else {
            return res.status(400).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getUser = async (req, res) => {
    const { id } = req.params;

    // Validate ID before querying MongoDB
    if (!id || id === "null" || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid or missing user ID" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ email: user.email });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { userLogin, userSignUp, getUser };
