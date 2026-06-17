const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  films: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Film',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);
