const { School } = require('../models');

/**
 * School Service - Bare bones CRUD operations for schools/universities
 */
class SchoolService {
  async create(schoolData) {
    const school = new School(schoolData);
    return await school.save();
  }

  async getById(id) {
    return await School.findById(id);
  }

  async update(id, updateData) {
    return await School.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await School.findByIdAndDelete(id);
  }

  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await School.find().skip(skip).limit(limit);
  }
}

module.exports = new SchoolService();
