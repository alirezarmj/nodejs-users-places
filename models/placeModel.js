const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A place must have a title"],
  },
  description: {
    type: String,
    required: [true, "A place must have a description"],
  },
  image: {
    type: String,
    required: [true, "A place must have a description"],
  },
  address: {
    type: String,
    required: [true, "A place must have a description"],
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A place must have a creator"],
  },
});
placeSchema.pre(/^find/, function (next) {
  this.populate({
    path: "creator",
    select: "-__v",
  });
  next();
});
const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
