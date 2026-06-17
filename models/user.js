const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
  }],
});

module.exports = mongoose.model('User', userSchema);
