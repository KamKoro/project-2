const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const passUserToView = require('../middleware/passUserToView.js');
router.use(passUserToView);

const User = require('../models/user.js');

//* GET: SIGN-UP PAGE
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs", {
    user: req.user || null,
  });
});

//* GET: SIGN-IN PAGE
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});

//* GET: SIGN-OUT
router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

//* POST: SIGN-UP
router.post('/sign-up', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.send("User already exists. Please go to the Sign-In page.");
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.send('Password and Confirm Password do not match.');
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    const newUser = await User.create(req.body);

    // Optionally auto-login after sign-up:
    req.session.user = {
      username: newUser.username,
      _id: newUser._id
    };
    req.session.isNewUser = true;

    res.redirect('/');
  } catch (error) {
    console.error("Sign-up error:", error);
    res.redirect('/');
  }
});

//* POST: SIGN-IN
router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.send('Login failed. Please try again.');
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
      return res.send('Login failed. Please try again.');
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id
    };

    // Check if user has any movies
    const hasMovies = userInDatabase.movies && userInDatabase.movies.length > 0;
    req.session.isNewUser = !hasMovies;

    res.redirect('/');
  } catch (error) {
    console.error("Sign-in error:", error);
    res.redirect('/');
  }
});

module.exports = router;
