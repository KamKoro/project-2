const Review = require('../models/review');
const Comment = require('../models/comment');

async function getLatestCommunityReviews(limit = 10) {
  const reviews = await Review.find({ film: { $exists: true, $ne: null } })
    .populate('user', 'username')
    .populate('film')
    .sort({ createdAt: -1 });

  return reviews.filter((review) => review.film).slice(0, limit);
}

async function getReviewsForFilm(filmId) {
  return Review.find({ film: filmId })
    .populate('user', 'username')
    .sort({ createdAt: -1 });
}

async function getCommentsForReviews(reviewIds) {
  if (!reviewIds.length) return {};

  const comments = await Comment.find({ review: { $in: reviewIds } })
    .populate('user', 'username')
    .sort({ createdAt: 1 });

  return comments.reduce((map, comment) => {
    const key = comment.review.toString();
    if (!map[key]) map[key] = [];
    map[key].push(comment);
    return map;
  }, {});
}

async function getFollowingFeed(userId, limit = 20) {
  const User = require('../models/user');
  const user = await User.findById(userId).select('following');
  const followingIds = user?.following || [];

  if (!followingIds.length) return [];

  return Review.find({ user: { $in: followingIds }, film: { $exists: true } })
    .populate('user', 'username')
    .populate('film')
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function getTrendingFilms(limit = 8) {
  const results = await Review.aggregate([
    { $match: { film: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$film',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, average: -1 } },
    { $limit: limit },
  ]);

  const Film = require('../models/film');
  const films = await Promise.all(
    results.map(async (entry) => {
      const film = await Film.findById(entry._id);
      if (!film) return null;
      return {
        film,
        average: Number(entry.average.toFixed(1)),
        count: entry.count,
      };
    })
  );

  return films.filter(Boolean);
}

module.exports = {
  getLatestCommunityReviews,
  getReviewsForFilm,
  getCommentsForReviews,
  getFollowingFeed,
  getTrendingFilms,
};
