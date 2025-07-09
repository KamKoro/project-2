// models/director.js

const mongoose = require("mongoose");

const directorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    unique: true,
    trim: true
  }
});

module.exports = mongoose.model("Director", directorSchema);
