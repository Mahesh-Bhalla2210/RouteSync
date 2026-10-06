const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getIsConnected } = require('../config/db');
const { locationsData, providersData, vehicleTemplates } = require('../config/seedData');
const { rankAndRecommendRides } = require('../utils/ranking');
const { getHaversineDistance, estimateTravelDuration, calculateFare } = require('../utils/distance');

// Mongoose Models
const User = require('../models/User');
const Provider = require('../models/Provider');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const Location = require('../models/Location');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// In-Memory Fallback State (initialized with seed data)
const memoryStore = {
  users: [],
  providers: [],
  vehicles: [],
  bookings: [],
  rides: [],
  locations: [],
  reviews: [],
  notifications: [],
};

// Seed in-memory store
async function initMemoryStore() {
  if (memoryStore.providers.length > 0) return; // already initialized

  // 1. Providers
  providersData.forEach((p, idx) => {
    memoryStore.providers.push({
      _id: `prov_${idx + 1}`,
      ...p,
      createdAt: new Date(),
    });
  });

  // 2. Locations
  locationsData.forEach((l, idx) => {
    memoryStore.locations.push({
      _id: `loc_${idx + 1}`,
      ...l,
      createdAt: new Date(),
    });
  });

  // 3. Vehicles
  const baseCenter = { lat: 40.7484, lng: -73.9857 }; // Manhattan Midtown Center
  vehicleTemplates.forEach((v, idx) => {
    const provider = memoryStore.providers.find((p) => p.code === v.providerCode) || memoryStore.providers[0];
    memoryStore.vehicles.push({
      _id: `veh_${idx + 1}`,
      providerId: provider._id,
      provider: provider,
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
      createdAt: new Date(),
    });
  });

  // 4. Default Seed Users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const defaultUser = {
    _id: 'user_default_1',
    name: 'Alex Johnson',
    email: 'user@routesync.com',
    password: hashedPassword,
    phone: '+1 (555) 482-1923',
    role: 'user',
    walletBalance: 150.0,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    savedLocations: [
      { label: 'Home', address: '742 Evergreen Terrace, Midtown', coordinates: { lat: 40.758, lng: -73.9855 } },
      { label: 'Work', address: '100 Silicon Ave, Tech District', coordinates: { lat: 40.7505, lng: -73.9934 } },
    ],
    createdAt: new Date(),
  };

  const providerAdmin = {
    _id: 'user_provider_1',
    name: 'Sarah Connor',
    email: 'provider@routesync.com',
    password: hashedPassword,
    phone: '+1 (555) 991-3421',
    role: 'provider',
    walletBalance: 2400.0,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(),
  };

  const superAdmin = {
    _id: 'user_admin_1',
    name: 'Admin Supervisor',
    email: 'admin@routesync.com',
    password: hashedPassword,
    phone: '+1 (555) 000-1111',
    role: 'admin',
    walletBalance: 50000.0,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date(),
  };

  memoryStore.users.push(defaultUser, providerAdmin, superAdmin);

  // 5. Sample Bookings & Rides for Alexander Johnson
  const demoVehicle = memoryStore.vehicles[0];
  const demoProvider = memoryStore.providers[0];
  const demoBooking = {
    _id: 'book_demo_101',
    bookingCode: 'RS-94021',
    userId: defaultUser._id,
    vehicleId: demoVehicle._id,
    providerId: demoProvider._id,
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
    fareBreakdown: {
      baseFare: 3.5,
      distanceFare: 2.0,
      timeFare: 1.32,
      serviceFee: 1.5,
      discount: 1.12,
    },
    status: 'completed',
    paymentMethod: 'wallet',
    paymentStatus: 'paid',
    createdAt: new Date(Date.now() - 3600000 * 24),
  };
  memoryStore.bookings.push(demoBooking);

  // 6. Review for demo booking
  memoryStore.reviews.push({
    _id: 'rev_1',
    bookingId: demoBooking._id,
    userId: defaultUser._id,
    providerId: demoProvider._id,
    vehicleId: demoVehicle._id,
    rating: 5,
    comment: 'Exceptional ride! Driver arrived 2 minutes earlier than expected and vehicle was spotless.',
    tags: ['On time', 'Clean vehicle', 'Smooth ride'],
    createdAt: new Date(Date.now() - 3600000 * 20),
  });

  // 7. Initial Notification
  memoryStore.notifications.push({
    _id: 'notif_1',
    userId: defaultUser._id,
    title: 'Welcome to RouteSync!',
    message: 'Compare rides from MetroRide, SwiftCab, EcoTransit & more. You have $150 in wallet credits to get started.',
    type: 'promo',
    isRead: false,
    createdAt: new Date(),
  });
}

