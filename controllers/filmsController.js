const express = require('express');
const router = express.Router();
const Film = require('../models/film');
const Review = require('../models/review');
const Watchlist = require('../models/watchlist');
const User = require('../models/user');
const { findOrCreateFilmFromTmdb, findOrCreateFilmManual, getFilmRatingStats } = require('../utilities/filmHelper');
const { computeUserStats } = require('../utilities/userStats');
const { searchFilms, hasTmdb, backdropUrl } = require('../utilities/tmdb');
const {
  getLatestCommunityReviews,
  getReviewsForFilm,
  getCommentsForReviews,
  getTrendingFilms,
} = require('../utilities/communityReviews');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  next();
}

function badgeColorClass(rating) {
  if (rating >= 8) return 'high';
  if (rating >= 5) return 'mid';
  if (rating > 0) return 'low';
  return '';
}

const ratingLabels = {
  1: 'Awful', 2: 'Bad', 3: 'Poor', 4: 'Watchable', 5: 'Okay',
  6: 'Good', 7: 'Very Good', 8: 'Great', 9: 'Excellent', 10: 'Masterpiece',
};

router.get('/films', requireLogin, async (req, res) => {
  try {
    const { q, genre, sort } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { director: { $regex: q, $options: 'i' } },
        { 'cast.name': { $regex: q, $options: 'i' } },
      ];
    }
    if (genre) filter.genre = genre;

    let films = await Film.find(filter).sort({ createdAt: -1 }).limit(100);
    const genres = await Film.distinct('genre');
    const reviewCounts = await Review.aggregate([
      { $match: { film: { $exists: true } } },
      { $group: { _id: '$film', count: { $sum: 1 }, average: { $avg: '$rating' } } },
    ]);
    const statsMap = Object.fromEntries(
      reviewCounts.map((entry) => [entry._id.toString(), {
        count: entry.count,
        average: Number(entry.average.toFixed(1)),
      }])
    );

    if (sort === 'rating') {
      films = films.sort((a, b) => (statsMap[b._id]?.average || 0) - (statsMap[a._id]?.average || 0));
    } else if (sort === 'popular') {
      films = films.sort((a, b) => (statsMap[b._id]?.count || 0) - (statsMap[a._id]?.count || 0));
    }

    const communityReviews = await getLatestCommunityReviews(5);
    const trending = await getTrendingFilms(6);

    res.render('films/index', {
      films,
      statsMap,
      genres: genres.filter(Boolean).sort(),
      communityReviews,
      trending,
      user: req.session.user,
      query: { q: q || '', genre: genre || '', sort: sort || 'newest' },
      ratingLabels,
      badgeColorClass,
    });
  } catch (err) {
    console.error('Error browsing films:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/films/log', requireLogin, async (req, res) => {
  try {
    const { q } = req.query;
    let results = [];
    if (q && hasTmdb()) {
      results = await searchFilms(q);
    }

    res.render('films/log', {
      user: req.session.user,
      query: q || '',
      results,
      hasTmdb: hasTmdb(),
    });
  } catch (err) {
    console.error('Error loading log form:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/films/log', requireLogin, async (req, res) => {
  try {
    const rating = parseInt(req.body.rating, 10);
    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).send('A rating between 1 and 10 is required');
    }

    let film;
    if (req.body.tmdbId) {
      film = await findOrCreateFilmFromTmdb(parseInt(req.body.tmdbId, 10));
    } else {
      film = await findOrCreateFilmManual({
        title: req.body.title,
        releaseYear: parseInt(req.body.releaseYear, 10),
        director: req.body.director,
        genre: req.body.genre,
        overview: req.body.overview,
      });
    }

    const watchedAt = req.body.watchedAt ? new Date(req.body.watchedAt) : new Date();

    await Review.findOneAndUpdate(
      { user: req.session.user._id, film: film._id },
      {
        user: req.session.user._id,
        film: film._id,
        rating,
        text: req.body.text || '',
        watchedAt,
      },
      { upsert: true, new: true }
    );

    await Watchlist.deleteOne({ user: req.session.user._id, film: film._id });

    res.redirect(`/films/${film._id}`);
  } catch (err) {
    console.error('Error logging film:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/films/:filmId', requireLogin, async (req, res) => {
  try {
    const film = await Film.findById(req.params.filmId);
    if (!film) return res.status(404).send('Film not found');

    const reviews = await getReviewsForFilm(film._id);
    const stats = await getFilmRatingStats(film._id);
    const commentsByReview = await getCommentsForReviews(reviews.map((r) => r._id));

    const currentUserReview = reviews.find(
      (review) => review.user._id.toString() === req.session.user._id
    ) || null;

    const otherReviews = reviews
      .filter((review) => review.user._id.toString() !== req.session.user._id)
      .map((review) => {
        const data = review.toObject();
        data.film = film;
        data.commentCount = (commentsByReview[review._id.toString()] || []).length;
        return data;
      });

    const onWatchlist = await Watchlist.exists({
      user: req.session.user._id,
      film: film._id,
    });

    const List = require('../models/list');
    const userLists = await List.find({ user: req.session.user._id }).sort({ name: 1 });

    res.render('films/show', {
      film,
      user: req.session.user,
      stats,
      otherReviews,
      currentUserReview,
      commentsByReview,
      onWatchlist: Boolean(onWatchlist),
      userLists,
      backdropUrl: backdropUrl(film.backdropPath),
      ratingLabels,
      badgeColorClass,
    });
  } catch (err) {
    console.error('Error fetching film:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/films/:filmId/reviews', requireLogin, async (req, res) => {
  try {
    const film = await Film.findById(req.params.filmId);
    if (!film) return res.status(404).send('Film not found');

    const rating = parseInt(req.body.rating, 10);
    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).send('A rating between 1 and 10 is required');
    }

    const watchedAt = req.body.watchedAt ? new Date(req.body.watchedAt) : new Date();

    await Review.findOneAndUpdate(
      { user: req.session.user._id, film: film._id },
      {
        user: req.session.user._id,
        film: film._id,
        rating,
        text: req.body.text || '',
        watchedAt,
      },
      { upsert: true, new: true }
    );

    await Watchlist.deleteOne({ user: req.session.user._id, film: film._id });
    res.redirect(`/films/${film._id}`);
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/films/:filmId/reviews/:reviewId', requireLogin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review || review.user.toString() !== req.session.user._id) {
      return res.status(403).send('Forbidden');
    }

    const rating = parseInt(req.body.rating, 10);
    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).send('A rating between 1 and 10 is required');
    }

    review.rating = rating;
    review.text = req.body.text || '';
    if (req.body.watchedAt) review.watchedAt = new Date(req.body.watchedAt);
    await review.save();

    res.redirect(`/films/${req.params.filmId}`);
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/films/:filmId/reviews/:reviewId', requireLogin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review || review.user.toString() !== req.session.user._id) {
      return res.status(403).send('Forbidden');
    }

    const Comment = require('../models/comment');
    await Comment.deleteMany({ review: review._id });
    await review.deleteOne();
    res.redirect(`/films/${req.params.filmId}`);
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/films/:filmId/rewatch', requireLogin, async (req, res) => {
  try {
    const film = await Film.findById(req.params.filmId);
    if (!film) return res.status(404).send('Film not found');

    const review = await Review.findOne({
      user: req.session.user._id,
      film: film._id,
    });

    if (!review) {
      return res.redirect(`/films/${film._id}`);
    }

    const watchedAt = req.body.watchedAt ? new Date(req.body.watchedAt) : new Date();
    const rating = parseInt(req.body.rating, 10) || review.rating;

    review.watchHistory.push({ watchedAt, rating });
    review.watchedAt = watchedAt;
    review.rating = rating;
    if (req.body.text !== undefined) review.text = req.body.text;
    await review.save();

    res.redirect(`/films/${film._id}`);
  } catch (err) {
    console.error('Error logging rewatch:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/films/:filmId/watchlist', requireLogin, async (req, res) => {
  try {
    const film = await Film.findById(req.params.filmId);
    if (!film) return res.status(404).send('Film not found');

    const existing = await Watchlist.findOne({
      user: req.session.user._id,
      film: film._id,
    });

    if (existing) {
      await existing.deleteOne();
    } else {
      await Watchlist.create({ user: req.session.user._id, film: film._id });
    }

    const redirectTo = req.body.redirect || `/films/${film._id}`;
    res.redirect(redirectTo);
  } catch (err) {
    console.error('Error toggling watchlist:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/watchlist', requireLogin, async (req, res) => {
  try {
    const entries = await Watchlist.find({ user: req.session.user._id })
      .populate('film')
      .sort({ createdAt: -1 });

    res.render('films/watchlist', {
      user: req.session.user,
      entries: entries.filter((entry) => entry.film),
    });
  } catch (err) {
    console.error('Error loading watchlist:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/diary', requireLogin, async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.session.user._id,
      film: { $exists: true, $ne: null },
    })
      .populate('film')
      .sort({ watchedAt: -1 });

    const filtered = reviews.filter((r) => r.film);
    const stats = computeUserStats(filtered);

    res.render('films/diary', {
      user: req.session.user,
      reviews: filtered,
      stats,
    });
  } catch (err) {
    console.error('Error loading diary:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
