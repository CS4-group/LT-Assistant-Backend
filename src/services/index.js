/**
 * Services index file - School project services
 */

const studentService = require('./studentService');
const courseService = require('./courseService');
const reviewService = require('./reviewService');
const coursePlanService = require('./coursePlanService');

module.exports = {
  studentService,
  courseService,
  reviewService,
  coursePlanService
};