const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// @route   GET /api/providers
// @desc    Get all active transportation providers
router.get('/', async (req, res) => {
  try {
    const providers = await dataService.getProviders();
    res.json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/providers/:id
// @desc    Get provider details by ID
router.get('/:id', async (req, res) => {
  try {
    const provider = await dataService.getProviderById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
