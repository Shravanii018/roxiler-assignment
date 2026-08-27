const { Op, fn, col } = require("sequelize");
const ExpressError = require("../utils/ExpressError.js");
const { Store, Rating } = require("../models");

// list all stores with overall rating + the logged-in user's own rating
// supports search by name and address
module.exports.index = async (req, res) => {
    const { name, address } = req.query;
    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
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

    const storeIds = stores.map((s) => s.id);
    const myRatings = await Rating.findAll({
        where: { user_id: req.user.id, store_id: storeIds },
        raw: true,
    });
    const myRatingMap = {};
    myRatings.forEach((r) => { myRatingMap[r.store_id] = r.rating; });

    const results = stores.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        overallRating: s.get("avgRating") ? parseFloat(s.get("avgRating")).toFixed(2) : null,
        userSubmittedRating: myRatingMap[s.id] || null,
    }));

    res.json(results);
};

// submit or update (upsert) a rating for a store
module.exports.submitRating = async (req, res) => {
    const storeId = req.params.id;
    const { rating } = req.body;

    const store = await Store.findByPk(storeId);
    if (!store) throw new ExpressError(404, "Store not found!");

    const [record, created] = await Rating.findOrCreate({
        where: { user_id: req.user.id, store_id: storeId },
        defaults: { rating },
    });

    if (!created) {
        record.rating = rating;
        await record.save();
    }

    res.status(created ? 201 : 200).json(record);
};
