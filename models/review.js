const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  film: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Film',
    required: true,
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },
  text: {
    type: String,
    trim: true,
    default: '',
  },
  watchedAt: {
    type: Date,
    default: Date.now,
  },
  watchHistory: [{
    watchedAt: { type: Date, required: true },
    rating: { type: Number, min: 1, max: 10 },
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

reviewSchema.index({ user: 1, film: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, movie: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
