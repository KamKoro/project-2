// Set TMDB_API_KEY in .env for live TMDB search; otherwise the local film catalog is used.
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

function hasTmdb() {
  return Boolean(TMDB_API_KEY);
}

async function tmdbFetch(path, params = {}) {
  if (!hasTmdb()) return null;

  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }
  return response.json();
}

async function searchFilms(query) {
  if (!query || !hasTmdb()) return [];
  const data = await tmdbFetch('/search/movie', { query, include_adult: 'false' });
  return data?.results?.slice(0, 12) || [];
}

async function getFilmDetails(tmdbId) {
  if (!tmdbId || !hasTmdb()) return null;
  const [details, credits] = await Promise.all([
    tmdbFetch(`/movie/${tmdbId}`),
    tmdbFetch(`/movie/${tmdbId}/credits`),
  ]);

  if (!details) return null;

  const director = credits?.crew?.find((person) => person.job === 'Director');
  const cast = (credits?.cast || []).slice(0, 6).map((actor) => ({
    name: actor.name,
    character: actor.character,
  }));

  return {
    tmdbId: details.id,
    title: details.title,
    releaseYear: details.release_date ? parseInt(details.release_date.slice(0, 4), 10) : null,
    director: director?.name || '',
    genre: details.genres?.[0]?.name || '',
    overview: details.overview || '',
    posterPath: details.poster_path || '',
    backdropPath: details.backdrop_path || '',
    runtime: details.runtime || null,
    cast,
  };
}

function posterUrl(posterPath, size = 'w500') {
  if (!posterPath) return '';
  if (posterPath.startsWith('http')) return posterPath;
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

function backdropUrl(backdropPath, size = 'w1280') {
  if (!backdropPath) return '';
  return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
}

module.exports = {
  hasTmdb,
  searchFilms,
  getFilmDetails,
  posterUrl,
  backdropUrl,
};
