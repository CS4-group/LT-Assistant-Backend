const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());
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



const PORT = 3000;
app.listen(PORT, () => {
});

module.exports = app;