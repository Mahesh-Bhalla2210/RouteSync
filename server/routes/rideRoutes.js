const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { protect } = require('../middleware/auth');

// @route   POST /api/rides/search
// @desc    Search and compare available rides from multiple providers
router.post('/search', async (req, res) => {
  try {
    const { pickup, dropoff, vehicleType = 'all', preference = 'recommended' } = req.body;

    if (!pickup || !pickup.lat || !pickup.lng) {
      return res.status(400).json({
        success: false,
        message: 'Valid pickup coordinates (lat, lng) are required',
      });
    }

    if (!dropoff || !dropoff.lat || !dropoff.lng) {
      return res.status(400).json({
        success: false,
        message: 'Valid dropoff coordinates (lat, lng) are required',
      });
    }

    const comparisonResult = await dataService.searchAndCompareRides({
      pickup,
      dropoff,
      vehicleType,
      preference,
    });

    res.json({
      success: true,
      data: comparisonResult,
    });
  } catch (error) {
    console.error('Ride search error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/rides/live/:bookingId
// @desc    Get live tracking details for a booked ride
router.get('/live/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const liveRide = await dataService.getLiveRide(bookingId);

    if (!liveRide) {
      return res.status(404).json({ success: false, message: 'Live ride tracking not found' });
    }

    res.json({
      success: true,
      data: liveRide,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/rides/live/:bookingId/advance
// @desc    Simulate ride progression to next phase
router.post('/live/:bookingId/advance', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updatedRide = await dataService.stepRideSimulation(bookingId);

    res.json({
      success: true,
      data: updatedRide,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
