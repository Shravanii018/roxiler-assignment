const Joi = require("joi");

// Password: 8-16 chars, at least one uppercase letter, one special character
const passwordRule = Joi.string()
    .min(8)
    .max(16)
    .pattern(/[A-Z]/, "uppercase letter")
    .pattern(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`;']/, "special character")
    .required()
    .messages({
        "string.pattern.name": "Password must contain at least one {#name}",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must be at most 16 characters",
    });

// ===== signupSchema =====
// validates the public signup form (always creates a normal user)
module.exports.signupSchema = Joi.object({
    name: Joi.string().min(20).max(60).required(),
    email: Joi.string().email().required(),
    address: Joi.string().max(400).required(),
    password: passwordRule,
});

// ===== userSchema =====
// validates admin's "add user" form (can create admin/normal/owner)
module.exports.userSchema = Joi.object({
    name: Joi.string().min(20).max(60).required(),
    email: Joi.string().email().required(),
    address: Joi.string().max(400).required(),
    password: passwordRule,
    role: Joi.string().valid("admin", "normal", "owner").required(),
});

// ===== storeSchema =====
// validates admin's "add store" form
module.exports.storeSchema = Joi.object({
    name: Joi.string().min(20).max(60).required(),
    email: Joi.string().email().required(),
    address: Joi.string().max(400).required(),
    owner_id: Joi.number().integer().allow(null, ""),
});

// ===== ratingSchema =====
// validates a normal user's rating submission
module.exports.ratingSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
});

// ===== passwordUpdateSchema =====
// validates the "change password" form
module.exports.passwordUpdateSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: passwordRule,
});
