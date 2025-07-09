// Importing required modules and configurations
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo');

// Controllers & Middleware
const moviesController = require('./controllers/moviesController');
const authController = require('./controllers/authController');
const isSignedIn = require('./middleware/isSignedIn');
const passUserToView = require('./middleware/passUserToView');

// View engine setup
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Optional: Force lowercase URLs and decode them (if necessary)
// This helps catch any URL issues caused by mixed casing or encoding
app.use((req, res, next) => {
  try {
    req.url = decodeURIComponent(req.url);
  } catch (err) {
    console.error("Failed to decode URL", req.url);
  }
  next();
});

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "i-like-turtles",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: "native",
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      sameSite: 'lax',
    },
    name: "project2.sid",
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
});

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

// Dev mode logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(` Incoming request: ${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use(passUserToView);

// Middleware to pass user to views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Home route
app.get("/", async (req, res) => {
  try {
    const user = req.session.user || null;

    if (!user) {
      return res.render("home", {
        user: null,
        movieCount: 0,
        movies: []
      });
    }

    const movies = await mongoose.model('Movie').find({ user: user._id });
    const movieCount = movies.length;

    res.render("home", {
      user,
      movieCount,
      movies
    });
  } catch (err) {
    console.error("Error loading home page:", err);
    res.render("home", {
      user: null,
      movieCount: 0,
      movies: []
    });
  }
});

// Auth routes (login, logout, register)
app.use('/auth', authController);

// Middleware to protect routes below
app.use(isSignedIn);

// Shortcut route for new movie form
app.get('/movies/new', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  res.redirect(`/users/${req.session.user._id}/movies/new`);
});

// Mount movie routes
app.use('/', moviesController);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
