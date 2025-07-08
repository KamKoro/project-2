const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Movie = require('../models/movie');
const Genre = require('../models/genre');

//* Middleware to ensure user is logged in
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/sign-in');
    }
    next();
}

//* Middleware to check if user matches the session
function verifyOwnership(req, res, next) {
    if (req.session.user._id !== req.params.userId) {
        return res.status(403).send("Forbidden");
    }
    next();
}

//* INDEX — Show all movies for the logged-in user with data for client-side filters
router.get('/users/:userId/movies', requireLogin, verifyOwnership, async (req, res) => {
    try {
        const movies = await Movie.find({ user: req.params.userId })
            .populate('genre', 'name') // Ensure genre is populated
            .exec();

        // Calculate unique genres
        const genreSet = new Set();
        movies.forEach(m => {
            if (m.genre && m.genre.name) {
                genreSet.add(m.genre.name); // Add genre name to Set for uniqueness
            }
        });
        const genreCount = genreSet.size; // Get unique genre count

        // Get genres and directors for filters
        const genres = await Genre.find({}).sort({ name: 1 });
        const directors = [...new Set(movies.map(m => m.director).filter(Boolean))].sort();
        const years = [...new Set(movies.map(m => m.releaseYear).filter(Boolean))].sort((a, b) => a - b);

        res.render('movies/index', {
            movies,
            user: req.session.user,
            movieCount: movies.length,
            genreCount,  // Pass the genre count
            genres,
            directors,
            years
        });
    } catch (err) {
        console.error("Error fetching movies:", err);
        res.status(500).send("Internal Server Error");
    }
});

//* NEW — Form to add a new movie
router.get('/users/:userId/movies/new', requireLogin, verifyOwnership, async (req, res) => {
    try {
        const genres = await Genre.find({});
        res.render('movies/new', {
            user: req.session.user,
            movie: {},
            genres
        });
    } catch (err) {
        console.error("Error loading new movie form:", err);
        res.status(500).send("Internal Server Error");
    }
});

//* CREATE — Add a movie and reference it in the user
router.post('/users/:userId/movies', requireLogin, verifyOwnership, async (req, res) => {
    try {
        const movieData = {
            ...req.body,
            user: req.params.userId,
            director: req.body.director,
            inWatchlist: req.body.inWatchlist === 'on', // Ensure 'on' value for checkbox
            rating: parseInt(req.body.rating, 10) || 0 // Default to 0 if no rating is provided
        };

        // Create and save the new movie to the database
        const newMovie = await Movie.create(movieData);

        // Add the new movie to the user's movies array
        await User.findByIdAndUpdate(req.params.userId, {
            $push: { movies: newMovie._id }
        });

        res.redirect(`/users/${req.params.userId}/movies`);
    } catch (err) {
        console.error("Error creating movie:", err);
        res.status(500).send("Internal Server Error");
    }
});

//* SHOW — Show details for a single movie
router.get('/movies/:movieId', requireLogin, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId).populate('genre', 'name');

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        if (movie.user.toString() !== req.session.user._id) {
            return res.status(403).send('Forbidden');
        }

        res.render('movies/show', { movie, user: req.session.user });
    } catch (err) {
        console.error('Error fetching movie:', err);
        res.status(500).send('Internal Server Error');
    }
});

//* EDIT — Show form to edit a movie
router.get('/users/:userId/movies/:movieId/edit', requireLogin, verifyOwnership, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);

        if (!movie || movie.user.toString() !== req.params.userId) {
            return res.status(403).send("Forbidden or movie not found");
        }

        const genres = await Genre.find({});

        res.render('movies/edit', {
            movie,
            user: req.session.user,
            genres
        });
    } catch (err) {
        console.error("Error loading edit form:", err);
        res.status(500).send("Internal Server Error");
    }
});

//* UPDATE — Save changes to a movie
router.put('/users/:userId/movies/:movieId', requireLogin, verifyOwnership, async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            director: req.body.director,
            inWatchlist: req.body.inWatchlist === 'on',
            rating: parseInt(req.body.rating, 10) || 0
        };

        const movie = await Movie.findById(req.params.movieId);

        if (!movie || movie.user.toString() !== req.params.userId) {
            return res.status(403).send("Forbidden or movie not found");
        }

        await Movie.findByIdAndUpdate(req.params.movieId, updateData, { new: true });

        res.redirect(`/users/${req.params.userId}/movies`);
    } catch (err) {
        console.error("Error updating movie:", err);
        res.status(500).send("Internal Server Error");
    }
});

//* DELETE — Remove a movie
router.delete('/users/:userId/movies/:movieId', requireLogin, verifyOwnership, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);

        if (!movie || movie.user.toString() !== req.params.userId) {
            return res.status(403).send("Forbidden or movie not found");
        }

        await Movie.findByIdAndDelete(req.params.movieId);

        await User.findByIdAndUpdate(req.params.userId, {
            $pull: { movies: req.params.movieId }
        });

        res.redirect(`/users/${req.params.userId}/movies`);
    } catch (err) {
        console.error("Error deleting movie:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
