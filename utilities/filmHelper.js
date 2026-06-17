const Film = require('../models/film');
const { getFilmDetails } = require('./tmdb');
const { getLocalFilm } = require('./localFilms');

async function findOrCreateFilmFromTmdb(tmdbId) {
  const existing = await Film.findOne({ tmdbId });
  if (existing) return existing;

  const details = await getFilmDetails(tmdbId);
  if (!details) {
    throw new Error('Could not fetch film details from TMDB');
  }

  return Film.create(details);
}

async function findOrCreateFilmManual(data) {
  const query = {
    title: data.title,
    releaseYear: data.releaseYear,
  };
  const existing = await Film.findOne(query);
  if (existing) return existing;

  return Film.create({
    title: data.title,
    releaseYear: data.releaseYear,
    director: data.director || '',
    genre: data.genre || '',
    overview: data.overview || '',
    cast: data.cast || [],
  });
}

async function findOrCreateFilmFromLocal(localId) {
  const localFilm = getLocalFilm(localId);
  if (!localFilm) {
    throw new Error('Local film not found');
  }

  return findOrCreateFilmManual({
    title: localFilm.title,
    releaseYear: localFilm.releaseYear,
    director: localFilm.director,
    genre: localFilm.genre,
    overview: localFilm.overview,
    cast: localFilm.cast,
  });
}

async function getFilmRatingStats(filmId) {
  const Review = require('../models/review');
  const result = await Review.aggregate([
    { $match: { film: filmId } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) {
    return { average: 0, count: 0 };
  }

  return {
    average: Number(result[0].average.toFixed(1)),
    count: result[0].count,
  };
}

module.exports = {
  findOrCreateFilmFromTmdb,
  findOrCreateFilmFromLocal,
  findOrCreateFilmManual,
  getFilmRatingStats,
};
