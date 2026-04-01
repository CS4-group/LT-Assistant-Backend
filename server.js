require('dotenv').config();
const express = require('express');
const cors = require('cors');
const MongoDatabase = require('./database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const coursesRoutes = require('./routes/courses');
const teachersRoutes = require('./routes/teachers');
const clubsRoutes = require('./routes/clubs');
const reviewsRoutes = require('./routes/reviews');
const chatbotRoutes = require('./routes/chatbot');
const plannerRoutes = require('./routes/planner');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LT Assistant Backend is running',
    timestamp: new Date().toISOString()
  });
});

async function start() {
  const db = new MongoDatabase(process.env.MONGODB_URI);
  await db.connect();

  // Mount routes
  app.use('/api/auth', authRoutes(db));
  app.use('/api/user', userRoutes(db));
  app.use('/api/courses', coursesRoutes(db));
  app.use('/api/teachers', teachersRoutes(db));
  app.use('/api/clubs', clubsRoutes(db));
  app.use('/api/reviews', reviewsRoutes(db));
  app.use('/api/chatbot', chatbotRoutes(db));
  app.use('/api/planner', plannerRoutes(db));

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, async () => {
      console.log(`\n${signal} received, shutting down...`);
      await db.close();
      server.close();
      process.exit(0);
    });
  }
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
