const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { protect, providerOrAdmin } = require('../middleware/auth');

// @route   GET /api/vehicles
// @desc    Get all vehicles (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { providerId, vehicleType, isAvailable } = req.query;
    const filter = {};

    if (providerId) filter.providerId = providerId;
    if (vehicleType) filter.vehicleType = vehicleType;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const vehicles = await dataService.getVehicles(filter);
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get vehicle details
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await dataService.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/vehicles/:id/availability
// @desc    Update vehicle availability status (online / offline)
router.patch('/:id/availability', protect, providerOrAdmin, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (isAvailable === undefined) {
      return res.status(400).json({ success: false, message: 'isAvailable boolean is required' });
    }

    const updated = await dataService.updateVehicleAvailability(req.params.id, Boolean(isAvailable));
    res.json({
      success: true,
      message: `Vehicle availability set to ${isAvailable ? 'available' : 'unavailable'}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/vehicles/:id/location
// @desc    Update vehicle live coordinates
router.patch('/:id/location', protect, providerOrAdmin, async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'lat and lng coordinates are required' });
    }

    const updated = await dataService.updateVehicleLocation(req.params.id, { lat, lng }, address);
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
