const express = require('express');
const authMiddleware = require('../middleware/auth');

const VALID_YEARS = ['freshman', 'sophomore', 'junior', 'senior'];
const VALID_SEMESTERS = ['fall', 'spring'];

function emptyPlan() {
  return {
    freshman:  { fall: [], spring: [] },
    sophomore: { fall: [], spring: [] },
    junior:    { fall: [], spring: [] },
    senior:    { fall: [], spring: [] }
  };
}

// Enrich a plan (courseIds -> full course objects)
function enrichPlan(plan, db) {
  const enriched = {};
  for (const year of VALID_YEARS) {
    enriched[year] = {};
    for (const semester of VALID_SEMESTERS) {
      enriched[year][semester] = (plan[year]?.[semester] || []).map(id => {
        return db.findById('courses', id) || { id, title: 'Unknown Course' };
      });
    }
  }
  return enriched;
}

function validateSlot(year, semester, res) {
  if (!VALID_YEARS.includes(year)) {
    res.status(400).json({ success: false, message: `year must be one of: ${VALID_YEARS.join(', ')}` });
    return false;
  }
  if (!VALID_SEMESTERS.includes(semester)) {
    res.status(400).json({ success: false, message: `semester must be one of: ${VALID_SEMESTERS.join(', ')}` });
    return false;
  }
  return true;
}

module.exports = (db) => {
  const router = express.Router();

  // All planner routes require auth
  router.use(authMiddleware(db));

  // GET /api/planner — get full plan enriched with course data
  router.get('/', (req, res) => {
    try {
      const user = db.findById('users', req.user.id);
      const plan = user.coursePlan || emptyPlan();

      res.json({
        success: true,
        data: enrichPlan(plan, db)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving plan', error: error.message });
    }
  });

  // POST /api/planner/add — add a course to a slot
  // Body: { courseId, year, semester }
  router.post('/add', (req, res) => {
    try {
      const { courseId, year, semester } = req.body;

      if (!courseId || !year || !semester) {
        return res.status(400).json({ success: false, message: 'courseId, year, and semester are required' });
      }

      if (!validateSlot(year, semester, res)) return;

      const course = db.findById('courses', parseInt(courseId));
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const user = db.findById('users', req.user.id);
      const plan = user.coursePlan || emptyPlan();

      if (plan[year][semester].includes(parseInt(courseId))) {
        return res.status(409).json({ success: false, message: 'Course already in that slot' });
      }

      plan[year][semester].push(parseInt(courseId));

      db.update('users', req.user.id, { coursePlan: plan, updatedAt: new Date().toISOString() });

      res.json({
        success: true,
        message: `${course.title} added to ${year} ${semester}`,
        data: enrichPlan(plan, db)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error adding course', error: error.message });
    }
  });

  // DELETE /api/planner/remove — remove a course from a slot
  // Body: { courseId, year, semester }
  router.delete('/remove', (req, res) => {
    try {
      const { courseId, year, semester } = req.body;

      if (!courseId || !year || !semester) {
        return res.status(400).json({ success: false, message: 'courseId, year, and semester are required' });
      }

      if (!validateSlot(year, semester, res)) return;

      const user = db.findById('users', req.user.id);
      const plan = user.coursePlan || emptyPlan();

      const index = plan[year][semester].indexOf(parseInt(courseId));
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Course not found in that slot' });
      }

      plan[year][semester].splice(index, 1);

      db.update('users', req.user.id, { coursePlan: plan, updatedAt: new Date().toISOString() });

      res.json({
        success: true,
        message: 'Course removed',
        data: enrichPlan(plan, db)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error removing course', error: error.message });
    }
  });

  // POST /api/planner/move — move a course from one slot to another
  // Body: { courseId, fromYear, fromSemester, toYear, toSemester }
  router.post('/move', (req, res) => {
    try {
      const { courseId, fromYear, fromSemester, toYear, toSemester } = req.body;

      if (!courseId || !fromYear || !fromSemester || !toYear || !toSemester) {
        return res.status(400).json({ success: false, message: 'courseId, fromYear, fromSemester, toYear, and toSemester are required' });
      }

      if (!validateSlot(fromYear, fromSemester, res)) return;
      if (!validateSlot(toYear, toSemester, res)) return;

      const user = db.findById('users', req.user.id);
      const plan = user.coursePlan || emptyPlan();

      const fromIndex = plan[fromYear][fromSemester].indexOf(parseInt(courseId));
      if (fromIndex === -1) {
        return res.status(404).json({ success: false, message: 'Course not found in source slot' });
      }

      if (plan[toYear][toSemester].includes(parseInt(courseId))) {
        return res.status(409).json({ success: false, message: 'Course already exists in destination slot' });
      }

      plan[fromYear][fromSemester].splice(fromIndex, 1);
      plan[toYear][toSemester].push(parseInt(courseId));

      db.update('users', req.user.id, { coursePlan: plan, updatedAt: new Date().toISOString() });

      const course = db.findById('courses', parseInt(courseId));
      res.json({
        success: true,
        message: `${course?.title || 'Course'} moved to ${toYear} ${toSemester}`,
        data: enrichPlan(plan, db)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error moving course', error: error.message });
    }
  });

  // DELETE /api/planner/reset — wipe the entire plan
  router.delete('/reset', (req, res) => {
    try {
      const plan = emptyPlan();

      db.update('users', req.user.id, { coursePlan: plan, updatedAt: new Date().toISOString() });

      res.json({
        success: true,
        message: 'Course plan reset',
        data: enrichPlan(plan, db)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error resetting plan', error: error.message });
    }
  });

  return router;
};
