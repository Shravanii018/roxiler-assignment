const jwt = require("jsonwebtoken");
const ExpressError = require("./utils/ExpressError.js");
const {
    signupSchema,
    userSchema,
    storeSchema,
    ratingSchema,
    passwordUpdateSchema,
} = require("./schema.js");

// ===== isLoggedIn =====
// checks for a valid JWT before allowing access to a protected route
// (API equivalent of session-based isLoggedIn — reads Bearer token instead of req.isAuthenticated())
module.exports.isLoggedIn = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next(new ExpressError(401, "You must be logged in to access this resource!"));
    }
    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, email, name }
        next();
    } catch (err) {
        return next(new ExpressError(401, "Invalid or expired token!"));
    }
};

// ===== isAdmin =====
// checks that the logged-in user is a System Administrator
module.exports.isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(new ExpressError(403, "You do not have permission to do that!"));
    }
    next();
};

// ===== isNormalUser =====
// checks that the logged-in user is a Normal User
module.exports.isNormalUser = (req, res, next) => {
    if (req.user.role !== "normal") {
        return next(new ExpressError(403, "You do not have permission to do that!"));
    }
    next();
};

// ===== isStoreOwner =====
// checks that the logged-in user is a Store Owner
module.exports.isStoreOwner = (req, res, next) => {
    if (req.user.role !== "owner") {
        return next(new ExpressError(403, "You do not have permission to do that!"));
    }
    next();
};

// ===== validateSignup =====
// Joi validation for the public signup form
module.exports.validateSignup = (req, res, next) => {
    let { error } = signupSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

// ===== validateUser =====
// Joi validation for admin's "add user" form
module.exports.validateUser = (req, res, next) => {
    let { error } = userSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

// ===== validateStore =====
// Joi validation for admin's "add store" form
module.exports.validateStore = (req, res, next) => {
    let { error } = storeSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

// ===== validateRating =====
// Joi validation for a submitted rating
module.exports.validateRating = (req, res, next) => {
    let { error } = ratingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

// ===== validatePasswordUpdate =====
// Joi validation for the "change password" form
module.exports.validatePasswordUpdate = (req, res, next) => {
    let { error } = passwordUpdateSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        return next(new ExpressError(400, errMsg));
    }
    next();
};
