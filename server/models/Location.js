const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: 'Metro City',
    },
    category: {
      type: String,
      enum: ['transit', 'airport', 'business', 'shopping', 'leisure', 'hospital', 'university'],
      default: 'transit',
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    popularityScore: {
      type: Number,
      default: 80,
    },
  },
  { timestamps: true }
);

locationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);
