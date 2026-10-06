const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Provider name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=128&q=80',
    },
    brandColor: {
      type: String,
      default: '#3b82f6', // Tailwind blue-500
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalRidesCompleted: {
      type: Number,
      default: 1250,
    },
    commissionRate: {
      type: Number,
      default: 0.12, // 12% platform commission
    },
    serviceTypes: [
      {
        type: String,
        enum: ['Sedan', 'SUV', 'Auto', 'Moto', 'Hatchback', 'EV'],
      },
    ],
    pricingMultiplier: {
      type: Number,
      default: 1.0, // Used for dynamic pricing / surge / discount
    },
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation within 3 minutes of booking.',
    },
    supportPhone: {
      type: String,
      default: '+1 (800) 555-RIDE',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Provider', providerSchema);
