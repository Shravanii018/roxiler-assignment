const { fn, col } = require("sequelize");
const ExpressError = require("../utils/ExpressError.js");
const { Store, Rating, User } = require("../models");

module.exports.dashboard = async (req, res) => {
    const store = await Store.findOne({ where: { owner_id: req.user.id } });
    if (!store) {
        throw new ExpressError(404, "No store is linked to this owner account yet!");
    }

    const ratings = await Rating.findAll({
        where: { store_id: store.id },
        include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
    });

    const avg = await Rating.findOne({
        where: { store_id: store.id },
        attributes: [[fn("AVG", col("rating")), "avgRating"]],
        raw: true,
    });

    res.json({
        store: { id: store.id, name: store.name, address: store.address },
        averageRating: avg.avgRating ? parseFloat(avg.avgRating).toFixed(2) : null,
        raters: ratings.map((r) => ({
            userId: r.user.id,
            name: r.user.name,
            email: r.user.email,
            rating: r.rating,
        })),
    });
};
