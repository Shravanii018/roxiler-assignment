const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin, validateUser, validateStore } = require("../middleware.js");
const adminController = require("../controllers/admin.js");

router.use(isLoggedIn, isAdmin);

router.get("/dashboard", wrapAsync(adminController.dashboard));

router.route("/users")
    .get(wrapAsync(adminController.listUsers))
    .post(validateUser, wrapAsync(adminController.createUser));

router.get("/users/:id", wrapAsync(adminController.getUserDetails));

router.route("/stores")
    .get(wrapAsync(adminController.listStores))
    .post(validateStore, wrapAsync(adminController.createStore));

module.exports = router;
