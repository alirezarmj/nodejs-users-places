const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AppError = require("../utils/appError");
const User = require("../models/userModel");

// let DUMMY_USERS = [
//   {
//     id: "u1",
//     name: "John Doe",
//     email: "john@example.com",
//     password: "password123", // Note: In a real app, passwords should be hashed!
//   },
//   {
//     id: "u2",
//     name: "John2 Doe",
//     email: "john2@example.com",
//     password: "password1234", // Note: In a real app, passwords should be hashed!
//   },
// ];

exports.getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find().select("-password");
  } catch (error) {
    next(new AppError("Fetching users faield, please try again later", 500));
  }
  res.status(200).json({ users });
};

exports.signup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new AppError("Invalid input pass, please check your data"));
  }
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return next(new AppError("User already exists!", 422));
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
    next(new AppError("could not create hashed password", 500));
  }
  const newUser = new User({
    name,
    email,
    password: hashedPassword, // In a real app, hash the password before storing!
    image: req.file.path,
    places: [],
  });
  try {
    await newUser.save();
  } catch (error) {
    console.log("Error: ", error);
    next(new AppError("Signing up failed", 500));
  }
  let token;
  try {
    token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (err) {
    console.log("Error: ", err);
    next(new AppError("Signing up failed", 500));
  }
  // DUMMY_USERS.push(newUser);
  res.status(201).json({ userId: newUser._id, email: newUser.email, token });
};

exports.login = async (req, res, next) => {
  // console.log("process.env.JWT_SECRET", process.env.JWT_SECRET);
  // console.log("process.env.JWT_EXPIRES_IN", process.env.JWT_EXPIRES_IN);
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new AppError("Logging in failed, please try again later.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new AppError("Invalid credentials, could not log you in.", 401);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    next(new AppError("Could not log you in, please check your credetials and try again later!", 500));
  }
  if (!isValidPassword) {
    const error = new AppError("Invalid credentials, could not log you in.", 401);
    return next(error);
  }
  // console.log("process.env.JWT_SECRET", process.env.JWT_SECRET);

  let token;
  try {
    token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (err) {
    console.log("Error: ", err);
    next(new AppError("Logging failed", 500));
  }
  res.status(200).json({ userId: existingUser._id, email: existingUser.email, token });
};
