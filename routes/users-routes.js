const express = require("express");
const { check } = require("express-validator");

const usersController = require("./../controllers/users-controller");
const AppError = require("./../utils/appError");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.route("/").get(usersController.getAllUsers);
router.route("/signup").post(fileUpload.single("image"), [(check("name").not().isEmail(), check("email").normalizeEmail().isEmail(), check("password").isLength({ min: 6 }))], usersController.signup);
router.route("/login").post(usersController.login);

module.exports = router;
