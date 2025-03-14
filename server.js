require('dotenv').config();

// Fallback environment variables if .env file is not loaded
if (!process.env.PORT) process.env.PORT = 3000;
if (!process.env.MONGODB_URI) process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/memes_db';
if (!process.env.SESSION_SECRET) process.env.SESSION_SECRET = 'temporary_secret_key';

console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const flash = require('connect-flash');

// Initialize Express app
const app = express();

// Global to track if we're in demo mode (no MongoDB)
global.DEMO_MODE = false;

// Mock data for demo mode
global.mockData = {
  users: [
    {
      _id: '123456789012345678901234',
      name: 'Demo User',
      email: 'demo@example.com',
      password: '$2a$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RFcGIWNhyFrrT3YUi', // password: "password"
      role: 'user',
      profileImage: '/images/default-profile.png',
      bio: 'This is a demo user account',
      savedMemes: [],
      likedMemes: [],
      dislikedMemes: [],
      reportedMemes: [],
      date: new Date()
    },
    {
      _id: '123456789012345678901235',
      name: 'Demo Admin',
      email: 'admin@admin.meme.com',
      password: '$2a$10$ixlPY3AAd4ty1l6E2IsQ9OFZi2ba9ZQE0bP7RFcGIWNhyFrrT3YUi', // password: "password"
      role: 'admin',
      profileImage: '/images/default-profile.png',
      bio: 'This is a demo admin account',
      savedMemes: [],
      likedMemes: [],
      dislikedMemes: [],
      reportedMemes: [],
      date: new Date()
    }
  ],
  memes: [
    {
      _id: '223456789012345678901234',
      title: 'Funny Cat Meme',
      description: 'A cat looking surprised',
      mediaUrl: '/images/demo/cat-meme.jpg',
      mediaType: 'image',
      category: 'Animals',
      tags: ['cat', 'funny', 'animal'],
      status: 'approved',
      user: '123456789012345678901234',
      likes: 42,
      comments: [],
      isLiked: false,
      isSaved: false,
      views: 156,
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      _id: '223456789012345678901235',
      title: 'Programming Humor',
      description: 'When the code finally works',
      mediaUrl: '/images/demo/programming-meme.jpg',
      mediaType: 'image',
      category: 'Technology',
      tags: ['programming', 'coding', 'developer'],
      status: 'approved',
      user: '123456789012345678901235',
      likes: 78,
      comments: [],
      isLiked: false,
      isSaved: false,
      views: 234,
      createdAt: new Date(Date.now() - 7200000)
    },
    {
      _id: '223456789012345678901236',
      title: 'Dog Reels',
      description: 'Dog doing funny trick',
      mediaUrl: '/videos/demo/dog-video.mp4',
      mediaType: 'video',
      category: 'Animals',
      tags: ['dog', 'cute', 'pet'],
      status: 'approved',
      user: '123456789012345678901234',
      likes: 112,
      comments: [],
      isLiked: false,
      isSaved: false,
      views: 498,
      createdAt: new Date(Date.now() - 10800000)
    },
    {
      _id: '223456789012345678901237',
      title: 'Dancing Cat GIF',
      description: 'Cat dancing to music',
      mediaUrl: '/images/demo/cat-dance.gif',
      mediaType: 'gif',
      category: 'Entertainment',
      tags: ['cat', 'dancing', 'funny'],
      status: 'approved',
      user: '123456789012345678901235',
      likes: 89,
      comments: [],
      isLiked: false,
      isSaved: false,
      views: 321,
      createdAt: new Date(Date.now() - 14400000)
    }
  ]
};

