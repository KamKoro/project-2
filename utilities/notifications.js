const Notification = require('../models/notification');

async function createNotification({ userId, actorId, type, reviewId, filmId, text }) {
  if (userId.toString() === actorId.toString()) return null;

  return Notification.create({
    user: userId,
    actor: actorId,
    type,
    review: reviewId,
    film: filmId,
    text: text || '',
  });
}

async function getUnreadCount(userId) {
  return Notification.countDocuments({ user: userId, read: false });
}

async function getNotifications(userId, limit = 30) {
  return Notification.find({ user: userId })
    .populate('actor', 'username')
    .populate('film', 'title')
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function markAllRead(userId) {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
}

module.exports = {
  createNotification,
  getUnreadCount,
  getNotifications,
  markAllRead,
};
