const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Submit a review for a completed ride
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, vehicleId, providerId, rating, comment, tags } = req.body;

    if (!bookingId || !vehicleId || !providerId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, vehicle ID, provider ID, and rating are required',
      });
    }

    const review = await dataService.addReview({
      bookingId,
      userId: req.user._id,
      vehicleId,
      providerId,
      rating: Number(rating),
      comment,
      tags,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reviews
// @desc    Get reviews
router.get('/', async (req, res) => {
  try {
    const { providerId, vehicleId } = req.query;
    const filter = {};
    if (providerId) filter.providerId = providerId;
    if (vehicleId) filter.vehicleId = vehicleId;

    const reviews = await dataService.getReviews(filter);
    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
