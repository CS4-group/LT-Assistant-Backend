const { Course } = require('../models');

/**
 * Course Service - For managing courses
 */
class CourseService {
  async createCourse(courseData) {
    const course = new Course(courseData);
    return await course.save();
  }

  async getCourseById(courseId) {
    return await Course.findById(courseId)
      .select('-__v')
      .lean();
  }

  async getAllCourses() {
    return await Course.find()
      .select('-__v')              // Exclude version field
      .sort({ title: 1 })          // Sort by course title/name alphabetically
      .limit(200)                  // Limit to 200 courses for performance
      .lean();                     // Return plain objects (faster)
  }

  async getCoursesForRating() {
    return await Course.find()
      .select('title description')  // Only return title and description for ratings
      .sort({ title: 1 })          // Sort by course title/name alphabetically
      .limit(200)                  // Limit to 200 courses for performance
      .lean();                     // Return plain objects (faster)
  }

  async updateCourse(courseId, updateData) {
    return await Course.findByIdAndUpdate(courseId, updateData, { new: true });
  }

  async deleteCourse(courseId) {
    return await Course.findByIdAndDelete(courseId);
  }
}

module.exports = new CourseService();
