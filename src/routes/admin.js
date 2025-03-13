const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const Meme = require('../models/Meme');
const User = require('../models/User');

// Admin dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    // Get stats
    const pendingCount = await Meme.countDocuments({ status: 'pending' });
    const approvedCount = await Meme.countDocuments({ status: 'approved' });
    const rejectedCount = await Meme.countDocuments({ status: 'rejected' });
    const userCount = await User.countDocuments();
    
    // Get pending memes
    const pendingMemes = await Meme.find({ status: 'pending' })
      .sort({ createdAt: 1 }) // Oldest first
      .limit(10)
      .populate('user', 'name email');
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        userCount
      },
      pendingMemes
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// List all memes for moderation
router.get('/memes', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    // Filter
    let filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const memes = await Meme.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');
    
    const total = await Meme.countDocuments(filter);
    
    res.render('admin/memes', {
      title: 'Meme Moderation',
      memes,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      },
      currentStatus: req.query.status || 'all'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Approve a meme
router.post('/memes/:id/approve', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    meme.status = 'approved';
    await meme.save();
    
    req.flash('success_msg', 'Meme has been approved');
    res.redirect('/admin/memes?status=pending');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Reject a meme
router.post('/memes/:id/reject', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    meme.status = 'rejected';
    await meme.save();
    
    req.flash('success_msg', 'Meme has been rejected');
    res.redirect('/admin/memes?status=pending');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Delete a meme (admin can delete any meme)
router.delete('/memes/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    
    if (!meme) {
      return res.status(404).json({ success: false, message: 'Meme not found' });
    }
    
    await Meme.findByIdAndDelete(req.params.id);
    
    req.flash('success_msg', 'Meme has been deleted');
    res.redirect('/admin/memes');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// List all users
router.get('/users', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments();
    
    res.render('admin/users', {
      title: 'User Management',
      users,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Make a user an admin
router.post('/users/:id/make-admin', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.role = 'admin';
    await user.save();
    
    req.flash('success_msg', `${user.name} is now an admin`);
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

// Remove admin privileges
router.post('/users/:id/remove-admin', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent self-demotion
    if (user._id.toString() === req.user.id) {
      req.flash('error_msg', 'You cannot remove your own admin privileges');
      return res.redirect('/admin/users');
    }
    
    user.role = 'user';
    await user.save();
    
    req.flash('success_msg', `Admin privileges removed from ${user.name}`);
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Server Error',
      error: 'Something went wrong. Please try again later.'
    });
  }
});

module.exports = router; 