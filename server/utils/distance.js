/**
 * Haversine formula to calculate great-circle distance between two coordinates in kilometers.
 */
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(2));
}

/**
 * Estimate travel duration in minutes based on distance and vehicle type
 */
function estimateTravelDuration(distanceKm, vehicleType = 'Sedan') {
  // Average urban speeds in km/h
  const speedProfiles = {
    Moto: 38,
    Auto: 26,
    Hatchback: 32,
    Sedan: 34,
    SUV: 32,
    EV: 35,
  };

  const avgSpeed = speedProfiles[vehicleType] || 32;
  // Time in hours -> convert to minutes, add 2 min base urban traffic buffer
  const durationMinutes = Math.max(3, Math.round((distanceKm / avgSpeed) * 60 + 2));
  return durationMinutes;
}

/**
 * Calculate detailed fare breakdown
 */
function calculateFare(vehicle, journeyDistanceKm, journeyDurationMins, providerMultiplier = 1.0) {
  const baseFare = Number(vehicle.baseFare || 3.5);
  const perKmRate = Number(vehicle.perKmRate || 1.8);
  const perMinRate = Number(vehicle.perMinRate || 0.25);

  const distanceFare = Number((journeyDistanceKm * perKmRate).toFixed(2));
  const timeFare = Number((journeyDurationMins * perMinRate).toFixed(2));
  const serviceFee = 1.5; // Flat platform service fee

  const subtotal = (baseFare + distanceFare + timeFare) * providerMultiplier;
  const totalFare = Number((subtotal + serviceFee).toFixed(2));

  return {
    baseFare,
    distanceFare,
    timeFare,
    serviceFee,
    multiplier: providerMultiplier,
    totalFare,
  };
}

module.exports = {
  getHaversineDistance,
  estimateTravelDuration,
  calculateFare,
};
