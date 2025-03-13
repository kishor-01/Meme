const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const Meme = require('../models/Meme');

// Welcome Page - Public
router.get('/', async (req, res) => {
  try {
    // Get approved memes for the homepage
    const memes = await Meme.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('user', 'name');
    
    res.render('index', {
      title: 'Welcome to Futuristic Memes',
      memes
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Dashboard - Protected
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const userMemes = await Meme.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.render('dashboard', {
      title: 'Dashboard',
      name: req.user.name,
      memes: userMemes
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// About Page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Futuristic Memes'
  });
});

// Contact Page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us'
  });
});

module.exports = router; 