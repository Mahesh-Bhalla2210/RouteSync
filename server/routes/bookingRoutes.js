const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Book a selected ride
router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, pickupLocation, dropoffLocation, paymentMethod, notes } = req.body;

    if (!vehicleId || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID, pickup location, and dropoff location are required',
      });
    }

    const booking = await dataService.createBooking({
      userId: req.user._id,
      vehicleId,
      pickupLocation,
      dropoffLocation,
      paymentMethod: paymentMethod || 'wallet',
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully!',
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get all bookings for logged-in user
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await dataService.getUserBookings(req.user._id);
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking details by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await dataService.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel a booking
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await dataService.cancelBooking(req.params.id, reason);
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
