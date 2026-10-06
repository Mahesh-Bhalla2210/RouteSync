const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard metrics, charts data, and provider comparisons
router.get('/dashboard', async (req, res) => {
  try {
    const analytics = await dataService.getAnalytics();
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
