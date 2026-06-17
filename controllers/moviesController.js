const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const Film = require('../models/film');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  next();
}

router.get('/community/movies', requireLogin, (req, res) => {
  res.redirect('/films');
});

router.get('/movies/new', requireLogin, (req, res) => {
  res.redirect('/films/log');
});

router.get('/users/:userId/movies', requireLogin, (req, res) => {
  if (req.session.user._id !== req.params.userId) {
    return res.status(403).send('Forbidden');
  }
  res.redirect('/diary');
});

router.get('/users/:userId/movies/new', requireLogin, (req, res) => {
  res.redirect('/films/log');
});

router.get('/movies/:movieId', requireLogin, async (req, res) => {
  const film = await Film.findById(req.params.movieId);
  if (film) return res.redirect(`/films/${film._id}`);

  const movie = await Movie.findById(req.params.movieId);
  if (movie) return res.status(410).send('This film used the old format. Please log it again from Discover.');

  res.status(404).send('Not found');
});

module.exports = router;
