const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get all notifications for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await dataService.getNotifications(req.user._id);
    res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const updated = await dataService.markNotificationRead(req.params.id);
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
