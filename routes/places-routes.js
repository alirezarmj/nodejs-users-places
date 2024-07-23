const express = require("express");
const { check } = require("express-validator");

const placesController = require("./../controllers/places-controller");
const AppError = require("./../utils/appError");
const fileUpload = require("../middleware/file-upload");
const { checkAuth } = require("../middleware/check-auth");

const router = express.Router();

router.route("/user/:uid").get(placesController.getPlacesByUserId);
router.route("/:pid").get(placesController.getPlaceById);
router.use(checkAuth);
router.route("/:pid").patch(placesController.updatePlace).delete(placesController.deletePlace);
router.route("/").post(fileUpload.single("image"), [check("title").not().isEmpty(), check("description").isLength({ min: 5 }), check("address").not().isEmpty()], placesController.createPlace);

module.exports = router;