// Setup mock models for Meme.find with fully chainable methods
function setupMockModels() {
  const User = require('./src/models/User');
  const Meme = require('./src/models/Meme');
  
  // Mock User.findOne
  User.findOne = async (query) => {
    if (!query) return null;
    
    if (query.email) {
      return global.mockData.users.find(user => user.email.toLowerCase() === query.email.toLowerCase()) || null;
    } else if (query._id) {
      return global.mockData.users.find(user => user._id === query._id) || null;
    }
    
    return null;
  };
  
  // Mock User.findById
  User.findById = async (id) => {
    return global.mockData.users.find(user => user._id === id) || null;
  };
  
  // Create a chainable query builder
  const createChainableMethods = (results) => {
    const chainable = {
      sort: function(criteria) {
        // Basic sorting implementation
        if (criteria && criteria.createdAt === -1) {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (criteria && criteria.createdAt === 1) {
          results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (criteria && criteria.likes === -1) {
          results.sort((a, b) => b.likes - a.likes);
        } else if (criteria && criteria.likes === 1) {
          results.sort((a, b) => a.likes - b.likes);
        }
        return this;
      },
      limit: function(num) {
        results = results.slice(0, num);
        return this;
      },
      skip: function(num) {
        results = results.slice(num);
        return this;
      },
      populate: function(field, projection) {
        results = results.map(item => {
          if (field === 'user' && item.user) {
            const user = global.mockData.users.find(u => u._id === item.user);
            if (user) {
              // Handle projection
              let populatedUser = {...user};
              if (projection) {
                const fields = typeof projection === 'string' ? projection.split(' ') : 
                              (projection.select ? projection.select.split(' ') : Object.keys(user));
                populatedUser = {};
                fields.forEach(f => {
                  if (user.hasOwnProperty(f)) {
                    populatedUser[f] = user[f];
                  }
                });
              }
              return { ...item, user: populatedUser };
            }
          }
          return item;
        });
        return this;
      },
      exec: function() {
        return Promise.resolve(results);
      },
      then: function(resolve) {
        resolve(results);
        return {
          catch: function(reject) {
            return Promise.resolve(results);
          }
        };
      },
      catch: function(reject) {
        return Promise.resolve(results);
      }
    };
    
    return chainable;
  };
  
  // Mock Meme.find with improved chainable methods
  Meme.find = (query = {}) => {
    let results = [...global.mockData.memes];
    
    // Filter by status if provided
    if (query.status) {
      results = results.filter(meme => meme.status === query.status);
    }
    
    // Filter by user if provided
    if (query.user) {
      results = results.filter(meme => meme.user === query.user);
    }

    // Filter by mediaType if provided
    if (query.mediaType) {
      results = results.filter(meme => meme.mediaType === query.mediaType);
    }

    // Filter by category if provided
    if (query.category) {
      results = results.filter(meme => meme.category === query.category);
    }
    
    return createChainableMethods(results);
  };
  
  // Mock Meme.findById with chainable methods
  Meme.findById = (id) => {
    const meme = global.mockData.memes.find(meme => meme._id === id);
    return createChainableMethods(meme ? [meme] : []);
  };
  
  // Mock Meme.findOne with chainable methods
  Meme.findOne = (query = {}) => {
    let result = null;
    
    if (query._id) {
      result = global.mockData.memes.find(meme => meme._id === query._id);
    } else if (query.user && query.mediaUrl) {
      result = global.mockData.memes.find(meme => 
        meme.user === query.user && meme.mediaUrl === query.mediaUrl);
    }
    
    return createChainableMethods(result ? [result] : []);
  };
  
  // Mock Meme.findByIdAndUpdate
  Meme.findByIdAndUpdate = async (id, update) => {
    const index = global.mockData.memes.findIndex(meme => meme._id === id);
    if (index !== -1) {
      // Apply the update to the meme
      const updatedMeme = { ...global.mockData.memes[index] };
      
      if (update.$set) {
        Object.keys(update.$set).forEach(key => {
          updatedMeme[key] = update.$set[key];
        });
      }
      
      if (update.$inc) {
        Object.keys(update.$inc).forEach(key => {
          updatedMeme[key] = (updatedMeme[key] || 0) + update.$inc[key];
        });
      }
      
      global.mockData.memes[index] = updatedMeme;
      return updatedMeme;
    }
    return null;
  };
  
  // Mock Meme.create
  Meme.create = async (data) => {
    const newMeme = {
      _id: `meme_${Date.now()}`,
      ...data,
      likes: 0,
      comments: [],
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    global.mockData.memes.push(newMeme);
    return newMeme;
  };
  
  console.log('Mock models set up for demo mode with full chainable methods');
}

// Connect to MongoDB with improved configuration
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increased timeout from 15s to 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  connectTimeoutMS: 30000,
  // Keep connection alive
  keepAlive: true,
  keepAliveInitialDelay: 300000
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  console.log('Running in PRODUCTION MODE with real database');
  global.DEMO_MODE = false;
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  console.log('Please ensure MongoDB is running:');
  console.log('1. Check MongoDB status: sudo systemctl status mongod');
  console.log('2. Start MongoDB if needed: sudo systemctl start mongod');
  process.exit(1); // Exit the application if MongoDB connection fails
});

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./src/config/passport')(passport);

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user;
  res.locals.currentUrl = req.originalUrl;
  next();
});

// Routes
app.use('/', require('./src/routes/index'));
app.use('/users', require('./src/routes/users'));
app.use('/memes', require('./src/routes/memes'));
app.use('/admin', require('./src/routes/admin'));

// 404 Page
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}`);
    server.close();
    app.listen(PORT + 1, () => {
      console.log(`Server running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
