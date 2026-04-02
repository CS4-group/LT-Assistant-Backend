require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const MongoDatabase = require('./database');
const requireAuth = require('./middleware/auth');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: 'https://ltassistant.com', credentials: true }));
app.use(cookieParser());
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
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }
  const db = new MongoDatabase(process.env.MONGODB_URI);
  await db.connect();

  // Ensure indexes
  await db.db.collection('users').createIndex({ email: 1 }, { unique: true }).catch(() => {});
  await db.db.collection('users').createIndex({ confirmationToken: 1 }, { sparse: true }).catch(() => {});

  // Mount routes — auth routes handle their own auth per-route
  app.use('/api/auth', authRoutes(db));

  // All other routes require authentication
  const auth = requireAuth(db);
  app.use('/api/user', auth, userRoutes(db));
  app.use('/api/courses', auth, coursesRoutes(db));
  app.use('/api/teachers', auth, teachersRoutes(db));
  app.use('/api/clubs', auth, clubsRoutes(db));
  app.use('/api/reviews', auth, reviewsRoutes(db));
  app.use('/api/chatbot', auth, chatbotRoutes(db));
  app.use('/api/planner', auth, plannerRoutes(db));

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
