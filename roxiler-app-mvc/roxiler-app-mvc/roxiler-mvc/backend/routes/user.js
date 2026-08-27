const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateSignup, validatePasswordUpdate } = require("../middleware.js");
const usersController = require("../controllers/users.js");

router.post("/signup", validateSignup, wrapAsync(usersController.signup));

router.post("/login", wrapAsync(usersController.login));

router.put("/password", isLoggedIn, validatePasswordUpdate, wrapAsync(usersController.updatePassword));

router.get("/me", isLoggedIn, wrapAsync(usersController.me));

module.exports = router;
