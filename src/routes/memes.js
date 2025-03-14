const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { ensureAuthenticated } = require('../middleware/auth');
const Meme = require('../models/Meme');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    const videoTypes = /mp4|webm|ogg/;
    const isImage = imageTypes.test(file.mimetype);
    const isVideo = videoTypes.test(file.mimetype);
    const extname = (imageTypes.test(path.extname(file.originalname).toLowerCase()) || 
                     videoTypes.test(path.extname(file.originalname).toLowerCase()));
    
    if ((isImage || isVideo) && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Only images (jpeg, jpg, png, gif, webp) and videos (mp4, webm, ogg) are allowed'));
    }
  }
});

// Instagram-style feed (infinite scroll)
router.get('/feed', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get the media type filter from query params
    const mediaType = req.query.type || 'all';
    
    // Build the query based on media type
    const query = { status: 'approved' };
    if (mediaType !== 'all') {
      query.mediaType = mediaType;
    }
    
    const memes = await Meme.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name profileImage');
    
    const hasMore = memes.length === limit;
    
    // Add isLiked and isSaved properties to memes for logged-in users
    if (req.isAuthenticated()) {
      const user = await User.findById(req.user.id)
        .select('likedMemes savedMemes');
      
      const likedMemeIds = user.likedMemes.map(id => id.toString());
      const savedMemeIds = user.savedMemes.map(id => id.toString());
      
      memes.forEach(meme => {
        meme.isLiked = likedMemeIds.includes(meme._id.toString());
        meme.isSaved = savedMemeIds.includes(meme._id.toString());
      });
    } else {
      // For non-logged in users, set these to false
      memes.forEach(meme => {
        meme.isLiked = false;
        meme.isSaved = false;
      });
    }
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        memes,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        mediaType
      });
    }
    
    res.render('memes/feed', {
      title: 'Meme Feed',
      memes,
      currentPage: page,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      activeType: mediaType
    });
  } catch (err) {
    console.error(err);
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ error: 'Server error' });
    }
    
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Images feed (memes)
router.get('/feed/images', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { 
      status: 'approved',
      mediaType: 'image'
    };
    
    const memes = await Meme.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name profileImage');
    
    const hasMore = memes.length === limit;
    
    // Add isLiked and isSaved properties for authenticated users
    if (req.isAuthenticated()) {
      const user = await User.findById(req.user.id)
        .select('likedMemes savedMemes');
      
      const likedMemeIds = user.likedMemes.map(id => id.toString());
      const savedMemeIds = user.savedMemes.map(id => id.toString());
      
      memes.forEach(meme => {
        meme.isLiked = likedMemeIds.includes(meme._id.toString());
        meme.isSaved = savedMemeIds.includes(meme._id.toString());
      });
    } else {
      // For non-logged in users, set these to false
      memes.forEach(meme => {
        meme.isLiked = false;
        meme.isSaved = false;
      });
    }
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        memes,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        mediaType: 'image'
      });
    }
    
    res.render('memes/feed', {
      title: 'Image Memes',
      memes,
      currentPage: page,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      activeType: 'image'
    });
  } catch (err) {
    console.error(err);
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ error: 'Server error' });
    }
    
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// GIFs feed
router.get('/feed/gifs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { 
      status: 'approved',
      mediaType: 'gif'
    };
    
    const memes = await Meme.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name profileImage');
    
    const hasMore = memes.length === limit;
    
    // Add isLiked and isSaved properties for authenticated users
    if (req.isAuthenticated()) {
      const user = await User.findById(req.user.id)
        .select('likedMemes savedMemes');
      
      const likedMemeIds = user.likedMemes.map(id => id.toString());
      const savedMemeIds = user.savedMemes.map(id => id.toString());
      
      memes.forEach(meme => {
        meme.isLiked = likedMemeIds.includes(meme._id.toString());
        meme.isSaved = savedMemeIds.includes(meme._id.toString());
      });
    } else {
      // For non-logged in users, set these to false
      memes.forEach(meme => {
        meme.isLiked = false;
        meme.isSaved = false;
      });
    }
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        memes,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        mediaType: 'gif'
      });
    }
    
    res.render('memes/feed', {
      title: 'GIF Memes',
      memes,
      currentPage: page,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      activeType: 'gif'
    });
  } catch (err) {
    console.error(err);
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ error: 'Server error' });
    }
    
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Reels feed (videos)
router.get('/feed/reels', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { 
      status: 'approved',
      mediaType: 'video'
    };
    
    const memes = await Meme.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name profileImage');
    
    const hasMore = memes.length === limit;
    
    // Add isLiked and isSaved properties for authenticated users
    if (req.isAuthenticated()) {
      const user = await User.findById(req.user.id)
        .select('likedMemes savedMemes');
      
      const likedMemeIds = user.likedMemes.map(id => id.toString());
      const savedMemeIds = user.savedMemes.map(id => id.toString());
      
      memes.forEach(meme => {
        meme.isLiked = likedMemeIds.includes(meme._id.toString());
        meme.isSaved = savedMemeIds.includes(meme._id.toString());
      });
    } else {
      // For non-logged in users, set these to false
      memes.forEach(meme => {
        meme.isLiked = false;
        meme.isSaved = false;
      });
    }
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        memes,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        mediaType: 'video'
      });
    }
    
    res.render('memes/feed', {
      title: 'Video Reels',
      memes,
      currentPage: page,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
      activeType: 'video'
    });
  } catch (err) {
    console.error(err);
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ error: 'Server error' });
    }
    
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Get all memes (approved only)
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const memes = await Meme.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    
    res.render('memes/index', {
      title: 'Meme Gallery',
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

// Search memes
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    let memes = [];
    
    if (searchTerm) {
      memes = await Meme.find({ 
        $and: [
          { status: 'approved' },
          { $text: { $search: searchTerm } }
        ]
      })
      .sort({ createdAt: -1 })
      .populate('user', 'name profileImage');
    }
    
    res.render('memes/search', {
      title: 'Search Memes',
      searchTerm,
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

// Form to upload a new meme
router.get('/upload', ensureAuthenticated, (req, res) => {
  res.render('memes/upload', {
    title: 'Upload a Meme'
  });
});

// Process meme upload
router.post('/upload', ensureAuthenticated, upload.single('media'), async (req, res) => {
  try {
    const { title, description, tags, mediaType } = req.body;
    
    if (!req.file) {
      return res.render('memes/upload', {
        title: 'Upload a Meme',
        error: 'Please select a file to upload',
        formData: { title, description, tags, mediaType }
      });
    }
    
    // Determine media type based on mimetype
    let detectedMediaType = 'image';
    if (req.file.mimetype.includes('video')) {
      detectedMediaType = 'video';
    } else if (req.file.mimetype === 'image/gif') {
      detectedMediaType = 'gif';
    }
    
    // Convert media to base64
    const mediaData = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    // Process tags: split by commas and trim
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Create a new meme
    const newMeme = new Meme({
      title,
      description,
      mediaData,
      mimeType,
      mediaType: detectedMediaType,
      tags: tagArray,
      user: req.user.id
    });
    
    await newMeme.save();
    
    req.flash('success_msg', 'Meme uploaded successfully! It will be visible after admin approval.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// View a single meme
router.get('/:id', async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id)
      .populate('user', 'name profileImage bio');
    
    if (!meme) {
      return res.status(404).render('error', {
        title: 'Not Found',
        error: 'Meme not found'
      });
    }
    
    // Only allow viewing of approved memes or user's own memes
    if (meme.status !== 'approved' && 
        (!req.user || meme.user._id.toString() !== req.user.id)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        error: 'You do not have permission to view this meme'
      });
    }
    
    // Increment view count
    meme.views += 1;
    await meme.save();
    
    // Check if user has liked/saved the meme
    let hasLiked = false;
    let hasDisliked = false;
    let hasSaved = false;
    let hasReported = false;
    
    if (req.user) {
      hasLiked = meme.likedBy.some(id => id.toString() === req.user.id);
      hasDisliked = meme.dislikedBy.some(id => id.toString() === req.user.id);
      hasSaved = meme.savedBy.some(id => id.toString() === req.user.id);
      hasReported = meme.reportedBy.some(id => id.toString() === req.user.id);
    }
    
    res.render('memes/show', {
      title: meme.title,
      meme,
      hasLiked,
      hasDisliked,
      hasSaved,
      hasReported
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).render('error', {
        title: 'Not Found',
        error: 'Meme not found'
      });
    }
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Like a meme
router.post('/:id/like', ensureAuthenticated, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    // Check if user already liked this meme
    const hasLiked = meme.likedBy.some(id => id.toString() === req.user.id);
    
    if (hasLiked) {
      // Unlike
      meme.likes -= 1;
      meme.likedBy = meme.likedBy.filter(userId => userId.toString() !== req.user.id);
      user.likedMemes = user.likedMemes.filter(memeId => memeId.toString() !== meme._id.toString());
    } else {
      // If user had disliked, remove dislike first
      if (meme.dislikedBy.some(id => id.toString() === req.user.id)) {
        meme.dislikes -= 1;
        meme.dislikedBy = meme.dislikedBy.filter(userId => userId.toString() !== req.user.id);
        user.dislikedMemes = user.dislikedMemes.filter(memeId => memeId.toString() !== meme._id.toString());
      }
      
      // Like
      meme.likes += 1;
      meme.likedBy.push(req.user.id);
      
      // Add to user's liked memes if not present
      if (!user.likedMemes || !Array.isArray(user.likedMemes)) {
        user.likedMemes = [];
      }
      
      if (!user.likedMemes.some(id => id.toString() === meme._id.toString())) {
        user.likedMemes.push(meme._id);
      }
    }
    
    await Promise.all([meme.save(), user.save()]);
    
    // Get the likedBy users with their info for the response
    const populatedMeme = await Meme.findById(meme._id).populate('likedBy', 'name profileImage');
    
    res.json({ 
      success: true, 
      likes: meme.likes, 
      dislikes: meme.dislikes,
      hasLiked: meme.likedBy.includes(req.user.id),
      hasDisliked: meme.dislikedBy.includes(req.user.id),
      likedBy: populatedMeme.likedBy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dislike a meme
router.post('/:id/dislike', ensureAuthenticated, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    // Check if user already disliked this meme
    const hasDisliked = meme.dislikedBy.includes(req.user.id);
    
    if (hasDisliked) {
      // Un-dislike
      meme.dislikes -= 1;
      meme.dislikedBy = meme.dislikedBy.filter(userId => userId.toString() !== req.user.id);
      user.dislikedMemes = user.dislikedMemes.filter(memeId => memeId.toString() !== meme._id.toString());
    } else {
      // If user had liked, remove like first
      if (meme.likedBy.includes(req.user.id)) {
        meme.likes -= 1;
        meme.likedBy = meme.likedBy.filter(userId => userId.toString() !== req.user.id);
        user.likedMemes = user.likedMemes.filter(memeId => memeId.toString() !== meme._id.toString());
      }
      
      // Dislike
      meme.dislikes += 1;
      meme.dislikedBy.push(req.user.id);
      user.dislikedMemes.push(meme._id);
    }
    
    await Promise.all([meme.save(), user.save()]);
    
    res.json({ 
      success: true, 
      likes: meme.likes, 
      dislikes: meme.dislikes,
      hasLiked: meme.likedBy.includes(req.user.id),
      hasDisliked: meme.dislikedBy.includes(req.user.id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save a meme
router.post('/:id/save', ensureAuthenticated, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    // Check if user already saved this meme
    const hasSaved = meme.savedBy.some(id => id.toString() === req.user.id);
    
    if (hasSaved) {
      // Unsave
      meme.savedBy = meme.savedBy.filter(userId => userId.toString() !== req.user.id);
      user.savedMemes = user.savedMemes.filter(memeId => memeId.toString() !== meme._id.toString());
    } else {
      // Save
      meme.savedBy.push(req.user.id);
      
      // Add to user's saved memes if not present
      if (!user.savedMemes || !Array.isArray(user.savedMemes)) {
        user.savedMemes = [];
      }
      
      if (!user.savedMemes.some(id => id.toString() === meme._id.toString())) {
        user.savedMemes.push(meme._id);
      }
    }
    
    await Promise.all([meme.save(), user.save()]);
    
    res.json({ 
      success: true, 
      hasSaved: meme.savedBy.includes(req.user.id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Report a meme
router.post('/:id/report', ensureAuthenticated, async (req, res) => {
  try {
    const { reason } = req.body;
    const meme = await Meme.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    // Check if user already reported this meme
    const hasReported = meme.reportedBy.includes(req.user.id);
    
    if (!hasReported) {
      // Report
      meme.reportCount += 1;
      meme.reportedBy.push(req.user.id);
      meme.reportReasons.push({
        user: req.user.id,
        reason: reason || 'No reason provided'
      });
      user.reportedMemes.push(meme._id);
      
      await Promise.all([meme.save(), user.save()]);
    }
    
    res.json({ 
      success: true, 
      hasReported: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Share a meme
router.post('/:id/share', ensureAuthenticated, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    const user = await User.findById(req.user.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    // Increment share count
    meme.shares += 1;
    
    // Add to user's shared memes
    user.sharedMemes.push({
      meme: meme._id,
      shareDate: new Date()
    });
    
    await Promise.all([meme.save(), user.save()]);
    
    res.json({ 
      success: true, 
      shares: meme.shares
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's liked memes
router.get('/liked', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'likedMemes',
      match: { status: 'approved' },
      populate: { path: 'user', select: 'name profileImage' }
    });
    
    if (!user) {
      return res.status(404).render('error', {
        title: 'Not Found',
        error: 'User not found'
      });
    }
    
    res.render('memes/liked', {
      title: 'Liked Memes',
      memes: user.likedMemes || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Get user's saved memes
router.get('/saved', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedMemes',
      match: { status: 'approved' },
      populate: { path: 'user', select: 'name profileImage' }
    });
    
    if (!user) {
      return res.status(404).render('error', {
        title: 'Not Found',
        error: 'User not found'
      });
    }
    
    res.render('memes/saved', {
      title: 'Saved Memes',
      memes: user.savedMemes || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Delete a meme (only for the creator)
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    
    if (!meme) {
      return res.status(404).render('error', {
        title: 'Not Found',
        error: 'Meme not found'
      });
    }
    
    // Check if user is the meme creator or admin
    if (meme.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).render('error', {
        title: 'Access Denied',
        error: 'You do not have permission to delete this meme'
      });
    }
    
    await meme.remove();
    
    req.flash('success_msg', 'Meme deleted successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Track view via AJAX
router.post('/:id/view', ensureAuthenticated, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    // Increment view count
    meme.views += 1;
    await meme.save();
    
    res.json({ 
      success: true, 
      views: meme.views
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 