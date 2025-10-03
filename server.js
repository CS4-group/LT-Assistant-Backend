const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
// Sample course data (in-memory, no database)
const courses = [
  {
    id: 1,
    title: 'ENGLISH I',
    description: 'English composition and literature'
  },
  {
    id: 2,
    title: 'ALGEBRA I',
    description: 'Introductory algebra concepts'
  },
  {
    id: 3,
    title: 'BIOLOGY I',
    description: 'Basic biological principles'
  }
];

// Get all course names only
app.get('/api/courses/names', (req, res) => {
  const courseNames = courses.map(course => ({
    id: course.id,
    title: course.title
  }));

  res.json({
    success: true,
    data: courseNames,
    message: 'Course names retrieved successfully'
  });
});

// Get individual course by ID
app.get('/api/courses/:id', (req, res) => {
  const courseId = parseInt(req.params.id);
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  
  res.json({
    success: true,
    data: course,
    message: 'Course retrieved successfully'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('📚 Course Names: http://localhost:' + PORT + '/api/courses/names'); 
  console.log('📖 Individual Course: http://localhost:' + PORT + '/api/courses/:id (e.g., /api/courses/1)');
});

module.exports = app;