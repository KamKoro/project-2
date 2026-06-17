const Film = require('../models/film');
const { searchLocalFilms } = require('./localFilms');
const { searchLocalDirectors, searchLocalActors } = require('./localPeople');

async function buildSearchResults(query, mode = 'all') {
  const q = (query || '').trim();
  if (q.length < 2) {
    return { groups: [] };
  }

  const groups = [];
  const includeFilms = mode === 'all' || mode === 'catalog' || mode === 'log';
  const includeDirectors = mode === 'all' || mode === 'directors';
  const includeActors = mode === 'all' || mode === 'actors';

  if (includeFilms) {
    const communityFilms = await Film.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { director: { $regex: q, $options: 'i' } },
        { 'cast.name': { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title director releaseYear genre');

    if (communityFilms.length) {
      groups.push({
        label: 'Community films',
        items: communityFilms.map((film) => ({
          title: film.title,
          meta: [film.releaseYear, film.director].filter(Boolean).join(' · '),
          url: `/films/${film._id}`,
        })),
      });
    }

    const catalogFilms = searchLocalFilms(q).slice(0, 5);
    if (catalogFilms.length) {
      groups.push({
        label: mode === 'log' ? 'Catalog — log a film' : 'Catalog films',
        items: catalogFilms.map((film) => ({
          title: film.title,
          meta: [film.releaseYear, film.director].filter(Boolean).join(' · '),
          url: `/films/log?film=${film.id}`,
        })),
      });
    }
  }

  if (includeDirectors) {
    const directors = searchLocalDirectors(q).slice(0, 4);
    if (directors.length) {
      groups.push({
        label: 'Directors',
        items: directors.map((person) => ({
          title: person.name,
          meta: 'Director',
          url: `/directors/${person.id}`,
        })),
      });
    }
  }

  if (includeActors) {
    const actors = searchLocalActors(q).slice(0, 4);
    if (actors.length) {
      groups.push({
        label: 'Actors',
        items: actors.map((person) => ({
          title: person.name,
          meta: 'Actor',
          url: `/actors/${person.id}`,
        })),
      });
    }
  }

  return { groups };
}

module.exports = { buildSearchResults };
