const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['follow', 'like', 'comment'],
    required: true,
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  },
  film: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Film',
  },
  text: {
    type: String,
    trim: true,
    default: '',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
