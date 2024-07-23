const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");
const fs = require("fs");

const AppError = require("../utils/appError");
const getCoordsForAddress = require("../utils/geocode");
const Place = require("../models/placeModel");
const User = require("../models/userModel");
const { default: mongoose } = require("mongoose");

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path, // => File Upload module, will be replaced with real image url
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    console.error("Error details:", err); // Log the detailed error
    next(new AppError("Could not find place with that Id", 404));
  }

  // const place = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!place) {
    return next(new AppError("Could not find a place with that user Id!", 404));
  }
  res.json({
    place,
  });
};

exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let places;
  let userPlaces;
  try {
    userPlaces = await User.findById(userId).populate("places");
    // places = await Place.find({ creator: userId });
  } catch (err) {
    console.error("Error details:", err); // Log the detailed error
    next(new AppError("Could not find place with that Id", 404));
  }
  // const places = DUMMY_PLACES.filter((p) => p.creator === userId);
  if (!userPlaces || userPlaces.length === 0) {
    /*
      const error = new Error("Could not find a place with that user Id!");
      error.code = 404;
      next(error);
      */
    return next(new AppError("Could not find any place with that user Idd!", 404));
  }
  res.json({
    places: userPlaces.places,
  });
};

exports.updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new AppError("Invalid input pass, please check your data"));
  }
  // const { title, description } = req.body;
  // const { pid } = req.params;

  // const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === pid) };
  // const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === pid);
  // updatedPlace.title = title;
  // updatedPlace.description = description;
  // DUMMY_PLACES[placeIndex] = updatedPlace;
  let place;
  place = await Place.findById(req.params.pid);
  if (place.creator.toString() !== req.userData.userId) {
    return next(new AppError("You are not allowed to edit this place", 401));
  }

  let updatedPlace;
  try {
    updatedPlace = await Place.findByIdAndUpdate(req.params.pid, req.body, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    next(new AppError("Updating is faild", 500));
  }

  res.status(200).json({
    place: updatedPlace,
  });
};
exports.deletePlace = async (req, res, next) => {
  const { pid } = req.params;

  let place;
  try {
    place = await Place.findById(pid).populate("creator");
  } catch (error) {
    return next(new AppError("Something went wrong, could not delete place", 500));
  }

  if (!place) {
    return next(new AppError("Could not find place with that Id", 404));
  }
  if (place.creator.id !== req.userData.userId) {
    return next(new AppError("You are not allowed to delete this place", 401));
  }
  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Place.deleteOne({ _id: pid }, { session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.error("Error details:", err); // Log the detailed error
    return next(new AppError("Deleting place failed, please try again!", 500));
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({
    message: "Place deleted!",
  });
};
