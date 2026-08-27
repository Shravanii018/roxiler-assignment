const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isNormalUser, validateRating } = require("../middleware.js");
const storesController = require("../controllers/stores.js");

router.use(isLoggedIn, isNormalUser);

router.get("/", wrapAsync(storesController.index));

router.post("/:id/rating", validateRating, wrapAsync(storesController.submitRating));

module.exports = router;
