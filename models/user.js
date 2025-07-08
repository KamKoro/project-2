const mongoose = require("mongoose");

// models/user.js

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  movies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie" // Reference to the Movie model
    }
  ]
});

const User = mongoose.model("User", userSchema);
module.exports = User;
// This model defines a User schema with username and password fields,
// and an array of movies that references the Movie model.