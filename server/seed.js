require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const { locationsData, providersData, vehicleTemplates } = require('./config/seedData');

const User = require('./models/User');
const Provider = require('./models/Provider');
const Vehicle = require('./models/Vehicle');
const Location = require('./models/Location');
const Booking = require('./models/Booking');
const Ride = require('./models/Ride');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

async function seedDatabase() {
  console.log('🌱 Starting RouteSync Database Seed...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.log('MongoDB is not directly connected, dataService will use in-memory seed on demand.');
    process.exit(0);
  }

  try {
    // Clear existing
    await Promise.all([
      User.deleteMany({}),
      Provider.deleteMany({}),
      Vehicle.deleteMany({}),
      Location.deleteMany({}),
      Booking.deleteMany({}),
      Ride.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('🧹 Cleared existing database records.');

    // 1. Providers
    const createdProviders = await Provider.insertMany(providersData);
    console.log(`✅ Seeded ${createdProviders.length} transportation providers.`);

    // 2. Locations
    const createdLocations = await Location.insertMany(locationsData);
    console.log(`✅ Seeded ${createdLocations.length} landmarks/locations.`);

    // 3. Vehicles
    const baseCenter = { lat: 40.7484, lng: -73.9857 };
    const vehiclesToInsert = vehicleTemplates.map((v) => {
      const provider = createdProviders.find((p) => p.code === v.providerCode) || createdProviders[0];
      return {
        providerId: provider._id,
        vehicleType: v.vehicleType,
        model: v.model,
        plateNumber: v.plateNumber,
        color: v.color,
        seats: v.seats,
        driverName: v.driverName,
        driverPhone: v.driverPhone,
        driverRating: v.driverRating,
        currentCoordinates: {
          lat: Number((baseCenter.lat + v.latOffset).toFixed(6)),
          lng: Number((baseCenter.lng + v.lngOffset).toFixed(6)),
        },
        currentAddress: v.currentAddress,
        isAvailable: true,
        baseFare: v.baseFare,
        perKmRate: v.perKmRate,
        perMinRate: v.perMinRate,
        features: v.features,
      };
    });

    const createdVehicles = await Vehicle.insertMany(vehiclesToInsert);
    console.log(`✅ Seeded ${createdVehicles.length} vehicles across providers.`);

    // 4. Users
    const user1 = await User.create({
      name: 'Alex Johnson',
      email: 'user@routesync.com',
      password: 'password123',
      phone: '+1 (555) 482-1923',
      role: 'user',
      walletBalance: 150.0,
      savedLocations: [
        { label: 'Home', address: '742 Evergreen Terrace, Midtown', coordinates: { lat: 40.758, lng: -73.9855 } },
        { label: 'Work', address: '100 Silicon Ave, Tech District', coordinates: { lat: 40.7505, lng: -73.9934 } },
      ],
    });

    const user2 = await User.create({
      name: 'Sarah Connor (Provider Manager)',
      email: 'provider@routesync.com',
      password: 'password123',
      phone: '+1 (555) 991-3421',
      role: 'provider',
      walletBalance: 2400.0,
    });

    const user3 = await User.create({
      name: 'System Admin',
      email: 'admin@routesync.com',
      password: 'password123',
      phone: '+1 (555) 000-1111',
      role: 'admin',
      walletBalance: 50000.0,
    });

    console.log(`✅ Seeded 3 default accounts: user@routesync.com, provider@routesync.com, admin@routesync.com (pw: password123)`);

    // 5. Sample Booking & Review
    const sampleBooking = await Booking.create({
      bookingCode: 'RS-94021',
      userId: user1._id,
      vehicleId: createdVehicles[0]._id,
      providerId: createdProviders[0]._id,
      pickupLocation: {
        address: 'Central Railway Station',
        coordinates: { lat: 40.7505, lng: -73.9934 },
      },
      dropoffLocation: {
        address: 'Tech Innovation Park',
        coordinates: { lat: 40.7589, lng: -73.9851 },
      },
      distanceKm: 1.25,
      durationMins: 6,
      estimatedFare: 7.2,
      finalFare: 7.2,
      status: 'completed',
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
    });

    await Review.create({
      bookingId: sampleBooking._id,
      userId: user1._id,
      providerId: createdProviders[0]._id,
      vehicleId: createdVehicles[0]._id,
      rating: 5,
      comment: 'Super fast pickup and immaculate car!',
      tags: ['On time', 'Clean vehicle'],
    });

    await Notification.create({
      userId: user1._id,
      title: 'Welcome to RouteSync!',
      message: 'Search and compare rides from top providers with live tracking.',
      type: 'promo',
    });

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
