const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const placesRoutes = require("./routes/places-routes");
const AppError = require("./utils/appError");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);
//for other routes:
app.all("*", (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} on this server`, 404));
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headersSent) {
    //Error Handling Middleware
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || "An unknown error occurred!" });
});
// console.log(process.env.DATABASE);
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.MONGODB_PASSWORD);
mongoose.connect(DB).then(() => {
  console.log("DB connection successful!");
});
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
