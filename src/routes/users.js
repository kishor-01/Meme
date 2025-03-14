const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const { forwardAuthenticated, ensureAuthenticated } = require('../middleware/auth');
const Meme = require('../models/Meme');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    const isImage = imageTypes.test(file.mimetype);
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (isImage && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Only images (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login', {
    title: 'Login'
  });
});

// Admin Login Page
router.get('/admin-login', forwardAuthenticated, (req, res) => {
  res.render('admin-login', {
    title: 'Admin Login'
  });
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('register', {
    title: 'Register'
  });
});

// Admin Register Page
router.get('/register-admin', forwardAuthenticated, (req, res) => {
  res.render('register-admin', {
    title: 'Admin Registration'
  });
});

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }
  
  // Check if email looks like an admin email but using normal registration
  const adminEmailPatterns = [
    /@admin\.meme\.com$/i,
    /@meme-admin\.com$/i,
    /admin@/i,
    /^admin\./i
  ];
  
  const isAdminEmail = adminEmailPatterns.some(pattern => pattern.test(email));
  
  if (isAdminEmail) {
    errors.push({ 
      msg: 'This email appears to be an admin email. Admin registration requires special authorization.' 
    });
  }

  if (errors.length > 0) {
    res.render('register', {
      title: 'Register',
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    try {
      // Check if email exists
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        errors.push({ msg: 'Email is already registered' });
        res.render('register', {
          title: 'Register',
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email: email.toLowerCase(),
          password,
          role: 'user' // Ensure role is always user for regular registration
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, async (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // Save user
            await newUser.save();
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/users/login');
          });
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).render('error', {
        title: 'Server Error',
        error: 'Something went wrong. Please try again later.'
      });
    }
  }
});

// Admin Registration
router.post('/register-admin', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  
  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  
  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  
  // Check password length - stronger for admins
  if (password.length < 8) {
    errors.push({ msg: 'Admin password should be at least 8 characters' });
  }
  
  // Check if email has the required admin domain
  if (!email.endsWith('@admin.meme.com')) {
    errors.push({ 
      msg: 'Admin email must end with @admin.meme.com (e.g., yourname@admin.meme.com)' 
    });
  }

  if (errors.length > 0) {
    res.render('register-admin', {
      title: 'Admin Registration',
      errors,
      name,
      email
    });
  } else {
    try {
      // Check if email exists
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        errors.push({ msg: 'Email is already registered' });
        res.render('register-admin', {
          title: 'Admin Registration',
          errors,
          name,
          email,
          adminSecretKey: validSecretKey
        });
      } else {
        const newUser = new User({
          name,
          email: email.toLowerCase(),
          password,
          role: 'admin' // Set role as admin
        });

        // Hash Password with stronger settings for admin
        bcrypt.genSalt(12, (err, salt) => {
          bcrypt.hash(newUser.password, salt, async (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // Save user
            await newUser.save();
            req.flash('success_msg', 'You are now registered as an admin and can log in');
            res.redirect('/users/admin-login');
          });
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).render('error', {
        title: 'Server Error',
        error: 'Something went wrong. Please try again later.'
      });
    }
  }
});

// Login
router.post('/login', (req, res, next) => {
  const { email } = req.body;
  
  // Check if trying to login as admin with regular login
  if (email.includes('@admin.meme.com') || email.includes('@meme-admin.com')) {
    req.flash('error_msg', 'Admin accounts must use the admin login page');
    return res.redirect('/users/admin-login');
  }
  
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Admin Login
router.post('/admin-login', (req, res, next) => {
  const { email, password } = req.body;
  
  // Verify email domain for admin accounts
  if (!email.endsWith('@admin.meme.com')) {
    req.flash('error_msg', 'Admin accounts must use an email ending with @admin.meme.com');
    return res.redirect('/users/admin-login');
  }
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      req.flash('error_msg', info.message);
      return res.redirect('/users/admin-login');
    }
    
    // Check if user is an admin
    if (user.role !== 'admin') {
      req.flash('error_msg', 'You do not have admin privileges');
      return res.redirect('/users/admin-login');
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/admin/dashboard');
    });
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

// User Profile
router.get('/profile', (req, res) => {
  res.render('profile', {
    title: 'My Profile',
    user: req.user
  });
});

// Profile Page
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/');
    }
    
    // Get the content filter (all, memes, liked, saved)
    const contentFilter = req.query.filter || 'memes';
    
    let memes = [];
    
    // Get appropriate content based on filter
    if (contentFilter === 'memes') {
      // Get the user's uploaded memes
      memes = await Meme.find({ 
        user: user._id,
        status: 'approved'
      })
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage');
    } else if (contentFilter === 'liked' && (req.isAuthenticated() && req.user.id === user.id)) {
      // Get the user's liked memes
      const userData = await User.findById(user._id).populate({
        path: 'likedMemes',
        match: { status: 'approved' },
        populate: { path: 'user', select: 'name profileImage' }
      });
      
      memes = userData.likedMemes || [];
    } else if (contentFilter === 'saved' && (req.isAuthenticated() && req.user.id === user.id)) {
      // Get the user's saved memes
      const userData = await User.findById(user._id).populate({
        path: 'savedMemes',
        match: { status: 'approved' },
        populate: { path: 'user', select: 'name profileImage' }
      });
      
      memes = userData.savedMemes || [];
    }
    
    res.render('users/profile', {
      title: `${user.name}'s Profile`,
      profileUser: user,
      memes,
      isOwnProfile: req.isAuthenticated() && req.user.id === user.id,
      activeFilter: contentFilter
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Edit Profile Page
router.get('/profile/edit', ensureAuthenticated, (req, res) => {
  res.render('users/edit-profile', {
    title: 'Edit Profile',
    user: req.user
  });
});

// Update Profile
router.put('/profile', ensureAuthenticated, upload.single('profileImageFile'), async (req, res) => {
  try {
    const { name, bio, location, website, profileImageUrl } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    // Update basic fields
    user.name = name;
    user.bio = bio || 'This user has not added a bio yet.';
    user.location = location || '';
    user.website = website || '';
    
    // Handle profile image update
    if (req.file) {
      // If a file was uploaded, convert to base64 and store
      const imageBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;
      const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      user.profileImage = base64Image;
    } else if (profileImageUrl && profileImageUrl.trim() !== '') {
      // If a URL was provided, use that
      user.profileImage = profileImageUrl;
    }
    // If neither file nor URL provided, keep existing image
    
    await user.save();
    
    req.flash('success_msg', 'Your profile has been updated');
    res.redirect(`/users/profile/${req.user.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

module.exports = router; 