const { posterUrl } = require('./tmdb');

function titleToPosterFilename(title) {
  return `${title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')}.png`;
}

function getLocalPosterPath(title) {
  return `/images/posters/${titleToPosterFilename(title)}`;
}

function getPosterFallbackPath(title) {
  return `/posters/generate?title=${encodeURIComponent(title || 'Film')}`;
}

function getPosterSrc(filmOrTitle, posterPath) {
  if (posterPath) {
    return posterUrl(posterPath);
  }

  const title = typeof filmOrTitle === 'string' ? filmOrTitle : filmOrTitle?.title;
  return getLocalPosterPath(title || 'Film');
}

module.exports = {
  titleToPosterFilename,
  getLocalPosterPath,
  getPosterFallbackPath,
  getPosterSrc,
  posterUrl,
};
