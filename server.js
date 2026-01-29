require('dotenv').config();
const express = require('express');
const cors = require('cors');
const JSONDatabase = require('./database');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Initialize database
const db = new JSONDatabase('./data');

// Import route modules
const coursesRoutes = require('./routes/courses');
const teachersRoutes = require('./routes/teachers');
const clubsRoutes = require('./routes/clubs');
const reviewsRoutes = require('./routes/reviews');
const chatbotRoutes = require('./routes/chatbot');

// Mount routes
app.use('/api/courses', coursesRoutes(db));
app.use('/api/teachers', teachersRoutes(db));
app.use('/api/clubs', clubsRoutes(db));
app.use('/api/reviews', reviewsRoutes(db));
app.use('/api/chatbot', chatbotRoutes(db));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LT Assistant Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API endpoints available at http://localhost:${PORT}/api/`);
});

module.exports = app;
