const express = require('express');
const router = express.Router();
const { studentService } = require('../services');

/**
 * Student Routes - For managing students
 */

/**
 * @route   POST /api/v1/students
 * @desc    Create a new student
 */
router.post('/', async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      data: student,
      message: 'Student created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/students
 * @desc    Get all students
 */
router.get('/', async (req, res) => {
  try {
    const students = await studentService.getAllStudents();
    res.json({
      success: true,
      data: students,
      message: 'Students retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.json({
      success: true,
      data: student,
      message: 'Student retrieved successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/v1/students/:id
 * @desc    Update student
 */
router.put('/:id', async (req, res) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.json({
      success: true,
      data: student,
      message: 'Student updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/v1/students/:id
 * @desc    Delete student
 */
router.delete('/:id', async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
