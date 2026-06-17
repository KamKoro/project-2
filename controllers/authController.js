const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Review = require('../models/review');

const passUserToView = require('../middleware/passUserToView.js');
router.use(passUserToView);

const User = require('../models/user.js');

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs', {
    user: req.user || null,
    error: req.query.error || '',
  });
});

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs', {
    error: req.query.error || '',
  });
});

router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.post('/sign-up', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.redirect('/auth/sign-up?error=exists');
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.redirect('/auth/sign-up?error=mismatch');
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = await User.create({
      username: req.body.username,
      password: hashedPassword,
    });

    req.session.user = {
      username: newUser.username,
      _id: newUser._id,
    };

    res.redirect('/films/log?welcome=1');
  } catch (error) {
    console.error('Sign-up error:', error);
    res.redirect('/auth/sign-up?error=server');
  }
});

router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.redirect('/auth/sign-in?error=invalid');
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
      return res.redirect('/auth/sign-in?error=invalid');
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    const reviewCount = await Review.countDocuments({ user: userInDatabase._id });
    const redirectTo = reviewCount === 0 ? '/films/log?welcome=1' : '/';
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Sign-in error:', error);
    res.redirect('/auth/sign-in?error=server');
  }
});

module.exports = router;
