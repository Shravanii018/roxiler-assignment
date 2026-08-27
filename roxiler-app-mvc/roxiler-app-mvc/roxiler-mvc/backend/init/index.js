if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const bcrypt = require("bcryptjs");
const { sequelize, User } = require("../models");
const { defaultAdmin } = require("./data.js");

async function initDB() {
    // { alter: true } keeps the dev schema in sync with the models;
    // swap for real migrations in a production setting
    await sequelize.sync({ alter: true });
    console.log("Database synced.");

    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (!existingAdmin) {
        const hashed = await bcrypt.hash(defaultAdmin.password, 10);
        await User.create({ ...defaultAdmin, password: hashed });
        console.log(`Seeded default admin -> email: ${defaultAdmin.email} | password: ${defaultAdmin.password}`);
    } else {
        console.log("Admin user already exists, skipping seed.");
    }
}

initDB()
    .then(() => {
        console.log("Init complete.");
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
