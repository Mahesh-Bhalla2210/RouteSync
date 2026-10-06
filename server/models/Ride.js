const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    liveCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    currentStatus: {
      type: String,
      enum: ['driver_assigned', 'driver_arriving', 'driver_arrived', 'trip_started', 'completed', 'cancelled'],
      default: 'driver_assigned',
    },
    pickupETA: {
      type: Number, // in minutes
      default: 5,
    },
    dropoffETA: {
      type: Number, // in minutes
      default: 15,
    },
    routePolyline: [
      {
        lat: { type: Number },
        lng: { type: Number },
      },
    ],
    timeline: [
      {
        status: { type: String },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', rideSchema);
