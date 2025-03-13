require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => {
  console.log('MongoDB Connected');
  makeAdmin();
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Function to make a user an admin
async function makeAdmin() {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      mongoose.connection.close();
      process.exit(1);
    }
    
    // Check if user is already an admin
    if (user.role === 'admin') {
      console.log(`User ${user.name} (${user.email}) is already an admin`);
      mongoose.connection.close();
      process.exit(0);
    }
    
    // Update the user's role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`User ${user.name} (${user.email}) has been made an admin`);
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    mongoose.connection.close();
    process.exit(1);
  }
} 