// Ensure in-memory store is ready on load
initMemoryStore();

// =======================
// UNIFIED DATA SERVICE
// =======================

const dataService = {
  // ---- USERS ----
  async findUserByEmail(email) {
    if (getIsConnected()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async findUserById(id) {
    if (getIsConnected()) {
      return await User.findById(id).select('-password');
    }
    const user = memoryStore.users.find((u) => u._id.toString() === id.toString());
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },

  async createUser({ name, email, password, phone, role }) {
    if (getIsConnected()) {
      return await User.create({ name, email, password, phone, role });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '+1 (555) 000-0000',
      role: role || 'user',
      walletBalance: 150.0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      savedLocations: [
        { label: 'Home', address: 'Downtown Square', coordinates: { lat: 40.7505, lng: -73.9934 } },
      ],
      createdAt: new Date(),
    };
    memoryStore.users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  },

  async updateWallet(userId, amount) {
    if (getIsConnected()) {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.walletBalance = Number((user.walletBalance + Number(amount)).toFixed(2));
      await user.save();
      return user.walletBalance;
    }
    const user = memoryStore.users.find((u) => u._id.toString() === userId.toString());
    if (!user) throw new Error('User not found');
    user.walletBalance = Number((user.walletBalance + Number(amount)).toFixed(2));
    return user.walletBalance;
  },

  async updateUserProfile(userId, updateData) {
    if (getIsConnected()) {
      return await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    }
    const index = memoryStore.users.findIndex((u) => u._id.toString() === userId.toString());
    if (index !== -1) {
      memoryStore.users[index] = { ...memoryStore.users[index], ...updateData };
      const { password, ...safeUser } = memoryStore.users[index];
      return safeUser;
    }
    return null;
  },

  // ---- LOCATIONS ----
  async getLocations(query = '') {
    if (getIsConnected()) {
      const filter = query ? { name: { $regex: query, $options: 'i' } } : {};
      return await Location.find(filter).sort({ popularityScore: -1 });
    }
    if (!query) return memoryStore.locations;
    return memoryStore.locations.filter(
      (l) =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.address.toLowerCase().includes(query.toLowerCase())
    );
  },

  // ---- PROVIDERS ----
  async getProviders() {
    if (getIsConnected()) {
      return await Provider.find({ isActive: true });
    }
    return memoryStore.providers.filter((p) => p.isActive !== false);
  },

  async getProviderById(id) {
    if (getIsConnected()) {
      return await Provider.findById(id);
    }
    return memoryStore.providers.find((p) => p._id.toString() === id.toString());
  },

  // ---- VEHICLES ----
  async getVehicles(filter = {}) {
    if (getIsConnected()) {
      return await Vehicle.find(filter).populate('providerId');
    }
    let list = [...memoryStore.vehicles];
    if (filter.isAvailable !== undefined) {
      list = list.filter((v) => v.isAvailable === filter.isAvailable);
    }
    if (filter.providerId) {
      list = list.filter((v) => v.providerId.toString() === filter.providerId.toString());
    }
    if (filter.vehicleType) {
      list = list.filter((v) => v.vehicleType.toLowerCase() === filter.vehicleType.toLowerCase());
    }
    return list.map((v) => {
      const provider = memoryStore.providers.find((p) => p._id.toString() === v.providerId?.toString());
      return { ...v, providerId: provider || v.providerId };
    });
  },

  async getVehicleById(id) {
    if (getIsConnected()) {
      return await Vehicle.findById(id).populate('providerId');
    }
    const v = memoryStore.vehicles.find((veh) => veh._id.toString() === id.toString());
    if (!v) return null;
    const provider = memoryStore.providers.find((p) => p._id.toString() === v.providerId?.toString());
    return { ...v, providerId: provider || v.providerId };
  },

  async updateVehicleAvailability(id, isAvailable) {
    if (getIsConnected()) {
      return await Vehicle.findByIdAndUpdate(id, { isAvailable }, { new: true });
    }
    const veh = memoryStore.vehicles.find((v) => v._id.toString() === id.toString());
    if (veh) {
      veh.isAvailable = isAvailable;
      return veh;
    }
    return null;
  },

  async updateVehicleLocation(id, coords, address) {
    if (getIsConnected()) {
      return await Vehicle.findByIdAndUpdate(
        id,
        { currentCoordinates: coords, currentAddress: address },
        { new: true }
      );
    }
    const veh = memoryStore.vehicles.find((v) => v._id.toString() === id.toString());
    if (veh) {
      veh.currentCoordinates = coords;
      if (address) veh.currentAddress = address;
      return veh;
    }
    return null;
  },

  // ---- RIDE SEARCH & MULTI-PROVIDER COMPARISON ----
  async searchAndCompareRides({ pickup, dropoff, vehicleType, preference }) {
    // 1. Get all vehicles populated with their provider details
    let vehicles;
    if (getIsConnected()) {
      vehicles = await Vehicle.find({ isAvailable: true }).populate('providerId');
    } else {
      vehicles = memoryStore.vehicles
        .filter((v) => v.isAvailable)
        .map((v) => {
          const provider = memoryStore.providers.find(
            (p) => p._id.toString() === (v.providerId?._id || v.providerId).toString()
          );
          return { ...v, providerId: provider || v.providerId };
        });
    }

    // 2. Rank and recommend using the multi-criteria engine
    return rankAndRecommendRides(vehicles, pickup, dropoff, preference, vehicleType);
  },

  // ---- BOOKINGS & LIFECYCLE ----
  async createBooking(bookingPayload) {
    const {
      userId,
      vehicleId,
      pickupLocation,
      dropoffLocation,
      paymentMethod = 'wallet',
      notes,
    } = bookingPayload;

    // Verify vehicle exists and is available
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) throw new Error('Vehicle not found');
    if (!vehicle.isAvailable) throw new Error('Vehicle is no longer available');

    const providerId = vehicle.providerId?._id || vehicle.providerId;

    // Calculate trip metrics
    const distanceKm = getHaversineDistance(
      pickupLocation.coordinates.lat,
      pickupLocation.coordinates.lng,
      dropoffLocation.coordinates.lat,
      dropoffLocation.coordinates.lng
    );
    const durationMins = estimateTravelDuration(distanceKm, vehicle.vehicleType);
    const providerMultiplier = vehicle.providerId?.pricingMultiplier || 1.0;
    const fareDetails = calculateFare(vehicle, distanceKm, durationMins, providerMultiplier);

    const bookingCode = `RS-${Math.floor(10000 + Math.random() * 90000)}`;

    let booking;
    if (getIsConnected()) {
      booking = await Booking.create({
        bookingCode,
        userId,
        vehicleId,
        providerId,
        pickupLocation,
        dropoffLocation,
        distanceKm,
        durationMins,
        estimatedFare: fareDetails.totalFare,
        finalFare: fareDetails.totalFare,
        fareBreakdown: {
          baseFare: fareDetails.baseFare,
          distanceFare: fareDetails.distanceFare,
          timeFare: fareDetails.timeFare,
          serviceFee: fareDetails.serviceFee,
          discount: 0,
        },
        status: 'confirmed',
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
        notes,
      });

      // Update vehicle availability to false
      await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable: false });

      // Create live Ride entry
      const pickupEta = estimateTravelDuration(
        getHaversineDistance(
          vehicle.currentCoordinates.lat,
          vehicle.currentCoordinates.lng,
          pickupLocation.coordinates.lat,
          pickupLocation.coordinates.lng
        ),
        vehicle.vehicleType
      );

      await Ride.create({
        bookingId: booking._id,
        liveCoordinates: vehicle.currentCoordinates,
        currentStatus: 'driver_assigned',
        pickupETA: pickupEta,
        dropoffETA: durationMins,
        routePolyline: [
          vehicle.currentCoordinates,
          pickupLocation.coordinates,
          dropoffLocation.coordinates,
        ],
        timeline: [
          { status: 'driver_assigned', note: `${vehicle.driverName} assigned to your ride` },
        ],
        startedAt: new Date(),
      });

      // Create Notification
      await Notification.create({
        userId,
        title: 'Ride Confirmed!',
        message: `Your ride with ${vehicle.driverName} (${vehicle.model}) is confirmed. Booking code: ${bookingCode}`,
        type: 'booking_confirmed',
        bookingId: booking._id,
      });
    } else {
      // In-Memory flow
      booking = {
        _id: `book_${Date.now()}`,
        bookingCode,
        userId,
        vehicleId,
        providerId,
        pickupLocation,
        dropoffLocation,
        distanceKm,
        durationMins,
        estimatedFare: fareDetails.totalFare,
        finalFare: fareDetails.totalFare,
        fareBreakdown: {
          baseFare: fareDetails.baseFare,
          distanceFare: fareDetails.distanceFare,
          timeFare: fareDetails.timeFare,
          serviceFee: fareDetails.serviceFee,
          discount: 0,
        },
        status: 'confirmed',
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
        notes,
        createdAt: new Date(),
      };
      memoryStore.bookings.push(booking);

      // Mark vehicle unavailable
      await this.updateVehicleAvailability(vehicleId, false);

      // Create live Ride
      const pickupEta = estimateTravelDuration(
        getHaversineDistance(
          vehicle.currentCoordinates.lat,
          vehicle.currentCoordinates.lng,
          pickupLocation.coordinates.lat,
          pickupLocation.coordinates.lng
        ),
        vehicle.vehicleType
      );

      const ride = {
        _id: `ride_${Date.now()}`,
        bookingId: booking._id,
        liveCoordinates: vehicle.currentCoordinates,
        currentStatus: 'driver_assigned',
        pickupETA: pickupEta,
        dropoffETA: durationMins,
        routePolyline: [
          vehicle.currentCoordinates,
          pickupLocation.coordinates,
          dropoffLocation.coordinates,
        ],
        timeline: [
          {
            status: 'driver_assigned',
            note: `${vehicle.driverName} assigned to your ride`,
            timestamp: new Date(),
          },
        ],
        startedAt: new Date(),
      };
      memoryStore.rides.push(ride);

      // Create Notification
      memoryStore.notifications.push({
        _id: `notif_${Date.now()}`,
        userId,
        title: 'Ride Confirmed!',
        message: `Your ride with ${vehicle.driverName} (${vehicle.model}) is confirmed. Booking code: ${bookingCode}`,
        type: 'booking_confirmed',
        bookingId: booking._id,
        isRead: false,
        createdAt: new Date(),
      });
    }

    // Deduct wallet if paid by wallet
    if (paymentMethod === 'wallet') {
      try {
        await this.updateWallet(userId, -fareDetails.totalFare);
      } catch (e) {
        console.warn('Wallet deduction error:', e.message);
      }
    }

    return booking;
  },

  async getUserBookings(userId) {
    if (getIsConnected()) {
      return await Booking.find({ userId })
        .populate('vehicleId')
        .populate('providerId')
        .sort({ createdAt: -1 });
    }
    const bookings = memoryStore.bookings.filter(
      (b) => b.userId.toString() === userId.toString()
    );
    return bookings
      .map((b) => {
        const vehicle = memoryStore.vehicles.find((v) => v._id.toString() === b.vehicleId.toString());
        const provider = memoryStore.providers.find((p) => p._id.toString() === b.providerId.toString());
        return {
          ...b,
          vehicleId: vehicle || b.vehicleId,
          providerId: provider || b.providerId,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getBookingById(bookingId) {
    if (getIsConnected()) {
      return await Booking.findById(bookingId).populate('vehicleId').populate('providerId');
    }
    const b = memoryStore.bookings.find((item) => item._id.toString() === bookingId.toString());
    if (!b) return null;
    const vehicle = memoryStore.vehicles.find((v) => v._id.toString() === b.vehicleId.toString());
    const provider = memoryStore.providers.find((p) => p._id.toString() === b.providerId.toString());
    return {
      ...b,
      vehicleId: vehicle || b.vehicleId,
      providerId: provider || b.providerId,
    };
  },

  async cancelBooking(bookingId, reason = 'Cancelled by passenger') {
    let booking;
    if (getIsConnected()) {
      booking = await Booking.findById(bookingId);
      if (!booking) throw new Error('Booking not found');
      booking.status = 'cancelled';
      booking.cancellationReason = reason;
      await booking.save();

      // Free vehicle back up
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: true });

      // Update ride status
      await Ride.findOneAndUpdate({ bookingId }, { currentStatus: 'cancelled' });
    } else {
      booking = memoryStore.bookings.find((b) => b._id.toString() === bookingId.toString());
      if (!booking) throw new Error('Booking not found');
      booking.status = 'cancelled';
      booking.cancellationReason = reason;

      // Free vehicle back up
      await this.updateVehicleAvailability(booking.vehicleId, true);

      // Update ride
      const ride = memoryStore.rides.find((r) => r.bookingId.toString() === bookingId.toString());
      if (ride) ride.currentStatus = 'cancelled';
    }
    return booking;
  },

  // ---- LIVE RIDE SIMULATION & TRACKING ----
  async getLiveRide(bookingId) {
    if (getIsConnected()) {
      return await Ride.findOne({ bookingId }).populate({
        path: 'bookingId',
        populate: ['vehicleId', 'providerId'],
      });
    }
    const ride = memoryStore.rides.find((r) => r.bookingId.toString() === bookingId.toString());
    if (!ride) return null;
    const booking = await this.getBookingById(bookingId);
    return { ...ride, bookingId: booking };
  },

  async stepRideSimulation(bookingId) {
    const ride = await this.getLiveRide(bookingId);
    if (!ride) throw new Error('Ride not found');

    const nextStatuses = {
      driver_assigned: 'driver_arriving',
      driver_arriving: 'driver_arrived',
      driver_arrived: 'trip_started',
      trip_started: 'completed',
    };

    const current = ride.currentStatus;
    const nextStatus = nextStatuses[current];

    if (!nextStatus) {
      return ride; // already completed or cancelled
    }

    const noteMessages = {
      driver_arriving: 'Driver is on the way to your pickup location',
      driver_arrived: 'Driver has arrived outside at your pickup point',
      trip_started: 'Trip started! On the way to destination',
      completed: 'Arrived safely at destination. Thank you for riding!',
    };

    if (getIsConnected()) {
      const update = {
        currentStatus: nextStatus,
        $push: {
          timeline: {
            status: nextStatus,
            note: noteMessages[nextStatus],
            timestamp: new Date(),
          },
        },
      };

      if (nextStatus === 'driver_arriving') update.pickupETA = 2;
      if (nextStatus === 'driver_arrived') update.pickupETA = 0;
      if (nextStatus === 'completed') {
        update.completedAt = new Date();
        update.dropoffETA = 0;
        // Mark booking completed
        await Booking.findByIdAndUpdate(bookingId, { status: 'completed' });
        // Free vehicle
        const booking = await Booking.findById(bookingId);
        if (booking) await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: true });
      }

      const updatedRide = await Ride.findOneAndUpdate({ bookingId }, update, { new: true });
      return updatedRide;
    } else {
      const memRide = memoryStore.rides.find((r) => r.bookingId.toString() === bookingId.toString());
      if (memRide) {
        memRide.currentStatus = nextStatus;
        memRide.timeline.push({
          status: nextStatus,
          note: noteMessages[nextStatus],
          timestamp: new Date(),
        });
        if (nextStatus === 'driver_arriving') memRide.pickupETA = 2;
        if (nextStatus === 'driver_arrived') memRide.pickupETA = 0;
        if (nextStatus === 'completed') {
          memRide.completedAt = new Date();
          memRide.dropoffETA = 0;
          // Mark booking completed & free vehicle
          const booking = memoryStore.bookings.find((b) => b._id.toString() === bookingId.toString());
          if (booking) {
            booking.status = 'completed';
            await this.updateVehicleAvailability(booking.vehicleId, true);
          }
        }
      }
      return memRide;
    }
  },

  // ---- REVIEWS ----
  async addReview({ bookingId, userId, providerId, vehicleId, rating, comment, tags }) {
    if (getIsConnected()) {
      return await Review.create({
        bookingId,
        userId,
        providerId,
        vehicleId,
        rating,
        comment,
        tags: tags || [],
      });
    }
    const review = {
      _id: `rev_${Date.now()}`,
      bookingId,
      userId,
      providerId,
      vehicleId,
      rating,
      comment,
      tags: tags || [],
      createdAt: new Date(),
    };
    memoryStore.reviews.push(review);
    return review;
  },

  async getReviews(filter = {}) {
    if (getIsConnected()) {
      return await Review.find(filter)
        .populate('userId', 'name avatar')
        .populate('providerId', 'name displayName logo brandColor')
        .populate('vehicleId', 'model vehicleType')
        .sort({ createdAt: -1 });
    }
    return memoryStore.reviews.map((r) => {
      const user = memoryStore.users.find((u) => u._id.toString() === r.userId.toString());
      const provider = memoryStore.providers.find((p) => p._id.toString() === r.providerId.toString());
      const vehicle = memoryStore.vehicles.find((v) => v._id.toString() === r.vehicleId.toString());
      return {
        ...r,
        userId: user ? { name: user.name, avatar: user.avatar } : r.userId,
        providerId: provider || r.providerId,
        vehicleId: vehicle || r.vehicleId,
      };
    });
  },

  // ---- NOTIFICATIONS ----
  async getNotifications(userId) {
    if (getIsConnected()) {
      return await Notification.find({ userId }).sort({ createdAt: -1 });
    }
    return memoryStore.notifications
      .filter((n) => n.userId.toString() === userId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async markNotificationRead(id) {
    if (getIsConnected()) {
      return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }
    const notif = memoryStore.notifications.find((n) => n._id.toString() === id.toString());
    if (notif) notif.isRead = true;
    return notif;
  },

  // ---- ANALYTICS & DASHBOARD STATS ----
  async getAnalytics() {
    let providers, vehicles, bookings;
    if (getIsConnected()) {
      providers = await Provider.find();
      vehicles = await Vehicle.find();
      bookings = await Booking.find();
    } else {
      providers = memoryStore.providers;
      vehicles = memoryStore.vehicles;
      bookings = memoryStore.bookings;
    }

    const totalRides = bookings.length;
    const completedRides = bookings.filter((b) => b.status === 'completed').length;
    const activeRides = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.finalFare || 0), 0);

    // Rides by Provider
    const providerStats = providers.map((prov) => {
      const pBookings = bookings.filter(
        (b) => (b.providerId?._id || b.providerId).toString() === prov._id.toString()
      );
      const pRevenue = pBookings.reduce((sum, b) => sum + (b.finalFare || 0), 0);
      const pVehicles = vehicles.filter(
        (v) => (v.providerId?._id || v.providerId).toString() === prov._id.toString()
      );
      return {
        providerName: prov.displayName || prov.name,
        code: prov.code,
        color: prov.brandColor || '#3b82f6',
        totalRides: pBookings.length + (prov.totalRidesCompleted || 0),
        activeFleet: pVehicles.length,
        availableVehicles: pVehicles.filter((v) => v.isAvailable).length,
        revenue: Number(pRevenue.toFixed(2)),
        rating: prov.rating,
      };
    });

    // Vehicle Type breakdown
    const typeDistribution = [
      { name: 'Sedan', count: vehicles.filter((v) => v.vehicleType === 'Sedan').length },
      { name: 'SUV', count: vehicles.filter((v) => v.vehicleType === 'SUV').length },
      { name: 'EV', count: vehicles.filter((v) => v.vehicleType === 'EV').length },
      { name: 'Auto', count: vehicles.filter((v) => v.vehicleType === 'Auto').length },
      { name: 'Moto', count: vehicles.filter((v) => v.vehicleType === 'Moto').length },
      { name: 'Hatchback', count: vehicles.filter((v) => v.vehicleType === 'Hatchback').length },
    ];

    // Weekly performance trend (simulated for chart visualization)
    const weeklyTrends = [
      { day: 'Mon', rides: 42, revenue: 680, avgEta: 4.8 },
      { day: 'Tue', rides: 55, revenue: 890, avgEta: 4.2 },
      { day: 'Wed', rides: 49, revenue: 760, avgEta: 4.5 },
      { day: 'Thu', rides: 68, revenue: 1120, avgEta: 3.9 },
      { day: 'Fri', rides: 94, revenue: 1650, avgEta: 5.1 },
      { day: 'Sat', rides: 110, revenue: 1980, avgEta: 5.4 },
      { day: 'Sun', rides: 85, revenue: 1420, avgEta: 4.0 },
    ];

    return {
      summary: {
        totalRides,
        completedRides,
        activeRides,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalFleetSize: vehicles.length,
        availableVehiclesCount: vehicles.filter((v) => v.isAvailable).length,
        providerCount: providers.length,
      },
      providerStats,
      typeDistribution,
      weeklyTrends,
    };
  },
};

module.exports = dataService;
