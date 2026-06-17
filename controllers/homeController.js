const Review = require('../models/review');
const Watchlist = require('../models/watchlist');
const {
  getLatestCommunityReviews,
  getTrendingFilms,
  getFollowingFeed,
} = require('../utilities/communityReviews');
const { computeUserStats } = require('../utilities/userStats');

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

async function renderHome(req, res) {
  try {
    const latestReviews = await getLatestCommunityReviews(5);
    const trending = await getTrendingFilms(6);
    const user = req.session.user || null;

    if (!user) {
      return res.render('home', {
        user: null,
        movieCount: 0,
        movies: [],
        latestReviews,
        trending,
        feed: [],
        watchlistCount: 0,
        ratingLabels,
        badgeColorClass,
      });
    }

    const reviews = await Review.find({
      user: user._id,
      film: { $exists: true, $ne: null },
    }).populate('film');

    const watchlistCount = await Watchlist.countDocuments({ user: user._id });
    const feed = await getFollowingFeed(user._id, 5);
    const movieCount = reviews.length;
    const stats = computeUserStats(reviews);

    res.render('home', {
      user,
      movieCount,
      movies: reviews.map((r) => r.film).filter(Boolean),
      latestReviews,
      trending,
      feed,
      watchlistCount,
      reviews,
      stats,
      ratingLabels,
      badgeColorClass,
    });
  } catch (err) {
    console.error('Error rendering home:', err);
    res.render('home', {
      user: null,
      movieCount: 0,
      movies: [],
      latestReviews: [],
      trending: [],
      feed: [],
      watchlistCount: 0,
      stats: { reviewCount: 0, filmsThisYear: 0, avgRating: '0.0', favoriteGenre: null },
      ratingLabels,
      badgeColorClass,
    });
  }
}

module.exports = { renderHome };
