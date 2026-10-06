const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    pickupLocation: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    dropoffLocation: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    distanceKm: {
      type: Number,
      required: true,
    },
    durationMins: {
      type: Number,
      required: true,
    },
    estimatedFare: {
      type: Number,
      required: true,
    },
    finalFare: {
      type: Number,
      required: true,
    },
    fareBreakdown: {
      baseFare: { type: Number, default: 0 },
      distanceFare: { type: Number, default: 0 },
      timeFare: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 1.5 },
      discount: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'card', 'cash'],
      default: 'wallet',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid',
    },
    cancellationReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
