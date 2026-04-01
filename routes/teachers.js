const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET all teachers with ratings
  router.get('/', async (req, res) => {
    try {
      const teachers = await db.getAllWithRatings('teachers');
      res.json({
        success: true,
        data: teachers,
        message: 'Teachers retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving teachers',
        error: error.message
      });
    }
  });

  // GET a specific teacher with rating
  router.get('/:id', async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const teacher = await db.getWithRating('teachers', teacherId);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      res.json({
        success: true,
        data: teacher,
        message: 'Teacher retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving teacher',
        error: error.message
      });
    }
  });

  // CREATE a new teacher
  router.post('/', async (req, res) => {
    try {
      const { name, department, courses } = req.body;

      if (!name || !department) {
        return res.status(400).json({
          success: false,
          message: 'Name and department are required'
        });
      }

      const newTeacher = await db.insert('teachers', {
        name,
        department,
        courses: courses || []
      });

      if (!newTeacher) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create teacher'
        });
      }

      res.status(201).json({
        success: true,
        data: newTeacher,
        message: 'Teacher created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating teacher',
        error: error.message
      });
    }
  });

  // UPDATE a teacher
  router.put('/:id', async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const { name, department, courses } = req.body;

      const updates = {};
      if (name) updates.name = name;
      if (department) updates.department = department;
      if (courses) updates.courses = courses;

      const updatedTeacher = await db.update('teachers', teacherId, updates);

      if (!updatedTeacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      res.json({
        success: true,
        data: updatedTeacher,
        message: 'Teacher updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating teacher',
        error: error.message
      });
    }
  });

  // DELETE a teacher
  router.delete('/:id', async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const deleted = await db.delete('teachers', teacherId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found'
        });
      }

      res.json({
        success: true,
        message: 'Teacher deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting teacher',
        error: error.message
      });
    }
  });

  return router;
};
