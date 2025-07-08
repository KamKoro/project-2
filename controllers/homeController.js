const Movie = require('../models/movie');

// Render home page with movies for logged-in user
async function renderHome(req, res) {
  try {
    if (!req.session.user) {
      // No user logged in — render home with no movies
      return res.render('home', { user: null, movies: [], movieCount: 0 });
    }

    // Fetch movies for logged-in user, populate genre names
    const movies = await Movie.find({ user: req.session.user._id }).populate('genre', 'name').exec();

    // Render home.ejs with data
    res.render('home', {
      user: req.session.user,
      movies,
      movieCount: movies.length
    });
  } catch (err) {
    console.error('Error rendering home:', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = {
  renderHome
};
