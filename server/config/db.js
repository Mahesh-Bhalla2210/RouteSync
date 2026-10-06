const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/routesync';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.log(`ℹ️ Falling back to RouteSync Embedded In-Memory Store so the application remains 100% operational.`);
    isMongoConnected = false;
    return false;
  }
};

const getIsConnected = () => isMongoConnected;

module.exports = { connectDB, getIsConnected };
