const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ['Sedan', 'SUV', 'Auto', 'Moto', 'Hatchback', 'EV'],
      required: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: 'Silver',
    },
    seats: {
      type: Number,
      default: 4,
    },
    driverName: {
      type: String,
      required: true,
    },
    driverPhone: {
      type: String,
      default: '+1 (555) 234-5678',
    },
    driverRating: {
      type: Number,
      default: 4.85,
      min: 1,
      max: 5,
    },
    currentCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    currentAddress: {
      type: String,
      default: 'Downtown Center',
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    baseFare: {
      type: Number,
      required: true,
      default: 3.5, // Base pickup fee
    },
    perKmRate: {
      type: Number,
      required: true,
      default: 1.75, // $ per km
    },
    perMinRate: {
      type: Number,
      default: 0.25, // $ per min
    },
    features: [
      {
        type: String,
      },
    ],
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
