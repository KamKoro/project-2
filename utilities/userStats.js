function computeUserStats(reviews) {
  const valid = reviews.filter((r) => r.film);
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const filmsThisYear = valid.filter(
    (r) => r.watchedAt && new Date(r.watchedAt) >= yearStart
  ).length;

  const avgRating = valid.length
    ? (valid.reduce((sum, r) => sum + r.rating, 0) / valid.length).toFixed(1)
    : '0.0';

  const genreCounts = valid.reduce((counts, r) => {
    const genre = r.film?.genre;
    if (!genre) return counts;
    counts[genre] = (counts[genre] || 0) + 1;
    return counts;
  }, {});

  const favoriteGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    filmsThisYear,
    avgRating,
    favoriteGenre,
    reviewCount: valid.length,
  };
}

module.exports = { computeUserStats };
