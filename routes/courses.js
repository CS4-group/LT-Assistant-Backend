const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET course names with ratings
  router.get('/names', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : null;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;

      let courseNames, total;
      if (limit) {
        const result = await db.getPaginatedWithRatings('courses', limit, offset);
        total = result.total;
        courseNames = result.items.map(course => ({
          id: course.id,
          title: course.title,
          rating: course.rating,
          reviewCount: course.reviewCount
        }));
      } else {
        const courses = await db.getAllWithRatings('courses');
        courseNames = courses.map(course => ({
          id: course.id,
          title: course.title,
          rating: course.rating,
          reviewCount: course.reviewCount
        }));
      }

      res.json({
        success: true,
        data: courseNames,
        ...(limit && { total }),
        message: 'Course names retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving course names',
        error: error.message
      });
    }
  });

  // GET a specific course with rating
  router.get('/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await db.getWithRating('courses', courseId);

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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving course',
        error: error.message
      });
    }
  });

  // GET all courses with ratings
  router.get('/', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : null;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;

      if (limit) {
        const { items, total } = await db.getPaginatedWithRatings('courses', limit, offset);
        return res.json({
          success: true,
          data: items,
          total,
          message: 'Courses retrieved successfully'
        });
      }

      const courses = await db.getAllWithRatings('courses');
      res.json({
        success: true,
        data: courses,
        message: 'Courses retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving courses',
        error: error.message
      });
    }
  });

  // CREATE a new course
  router.post('/', async (req, res) => {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
      }

      const newCourse = await db.insert('courses', { title, description });

      if (!newCourse) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create course'
        });
      }

      res.status(201).json({
        success: true,
        data: newCourse,
        message: 'Course created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating course',
        error: error.message
      });
    }
  });

  // UPDATE a course
  router.put('/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const { title, description } = req.body;

      if (!title && !description) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (title or description) is required for update'
        });
      }

      const updates = {};
      if (title) updates.title = title;
      if (description) updates.description = description;

      const updatedCourse = await db.update('courses', courseId, updates);

      if (!updatedCourse) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: updatedCourse,
        message: 'Course updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating course',
        error: error.message
      });
    }
  });

  // DELETE a course
  router.delete('/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const deleted = await db.delete('courses', courseId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting course',
        error: error.message
      });
    }
  });

  return router;
};
