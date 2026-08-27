const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isStoreOwner } = require("../middleware.js");
const ownerController = require("../controllers/owner.js");

router.use(isLoggedIn, isStoreOwner);

router.get("/dashboard", wrapAsync(ownerController.dashboard));

module.exports = router;
