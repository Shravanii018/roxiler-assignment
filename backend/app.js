if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const ExpressError = require("./utils/ExpressError.js");
const { sequelize } = require("./models");

const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const storeRouter = require("./routes/store.js");
const ownerRouter = require("./routes/owner.js");

sequelize.authenticate()
    .then(() => {
        console.log("connected to DB");
    }).catch(err => {
        console.log(err);
    });

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", userRouter);          // signup, login, password, me
app.use("/api/admin", adminRouter);        // manage users, stores, dashboard
app.use("/api/stores", storeRouter);       // normal user: browse & rate stores
app.use("/api/owner", ownerRouter);        // store owner: dashboard

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Route not found!"));
});

// global error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
});
