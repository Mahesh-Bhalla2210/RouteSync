const { getHaversineDistance, estimateTravelDuration, calculateFare } = require('./distance');

/**
 * Rank, score, and recommend rides from multiple providers
 *
 * @param {Array} vehicles - Array of populated vehicle documents with providerId
 * @param {Object} pickup - { lat, lng, address }
 * @param {Object} dropoff - { lat, lng, address }
 * @param {String} preference - 'recommended' | 'cheapest' | 'fastest' | 'nearest' | 'rating'
 * @param {String} vehicleTypeFilter - optional vehicle type filter or 'all'
 */
function rankAndRecommendRides(vehicles, pickup, dropoff, preference = 'recommended', vehicleTypeFilter = 'all') {
  if (!vehicles || vehicles.length === 0) return { recommended: null, rides: [] };

  // 1. Calculate journey distance & duration between pickup and dropoff
  const journeyDistanceKm = getHaversineDistance(
    pickup.lat,
    pickup.lng,
    dropoff.lat,
    dropoff.lng
  );

  // 2. Filter available vehicles and apply vehicle type if specified
  let validVehicles = vehicles.filter((v) => v.isAvailable);

  if (vehicleTypeFilter && vehicleTypeFilter.toLowerCase() !== 'all') {
    validVehicles = validVehicles.filter(
      (v) => v.vehicleType.toLowerCase() === vehicleTypeFilter.toLowerCase()
    );
  }

  if (validVehicles.length === 0) {
    return {
      journeyDistanceKm,
      journeyDurationMins: estimateTravelDuration(journeyDistanceKm),
      recommended: null,
      rides: [],
    };
  }

  // 3. Enrich each vehicle with distance to pickup, ETA, fare calculation
  const enrichedRides = validVehicles.map((vehicle) => {
    // Distance from vehicle's current location to user's pickup point
    const pickupDistanceKm = getHaversineDistance(
      vehicle.currentCoordinates.lat,
      vehicle.currentCoordinates.lng,
      pickup.lat,
      pickup.lng
    );

    // ETA for vehicle to reach the user
    const pickupEtaMins = estimateTravelDuration(pickupDistanceKm, vehicle.vehicleType);

    // Estimated duration of the actual journey to destination
    const journeyDurationMins = estimateTravelDuration(journeyDistanceKm, vehicle.vehicleType);

    // Provider pricing multiplier
    const providerMultiplier = vehicle.providerId?.pricingMultiplier || 1.0;

    // Fare calculation
    const fareDetails = calculateFare(
      vehicle,
      journeyDistanceKm,
      journeyDurationMins,
      providerMultiplier
    );

    return {
      vehicleId: vehicle._id,
      vehicleModel: vehicle.model,
      vehicleType: vehicle.vehicleType,
      plateNumber: vehicle.plateNumber,
      color: vehicle.color,
      seats: vehicle.seats,
      features: vehicle.features || [],
      driver: {
        name: vehicle.driverName,
        phone: vehicle.driverPhone,
        rating: vehicle.driverRating,
      },
      currentCoordinates: vehicle.currentCoordinates,
      currentAddress: vehicle.currentAddress,
      provider: {
        _id: vehicle.providerId?._id,
        name: vehicle.providerId?.name || 'Local Fleet',
        displayName: vehicle.providerId?.displayName || 'Local Fleet',
        code: vehicle.providerId?.code || 'LOCAL',
        logo: vehicle.providerId?.logo,
        brandColor: vehicle.providerId?.brandColor || '#3b82f6',
        rating: vehicle.providerId?.rating || 4.7,
        cancellationPolicy: vehicle.providerId?.cancellationPolicy || 'Standard cancellation',
      },
      metrics: {
        pickupDistanceKm,
        pickupEtaMins,
        journeyDistanceKm,
        journeyDurationMins,
        totalTravelTimeMins: pickupEtaMins + journeyDurationMins,
      },
      fare: fareDetails,
      badges: [],
      score: 0,
    };
  });

  // 4. Identify best-in-class metrics for relative scoring and badges
  const minFare = Math.min(...enrichedRides.map((r) => r.fare.totalFare));
  const maxFare = Math.max(...enrichedRides.map((r) => r.fare.totalFare));
  const minPickupEta = Math.min(...enrichedRides.map((r) => r.metrics.pickupEtaMins));
  const maxPickupEta = Math.max(...enrichedRides.map((r) => r.metrics.pickupEtaMins));
  const minPickupDist = Math.min(...enrichedRides.map((r) => r.metrics.pickupDistanceKm));

  // 5. Score rides and assign badges
  enrichedRides.forEach((ride) => {
    // Normalization factors (0 to 1, higher is better)
    const fareSpread = maxFare - minFare || 1;
    const priceScore = 1 - (ride.fare.totalFare - minFare) / fareSpread;

    const etaSpread = maxPickupEta - minPickupEta || 1;
    const etaScore = 1 - (ride.metrics.pickupEtaMins - minPickupEta) / etaSpread;

    const ratingScore = ((ride.driver.rating + ride.provider.rating) / 2 - 3.5) / 1.5; // normalized around 3.5 - 5.0
    const clampedRatingScore = Math.max(0, Math.min(1, ratingScore));

    const ecoBonus = ride.vehicleType === 'EV' ? 0.15 : 0;

    // Composite score (0 - 100)
    // 40% Price, 35% Speed/ETA, 20% Driver/Provider Quality, 5% Eco factor
    const compositeScore = Math.round(
      (priceScore * 0.4 + etaScore * 0.35 + clampedRatingScore * 0.2 + ecoBonus) * 100
    );
    ride.score = compositeScore;

    // Assign contextual badges
    if (ride.fare.totalFare === minFare) {
      ride.badges.push({ type: 'cheapest', label: 'Lowest Price', icon: 'DollarSign' });
    }
    if (ride.metrics.pickupEtaMins === minPickupEta) {
      ride.badges.push({ type: 'fastest', label: `Fastest Pickup (${minPickupEta} min)`, icon: 'Zap' });
    }
    if (ride.metrics.pickupDistanceKm === minPickupDist) {
      ride.badges.push({ type: 'nearest', label: 'Closest Vehicle', icon: 'Navigation' });
    }
    if (ride.vehicleType === 'EV') {
      ride.badges.push({ type: 'eco', label: '100% Electric', icon: 'Leaf' });
    }
    if (ride.driver.rating >= 4.9) {
      ride.badges.push({ type: 'top_rated', label: 'Top Rated Driver', icon: 'Star' });
    }
  });

  // 6. Sort according to requested preference
  let sortedRides = [...enrichedRides];

  switch (preference.toLowerCase()) {
    case 'cheapest':
      sortedRides.sort((a, b) => a.fare.totalFare - b.fare.totalFare);
      break;
    case 'fastest':
      sortedRides.sort((a, b) => a.metrics.pickupEtaMins - b.metrics.pickupEtaMins);
      break;
    case 'nearest':
      sortedRides.sort((a, b) => a.metrics.pickupDistanceKm - b.metrics.pickupDistanceKm);
      break;
    case 'rating':
      sortedRides.sort((a, b) => b.driver.rating - a.driver.rating);
      break;
    case 'recommended':
    default:
      sortedRides.sort((a, b) => b.score - a.score);
      break;
  }

  // 7. Determine recommended best option
  // The recommended option is the one with highest composite score
  const highestScoredRide = [...enrichedRides].sort((a, b) => b.score - a.score)[0];
  if (highestScoredRide) {
    // Add Best Overall badge if not already present
    if (!highestScoredRide.badges.some((b) => b.type === 'best_match')) {
      highestScoredRide.badges.unshift({
        type: 'best_match',
        label: 'Best Match',
        icon: 'Award',
      });
    }
  }

  return {
    journeyDistanceKm,
    journeyDurationMins: estimateTravelDuration(journeyDistanceKm),
    preferenceApplied: preference,
    totalOptionsFound: sortedRides.length,
    recommended: highestScoredRide || null,
    rides: sortedRides,
  };
}

module.exports = {
  rankAndRecommendRides,
};
