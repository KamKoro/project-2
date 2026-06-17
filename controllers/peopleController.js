const express = require('express');
const router = express.Router();
const Film = require('../models/film');
const Review = require('../models/review');
const {
  getLocalDirectors,
  getLocalActors,
  getLocalDirector,
  getLocalActor,
  searchLocalDirectors,
  searchLocalActors,
} = require('../utilities/localPeople');
const { getLocalFilmsByDirector, getLocalFilmsByActor } = require('../utilities/localFilms');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  next();
}

async function getFilmStatsMap(films) {
  if (!films.length) return {};

  const ids = films.map((film) => film._id);
  const reviewCounts = await Review.aggregate([
    { $match: { film: { $in: ids } } },
    { $group: { _id: '$film', count: { $sum: 1 }, average: { $avg: '$rating' } } },
  ]);

  return Object.fromEntries(
    reviewCounts.map((entry) => [entry._id.toString(), {
      count: entry.count,
      average: Number(entry.average.toFixed(1)),
    }])
  );
}

router.get('/directors', requireLogin, async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    const directors = query ? searchLocalDirectors(query) : getLocalDirectors();

    res.render('people/directors', {
      user: req.session.user,
      query,
      people: directors,
      pageTitle: query ? `Directors matching “${query}”` : 'Directors',
    });
  } catch (err) {
    console.error('Error loading directors:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/actors', requireLogin, async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    const actors = query ? searchLocalActors(query) : getLocalActors();

    res.render('people/actors', {
      user: req.session.user,
      query,
      people: actors,
      pageTitle: query ? `Actors matching “${query}”` : 'Actors',
    });
  } catch (err) {
    console.error('Error loading actors:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/directors/:id', requireLogin, async (req, res) => {
  try {
    const director = getLocalDirector(req.params.id);
    if (!director) return res.status(404).send('Director not found');

    const catalogFilms = getLocalFilmsByDirector(director.id);
    const communityFilms = await Film.find({ director: director.name }).sort({ createdAt: -1 });
    const statsMap = await getFilmStatsMap(communityFilms);

    res.render('people/director-show', {
      user: req.session.user,
      person: director,
      catalogFilms,
      communityFilms,
      statsMap,
    });
  } catch (err) {
    console.error('Error loading director:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/actors/:id', requireLogin, async (req, res) => {
  try {
    const actor = getLocalActor(req.params.id);
    if (!actor) return res.status(404).send('Actor not found');

    const catalogFilms = getLocalFilmsByActor(actor.id);
    const communityFilms = await Film.find({ 'cast.name': actor.name }).sort({ createdAt: -1 });
    const statsMap = await getFilmStatsMap(communityFilms);

    res.render('people/actor-show', {
      user: req.session.user,
      person: actor,
      catalogFilms,
      communityFilms,
      statsMap,
    });
  } catch (err) {
    console.error('Error loading actor:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
