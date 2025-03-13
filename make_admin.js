require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.log('MongoDB Connection Error:', err);
  process.exit(1);
});

// Function to make a user an admin
async function makeAdmin(email) {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }
    
    // Update the user's role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`User ${user.name} (${user.email}) has been made an admin`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Get the email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address');
  console.log('Usage: node make_admin.js <email>');
  process.exit(1);
}

// Make the user an admin
makeAdmin(email); 