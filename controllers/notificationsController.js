const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
} = require('../utilities/notifications');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  next();
}

router.get('/notifications', requireLogin, async (req, res) => {
  try {
    const notifications = await getNotifications(req.session.user._id);
    await markAllRead(req.session.user._id);

    res.render('notifications/index', {
      user: req.session.user,
      notifications,
      unreadNotifications: 0,
    });
  } catch (err) {
    console.error('Error loading notifications:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
