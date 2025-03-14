# MemeVault - A Modern Meme Sharing Platform

MemeVault is a web application that allows users to upload, browse, and share memes in various formats (images, GIFs, and videos). It features an Instagram-style feed with infinite scrolling, user accounts, and social interactions like likes, comments, and shares.

## Features

- User authentication (register, login, profile management)
- Support for multiple media types (images, GIFs, videos)
- Instagram-style feed with infinite scrolling
- Like, comment, save, and share functionality
- Admin dashboard for content moderation
- Responsive mobile-friendly design
- Dark/light mode support

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, EJS templates
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Passport.js
- **Media Handling**: Multer

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/meme-vault.git
   cd meme-vault
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables in the `.env` file:
   - `MONGODB_URI`: Your local MongoDB connection string
   - `SESSION_SECRET`: A secure random string for session encryption

4. **Start the local MongoDB server** (if using a local database):
   ```bash
   sudo systemctl start mongod
   ```

5. **Run the application in development mode**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Deployment

### Deployment to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

3. **Configure Environment Variables on Vercel**:
   - `NODE_ENV`: Set to `production`
   - `MONGODB_ATLAS_URI`: Your MongoDB Atlas connection string
   - `SESSION_SECRET`: Your session secret key

### Deployment to Render

1. **Create a new Web Service on Render**:
   - Connect your GitHub repository
   - Select the "Node" environment
   - Set the build command to `npm install`
   - Set the start command to `node server.js`

2. **Configure Environment Variables on Render**:
   - `NODE_ENV`: Set to `production`
   - `MONGODB_ATLAS_URI`: Your MongoDB Atlas connection string
   - `SESSION_SECRET`: Your session secret key
   - `PORT`: Set to `10000` or leave blank to use Render's default

### MongoDB Atlas Setup

1. **Create a free cluster** on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Create a database user** with read/write privileges
3. **Whitelist IP addresses** (set to `0.0.0.0/0` for access from anywhere)
4. **Get your connection string** and update it in your environment variables:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/memes_db?retryWrites=true&w=majority
   ```

## Project Structure

```
meme-vault/
├── src/
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── config/         # Configuration files
│   └── utils/          # Utility functions
├── public/
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── images/         # Static images
├── views/
│   ├── layouts/        # Layout templates
│   ├── partials/       # Reusable components
│   └── *.ejs           # Page templates
├── server.js           # Application entry point
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # NPM dependencies
├── vercel.json         # Vercel configuration
└── README.md           # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
