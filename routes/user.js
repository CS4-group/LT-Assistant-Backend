const express = require('express');

// Helper to format user response
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    goals: user.goals || null,
    coursePlan: user.coursePlan || null
  };
}

module.exports = (db) => {
  const router = express.Router();

  // POST /api/user/goals
  router.post('/goals', async (req, res) => {
    try {
      const { gradeLevel, careerPath, collegeGoals, academicInterests, gpaGoal } = req.body;

      if (!gradeLevel || !careerPath || !collegeGoals || !academicInterests || !gpaGoal) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required: gradeLevel, careerPath, collegeGoals, academicInterests, gpaGoal'
        });
      }

      if (!Array.isArray(academicInterests)) {
        return res.status(400).json({
          success: false,
          error: 'academicInterests must be an array'
        });
      }

      const updatedUser = await db.update('users', req.user.id, {
        goals: { gradeLevel, careerPath, collegeGoals, academicInterests, gpaGoal },
        updatedAt: new Date().toISOString()
      });

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update user goals'
        });
      }

      res.json({
        success: true,
        user: formatUser(updatedUser),
        message: 'User goals updated successfully'
      });

    } catch (error) {
      console.error('Update User Goals Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user goals'
      });
    }
  });

  // GET /api/user/profile
  router.get('/profile', async (req, res) => {
    try {
      const user = await db.findById('users', req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user: formatUser(user)
      });

    } catch (error) {
      console.error('Get User Profile Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  });

  return router;
};
