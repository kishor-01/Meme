const mongoose = require('mongoose');
const defaultProfileImage = require('../utils/defaultProfileImage');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: defaultProfileImage
  },
  bio: {
    type: String,
    default: 'This user has not added a bio yet.'
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  savedMemes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme'
  }],
  likedMemes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme'
  }],
  dislikedMemes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme'
  }],
  reportedMemes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme'
  }],
  sharedMemes: [{
    meme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meme'
    },
    shareDate: {
      type: Date,
      default: Date.now
    }
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User; 