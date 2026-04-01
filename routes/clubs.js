const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET all clubs with ratings
  router.get('/', async (req, res) => {
    try {
      const clubs = await db.getAllWithRatings('clubs');
      res.json({
        success: true,
        data: clubs,
        message: 'Clubs retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving clubs',
        error: error.message
      });
    }
  });

  // GET a specific club with rating
  router.get('/:id', async (req, res) => {
    try {
      const clubId = parseInt(req.params.id);
      const club = await db.getWithRating('clubs', clubId);

      if (!club) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      res.json({
        success: true,
        data: club,
        message: 'Club retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving club',
        error: error.message
      });
    }
  });

  // CREATE a new club
  router.post('/', async (req, res) => {
    try {
      const { name, description, meetingDay } = req.body;

      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name and description are required'
        });
      }

      const newClub = await db.insert('clubs', {
        name,
        description,
        meetingDay: meetingDay || null
      });

      if (!newClub) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create club'
        });
      }

      res.status(201).json({
        success: true,
        data: newClub,
        message: 'Club created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating club',
        error: error.message
      });
    }
  });

  // UPDATE a club
  router.put('/:id', async (req, res) => {
    try {
      const clubId = parseInt(req.params.id);
      const { name, description, meetingDay } = req.body;

      const updates = {};
      if (name) updates.name = name;
      if (description) updates.description = description;
      if (meetingDay !== undefined) updates.meetingDay = meetingDay;

      const updatedClub = await db.update('clubs', clubId, updates);

      if (!updatedClub) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      res.json({
        success: true,
        data: updatedClub,
        message: 'Club updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating club',
        error: error.message
      });
    }
  });

  // DELETE a club
  router.delete('/:id', async (req, res) => {
    try {
      const clubId = parseInt(req.params.id);
      const deleted = await db.delete('clubs', clubId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Club not found'
        });
      }

      res.json({
        success: true,
        message: 'Club deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting club',
        error: error.message
      });
    }
  });

  return router;
};
