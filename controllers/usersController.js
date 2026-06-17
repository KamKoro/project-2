const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Review = require('../models/review');
const Watchlist = require('../models/watchlist');
const List = require('../models/list');
const { createNotification } = require('../utilities/notifications');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  next();
}

router.get('/profiles/:username', requireLogin, async (req, res) => {
  try {
    const profileUser = await User.findOne({ username: req.params.username });
    if (!profileUser) return res.status(404).send('User not found');

    const reviews = await Review.find({
      user: profileUser._id,
      film: { $exists: true, $ne: null },
    })
      .populate('film')
      .sort({ watchedAt: -1 });

    const lists = await List.find({
      user: profileUser._id,
      $or: [{ isPublic: true }, { user: req.session.user._id }],
    }).sort({ createdAt: -1 });

    const currentUser = await User.findById(req.session.user._id).select('following');
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === profileUser._id.toString()
    );
    const isOwnProfile = profileUser._id.toString() === req.session.user._id;

    const followerCount = await User.countDocuments({ following: profileUser._id });
    const followingCount = profileUser.following?.length || 0;
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

    res.render('profiles/show', {
      user: req.session.user,
      profileUser,
      reviews: reviews.filter((r) => r.film),
      lists,
      isFollowing,
      isOwnProfile,
      followerCount,
      followingCount,
      avgRating,
      reviewCount: reviews.length,
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/profiles/:username/follow', requireLogin, async (req, res) => {
  try {
    const profileUser = await User.findOne({ username: req.params.username });
    if (!profileUser) return res.status(404).send('User not found');

    if (profileUser._id.toString() === req.session.user._id) {
      return res.redirect(`/profiles/${profileUser.username}`);
    }

    await User.findByIdAndUpdate(req.session.user._id, {
      $addToSet: { following: profileUser._id },
    });

    await createNotification({
      userId: profileUser._id,
      actorId: req.session.user._id,
      type: 'follow',
    });

    res.redirect(`/profiles/${profileUser.username}`);
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/profiles/:username/unfollow', requireLogin, async (req, res) => {
  try {
    const profileUser = await User.findOne({ username: req.params.username });
    if (!profileUser) return res.status(404).send('User not found');

    await User.findByIdAndUpdate(req.session.user._id, {
      $pull: { following: profileUser._id },
    });

    res.redirect(`/profiles/${profileUser.username}`);
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
