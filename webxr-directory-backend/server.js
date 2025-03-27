// webxr-directory-backend/server.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const toolRoutes = require('./routes/tools'); // We will create this file next

const app = express();
const port = process.env.PORT || 5001; // Use port from .env or default to 5001

// --- Middleware ---

// Enable Cross-Origin Resource Sharing (CORS)
// Allows requests from your React frontend (running on localhost:3000 or your deployed URL)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use URL from .env or default
  optionsSuccessStatus: 200 // For older browsers
};
app.use(cors(corsOptions));

// Parse incoming JSON requests (needed for the submission form)
app.use(express.json());

// --- Basic Route ---
// A simple route to check if the API is running
app.get('/', (req, res) => {
  res.send('WebXR Directory API is running!');
});

// --- API Routes ---
// All routes starting with /api/tools will be handled by toolRoutes
app.use('/api/tools', toolRoutes);


// --- Error Handling ---

// 404 Not Found Middleware (if no other route matches)
app.use((req, res, next) => {
  const error = new Error('Resource not found');
  error.status = 404;
  next(error); // Pass the error to the next middleware (the general error handler)
});

// General Error Handler Middleware (should be the LAST middleware)
// Catches errors passed via next(error)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err); // Log the error details server-side

  // Send a generic error message to the client
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server.',
    // Optionally include stack trace in development, but not production for security
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});