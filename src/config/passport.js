const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // Match user
        const user = await User.findOne({ email: email });
        
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      } catch (err) {
<<<<<<< HEAD
        console.log(err);
=======
        console.log('Error in authentication:', err);
        
        // If in demo mode and there's an error, let's log in as demo user
        if (global.DEMO_MODE) {
          console.log('Demo mode: Authenticating as demo user');
          
          if (email === 'demo@example.com' && password === 'password') {
            return done(null, global.mockData.users[0]);
          } else if (email === 'admin@admin.meme.com' && password === 'password') {
            return done(null, global.mockData.users[1]);
          } else {
            return done(null, false, { message: 'In demo mode, use demo@example.com or admin@admin.meme.com with password "password"' });
          }
        }
        
>>>>>>> 8d9357f (intial)
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
<<<<<<< HEAD
    done(null, user.id);
=======
    done(null, user._id);
>>>>>>> 8d9357f (intial)
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
<<<<<<< HEAD
=======
      console.log('Error in deserializeUser:', err);
      
      // If in demo mode and there's an error, try to get the user from mock data
      if (global.DEMO_MODE) {
        const user = global.mockData.users.find(u => u._id === id);
        if (user) {
          return done(null, user);
        }
      }
      
>>>>>>> 8d9357f (intial)
      done(err, null);
    }
  });
}; 