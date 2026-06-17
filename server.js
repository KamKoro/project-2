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

const filmsController = require('./controllers/filmsController');
const usersController = require('./controllers/usersController');
const listsController = require('./controllers/listsController');
const socialController = require('./controllers/socialController');
const moviesController = require('./controllers/moviesController');
const authController = require('./controllers/authController');
const isSignedIn = require('./middleware/isSignedIn');
const passUserToView = require('./middleware/passUserToView');
const posterController = require('./controllers/posterController');
const { renderHome } = require('./controllers/homeController');
const notificationsController = require('./controllers/notificationsController');
const { getUnreadCount } = require('./utilities/notifications');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  try {
    req.url = decodeURIComponent(req.url);
  } catch (err) {
    console.error('Failed to decode URL', req.url);
  }
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'i-like-turtles',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
    name: 'project2.sid',
  })
);

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(` Incoming request: ${req.method} ${req.originalUrl}`);
    next();
  });
}

app.use(passUserToView);

app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  if (req.session.user) {
    try {
      res.locals.unreadNotifications = await getUnreadCount(req.session.user._id);
    } catch (err) {
      res.locals.unreadNotifications = 0;
    }
  } else {
    res.locals.unreadNotifications = 0;
  }
  next();
});

app.get('/', renderHome);

app.use('/auth', authController);
app.use('/', posterController);

app.use(isSignedIn);

app.use('/', filmsController);
app.use('/', usersController);
app.use('/', listsController);
app.use('/', socialController);
app.use('/', notificationsController);
app.use('/', moviesController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
