const express = require('express');
const router = express.Router();
const List = require('../models/list');
const Film = require('../models/film');

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  next();
}

router.get('/lists', requireLogin, async (req, res) => {
  try {
    const lists = await List.find({ user: req.session.user._id }).sort({ createdAt: -1 });
    res.render('lists/index', { user: req.session.user, lists });
  } catch (err) {
    console.error('Error loading lists:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/lists', requireLogin, async (req, res) => {
  try {
    const list = await List.create({
      user: req.session.user._id,
      name: req.body.name,
      description: req.body.description || '',
      isPublic: req.body.isPublic === 'on',
    });
    res.redirect(`/lists/${list._id}`);
  } catch (err) {
    console.error('Error creating list:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/lists/new', requireLogin, (req, res) => {
  res.render('lists/new', { user: req.session.user });
});

router.get('/lists/:listId', requireLogin, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId).populate('films');
    if (!list) return res.status(404).send('List not found');

    const isOwner = list.user.toString() === req.session.user._id;
    if (!list.isPublic && !isOwner) return res.status(403).send('Forbidden');

    res.render('lists/show', {
      user: req.session.user,
      list,
      isOwner,
    });
  } catch (err) {
    console.error('Error loading list:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/lists/:listId/films/:filmId', requireLogin, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list || list.user.toString() !== req.session.user._id) {
      return res.status(403).send('Forbidden');
    }

    const film = await Film.findById(req.params.filmId);
    if (!film) return res.status(404).send('Film not found');

    await List.findByIdAndUpdate(list._id, {
      $addToSet: { films: film._id },
    });

    res.redirect(req.body.redirect || `/lists/${list._id}`);
  } catch (err) {
    console.error('Error adding film to list:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/lists/:listId/films/:filmId', requireLogin, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list || list.user.toString() !== req.session.user._id) {
      return res.status(403).send('Forbidden');
    }

    await List.findByIdAndUpdate(list._id, {
      $pull: { films: req.params.filmId },
    });

    res.redirect(`/lists/${list._id}`);
  } catch (err) {
    console.error('Error removing film from list:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
