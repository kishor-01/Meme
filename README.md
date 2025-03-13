# FutuMemes - Futuristic Meme Sharing Platform

FutuMemes is a modern, futuristic meme sharing platform built with Node.js, Express, MongoDB, and EJS. It features a sleek, dark-themed UI with user authentication, meme uploads, admin approval workflow, and social features like likes and sharing.

## Features

- 🚀 **Modern Futuristic Design**: Dark theme with neon accents and clean UI
- 👤 **User Authentication**: Register, login, and personalized dashboard
- 🖼️ **Meme Management**: Upload, view, and delete your memes
- 👍 **Social Features**: Like and share your favorite memes
- 🔍 **Search Functionality**: Find memes by title, description, or tags
- 🛡️ **Admin Dashboard**: Approve/reject memes and manage users
- 📱 **Responsive**: Fully responsive design for all devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Views**: EJS templating
- **Authentication**: Passport.js with Local Strategy
- **Image Storage**: Base64 encoding stored in MongoDB
- **Styling**: Custom CSS (no frameworks)
- **Icons**: Font Awesome

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/futuristic-memes.git
   cd futuristic-memes
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following:
   ```
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/memes_db
   SESSION_SECRET=your_super_secret_session_key
   ```

4. Start MongoDB service:
   ```
   # On Linux
   sudo service mongod start
   
   # On macOS (with Homebrew)
   brew services start mongodb-community
   
   # On Windows
   # MongoDB should be running as a service
   ```

5. Start the application:
   ```
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
futuristic-memes/
├── public/              # Static assets
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   └── uploads/         # Temporary storage for uploads
├── src/                 # Source code
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # Express routes
│   └── utils/           # Utility functions
├── views/               # EJS templates
│   ├── admin/           # Admin panel views
│   ├── memes/           # Meme-related views
│   ├── partials/        # Reusable view components
│   └── layouts/         # Layout templates
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project metadata and dependencies
├── server.js            # Application entry point
└── README.md            # Project documentation
```

## Usage

### User Workflow
1. Register a new account or login
2. Browse existing approved memes on the homepage and gallery
3. Upload your own memes with title, description, and tags
4. Wait for admin approval
5. Like and share your favorite memes

### Admin Workflow
1. Login with an admin account
2. Navigate to the Admin Dashboard
3. View pending memes and approve/reject them
4. Manage users and their permissions

## Creating an Admin User

The first user you want to make an admin needs to be updated directly in the database:

```javascript
// Connect to MongoDB shell
mongo

// Select the database
use memes_db

// Update a user to be an admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Customization

### Theme Colors
You can customize the theme colors by modifying the CSS variables in `public/css/style.css`:

```css
:root {
  --primary: #6200ee;
  --primary-dark: #3700b3;
  --primary-light: #bb86fc;
  --secondary: #03dac6;
  /* ... other variables ... */
}
```

## License

[MIT](LICENSE)

## Acknowledgements

- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography
- [EJS](https://ejs.co/) for templating
- [MongoDB](https://www.mongodb.com/) for database
- [Express](https://expressjs.com/) for server framework 