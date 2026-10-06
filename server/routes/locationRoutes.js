const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// @route   GET /api/locations
// @desc    Get landmarks / popular locations or search by keyword
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const locations = await dataService.getLocations(q);
    res.json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/locations/reverse
// @desc    Reverse geocoding (coordinates to address)
router.post('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    // Check if close to a known landmark
    const locations = await dataService.getLocations();
    let closest = null;
    let minDiff = Infinity;

    locations.forEach((loc) => {
      const diff = Math.hypot(loc.coordinates.lat - lat, loc.coordinates.lng - lng);
      if (diff < minDiff) {
        minDiff = diff;
        closest = loc;
      }
    });

    if (closest && minDiff < 0.015) {
      return res.json({
        success: true,
        data: {
          address: `${closest.name}, ${closest.address}`,
          coordinates: { lat, lng },
        },
      });
    }

    // Realistic fallback address format
    const streetNames = ['Broadway Ave', 'Grand Blvd', 'Lexington St', 'Park Row', 'Riverside Dr', 'Madison Ave'];
    const randomStreet = streetNames[Math.floor(Math.abs(lat * 100) % streetNames.length)];
    const randomNum = Math.floor(Math.abs(lng * 1000) % 900) + 100;

    res.json({
      success: true,
      data: {
        address: `${randomNum} ${randomStreet}, Metro Area`,
        coordinates: { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
