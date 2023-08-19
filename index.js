// Import the necessary modules
const express = require('express');
const path = require('path');

// Create a new Express application
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route handler for the root URL ("/")
app.get('/', (req, res) => {
  // Send the index.html file
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server and listen on a port
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
