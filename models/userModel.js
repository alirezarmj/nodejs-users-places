const mongoose = require("mongoose");
const Place = require("./placeModel");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
  },
  email: {
    type: String,
    required: [true, "A user must have a email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 6,
  },
  image: {
    type: String,
    required: [true, "A user must have a image"],
  },

  places: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Place",
      required: true,
    },
  ],
});

// userSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "places",
//     select: "-__v",
//   });
//   next();
// });
// userSchema.pre("save", async function (next) {
//   const placesPromises = this.places.map(async (id) => await Place.findById(id));
//   this.places = await Promise.all(placesPromises);
//   next();
// });
const User = mongoose.model("User", userSchema);

module.exports = User;
