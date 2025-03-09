const express = require('express');
const path = require('path');
const app = express();

// Serve static files first
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(__dirname));

// SPA fallback - this should come AFTER static file serving
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});