<<<<<<< HEAD
require('dotenv').config();
=======
try {
  require('dotenv').config();
} catch (error) {
  console.error('Error loading dotenv:', error);
}

// Fallback environment variables if .env file is not loaded
if (!process.env.PORT) process.env.PORT = 3000;
if (!process.env.MONGODB_URI) process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/memes_db';
if (!process.env.SESSION_SECRET) process.env.SESSION_SECRET = 'temporary_secret_key';

console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
>>>>>>> 8d9357f (intial)
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const flash = require('connect-flash');

// Initialize Express app
const app = express();

<<<<<<< HEAD
=======
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
  memes: []
};

// Mock MongoDB models for demo mode
function setupMockModels() {
  const User = require('./src/models/User');
  const Meme = require('./src/models/Meme');
  
  // Mock User.findOne
  User.findOne = async (query) => {
    if (!query) return null;
    
    if (query.email) {
      return global.mockData.users.find(user => user.email.toLowerCase() === query.email.toLowerCase()) || null;
    }
    
    return null;
  };
  
  // Mock User.findById
  User.findById = async (id) => {
    return global.mockData.users.find(user => user._id === id) || null;
  };
  
  // Mock Meme.find
  Meme.find = async () => {
    return global.mockData.memes;
  };
  
  console.log('Mock models set up for demo mode');
}

>>>>>>> 8d9357f (intial)
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
})
.then(() => console.log('MongoDB Connected'))
<<<<<<< HEAD
.catch(err => console.log('MongoDB Connection Error:', err));
=======
.catch(err => {
  console.log('MongoDB Connection Error:', err);
  console.log('Starting in DEMO MODE with mock data. Some features will be limited.');
  global.DEMO_MODE = true;
  setupMockModels();
});
>>>>>>> 8d9357f (intial)

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
<<<<<<< HEAD
  saveUninitialized: false
=======
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
>>>>>>> 8d9357f (intial)
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