const bcrypt = require("bcryptjs");
const { Op, fn, col } = require("sequelize");
const ExpressError = require("../utils/ExpressError.js");
const { User, Store, Rating } = require("../models");

const SORTABLE_USER_FIELDS = ["name", "email", "address", "role"];
const SORTABLE_STORE_FIELDS = ["name", "email", "address", "rating"];

// dashboard counters
module.exports.dashboard = async (req, res) => {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
        User.count(),
        Store.count(),
        Rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
};

// admin creates a user with any role (admin/normal/owner)
module.exports.createUser = async (req, res) => {
    const { name, email, password, address, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) throw new ExpressError(409, "Email already in use!");

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, address, role });

    res.status(201).json({
        id: user.id, name: user.name, email: user.email, address: user.address, role: user.role,
    });
};

// admin creates a store, optionally linked to a Store Owner user
module.exports.createStore = async (req, res) => {
    const { name, email, address, owner_id } = req.body;

    const existing = await Store.findOne({ where: { email } });
    if (existing) throw new ExpressError(409, "A store with this email already exists!");

    if (owner_id) {
        const owner = await User.findByPk(owner_id);
        if (!owner || owner.role !== "owner") {
            throw new ExpressError(400, 'owner_id must reference a user with role "owner"');
        }
    }

    const store = await Store.create({ name, email, address, owner_id: owner_id || null });
    res.status(201).json(store);
};

// list users with optional filters (name, email, address, role) and sorting
module.exports.listUsers = async (req, res) => {
    const { name, email, address, role, sortBy, sortOrder } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const order = SORTABLE_USER_FIELDS.includes(sortBy)
        ? [[sortBy, sortOrder === "desc" ? "DESC" : "ASC"]]
        : [["name", "ASC"]];

    const users = await User.findAll({
        where,
        order,
        attributes: ["id", "name", "email", "address", "role"],
    });

    res.json(users);
};

// list stores with optional filters and sorting; includes average rating
module.exports.listStores = async (req, res) => {
    const { name, email, address, sortBy, sortOrder } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const stores = await Store.findAll({
        where,
        attributes: {
            include: [[fn("AVG", col("ratings.rating")), "avgRating"]],
        },
        include: [{ model: Rating, as: "ratings", attributes: [] }],
        group: ["Store.id"],
        subQuery: false,
    });

    let results = stores.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        owner_id: s.owner_id,
        rating: s.get("avgRating") ? parseFloat(s.get("avgRating")).toFixed(2) : null,
    }));

    if (SORTABLE_STORE_FIELDS.includes(sortBy)) {
        results.sort((a, b) => {
            const av = a[sortBy] ?? "";
            const bv = b[sortBy] ?? "";
            if (av < bv) return sortOrder === "desc" ? 1 : -1;
            if (av > bv) return sortOrder === "desc" ? -1 : 1;
            return 0;
        });
    }

    res.json(results);
};

// single user's details; includes store rating if the user is a Store Owner
module.exports.getUserDetails = async (req, res) => {
    const user = await User.findByPk(req.params.id, {
        attributes: ["id", "name", "email", "address", "role"],
    });
    if (!user) throw new ExpressError(404, "User not found!");

    let result = user.toJSON();

    if (user.role === "owner") {
        const store = await Store.findOne({ where: { owner_id: user.id } });
        if (store) {
            const avg = await Rating.findOne({
                where: { store_id: store.id },
                attributes: [[fn("AVG", col("rating")), "avgRating"]],
                raw: true,
            });
            result.rating = avg.avgRating ? parseFloat(avg.avgRating).toFixed(2) : null;
        }
    }

    res.json(result);
};
