const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError.js");
const { User } = require("../models");

function signToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
}

// public signup -> always creates a Normal User
module.exports.signup = async (req, res) => {
    const { name, email, password, address } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
        throw new ExpressError(409, "Email already registered!");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, address, role: "normal" });

    const token = signToken(user);
    res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
};

// login for all roles (admin/normal/owner)
module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ExpressError(400, "Email and password are required!");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new ExpressError(401, "Invalid credentials!");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new ExpressError(401, "Invalid credentials!");
    }

    const token = signToken(user);
    res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
};

// any logged-in user can update their own password
module.exports.updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) throw new ExpressError(404, "User not found!");

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
        throw new ExpressError(401, "Old password is incorrect!");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully!" });
};

// current logged-in user's own profile
module.exports.me = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: ["id", "name", "email", "address", "role"],
    });
    res.json(user);
};
