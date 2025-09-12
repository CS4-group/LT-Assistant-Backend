const { CoursePlan } = require('../models');

/**
 * CoursePlan Service - For managing 4-year academic plans
 */
class CoursePlanService {
  async createCoursePlan(planData) {
    const coursePlan = new CoursePlan(planData);
    return await coursePlan.save();
  }

  async getCoursePlanById(planId) {
    return await CoursePlan.findById(planId).populate('studentId').populate('semesters.courses');
  }

  async getCoursePlanByStudent(studentId) {
    return await CoursePlan.findOne({ studentId }).populate('studentId').populate('semesters.courses');
  }

  async updateCoursePlan(studentId, updateData) {
    return await CoursePlan.findOneAndUpdate({ studentId }, updateData, { new: true });
  }

  async deleteCoursePlan(studentId) {
    return await CoursePlan.findOneAndDelete({ studentId });
  }
}

module.exports = new CoursePlanService();