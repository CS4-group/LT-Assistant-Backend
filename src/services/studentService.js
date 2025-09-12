const { Student } = require('../models');

/**
 * Student Service - For managing students
 */
class StudentService {
  async createStudent(studentData) {
    const student = new Student(studentData);
    return await student.save();
  }

  async getStudentById(studentId) {
    return await Student.findById(studentId);
  }

  async getAllStudents() {
    return await Student.find();
  }

  async updateStudent(studentId, updateData) {
    return await Student.findByIdAndUpdate(studentId, updateData, { new: true });
  }

  async deleteStudent(studentId) {
    return await Student.findByIdAndDelete(studentId);
  }
}

module.exports = new StudentService();
