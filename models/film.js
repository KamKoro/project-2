const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  releaseYear: {
    type: Number,
    min: 1888,
  },
  director: {
    type: String,
    trim: true,
    default: '',
  },
  genre: {
    type: String,
    trim: true,
    default: '',
  },
  overview: {
    type: String,
    trim: true,
    default: '',
  },
  posterPath: {
    type: String,
    default: '',
  },
  backdropPath: {
    type: String,
    default: '',
  },
  runtime: {
    type: Number,
    min: 0,
  },
  cast: [{
    name: String,
    character: String,
  }],
}, { timestamps: true });

filmSchema.index({ title: 'text', director: 'text' });

module.exports = mongoose.model('Film', filmSchema);
