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
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const coursesRoutes = require('./routes/courses');
const teachersRoutes = require('./routes/teachers');
const clubsRoutes = require('./routes/clubs');
const reviewsRoutes = require('./routes/reviews');
const chatbotRoutes = require('./routes/chatbot');
const plannerRoutes = require('./routes/planner');

// Mount routes
app.use('/api/auth', authRoutes(db));
app.use('/api/user', userRoutes(db));
app.use('/api/courses', coursesRoutes(db));
app.use('/api/teachers', teachersRoutes(db));
app.use('/api/clubs', clubsRoutes(db));
app.use('/api/reviews', reviewsRoutes(db));
app.use('/api/chatbot', chatbotRoutes(db));
app.use('/api/planner', plannerRoutes(db));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LT Assistant Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🔐 Authentication endpoint: http://localhost:${PORT}/api/auth/google`);
});

module.exports = app;
