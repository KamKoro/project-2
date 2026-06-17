const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Comment = require('../models/comment');
const { getFollowingFeed } = require('../utilities/communityReviews');
const { createNotification } = require('../utilities/notifications');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  next();
}

const ratingLabels = {
  1: 'Awful', 2: 'Bad', 3: 'Poor', 4: 'Watchable', 5: 'Okay',
  6: 'Good', 7: 'Very Good', 8: 'Great', 9: 'Excellent', 10: 'Masterpiece',
};

function badgeColorClass(rating) {
  if (rating >= 8) return 'high';
  if (rating >= 5) return 'mid';
  if (rating > 0) return 'low';
  return '';
}

router.get('/feed', requireLogin, async (req, res) => {
  try {
    const feed = await getFollowingFeed(req.session.user._id, 30);
    res.render('social/feed', {
      user: req.session.user,
      feed,
      ratingLabels,
      badgeColorClass,
    });
  } catch (err) {
    console.error('Error loading feed:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/reviews/:reviewId/like', requireLogin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).send('Review not found');

    const userId = req.session.user._id;
    const alreadyLiked = review.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      review.likes = review.likes.filter((id) => id.toString() !== userId);
    } else {
      review.likes.push(userId);
      await createNotification({
        userId: review.user,
        actorId: userId,
        type: 'like',
        reviewId: review._id,
        filmId: review.film,
      });
    }

    await review.save();
    res.redirect(req.body.redirect || `/films/${review.film}`);
  } catch (err) {
    console.error('Error liking review:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/reviews/:reviewId/comments', requireLogin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).send('Review not found');

    const text = (req.body.text || '').trim();
    if (!text) return res.redirect(req.body.redirect || `/films/${review.film}`);

    await Comment.create({
      user: req.session.user._id,
      review: review._id,
      text,
    });

    await createNotification({
      userId: review.user,
      actorId: req.session.user._id,
      type: 'comment',
      reviewId: review._id,
      filmId: review.film,
      text,
    });

    res.redirect(req.body.redirect || `/films/${review.film}`);
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
