/**
 * Map and Location Service
 * Provides realistic routing, landmark database, geocoding fallback,
 * and polyline trajectory generation without requiring external API keys.
 */

// Popular city landmarks for immediate zero-key autocomplete
export const PRESET_LANDMARKS = [
  {
    id: 'p1',
    name: 'Central Railway Station',
    address: '100 Station Square, Downtown',
    category: 'transit',
    coordinates: { lat: 40.7505, lng: -73.9934 },
  },
  {
    id: 'p2',
    name: 'Metropolitan Airport Terminal 1',
    address: 'Terminal 1, Queens Parkway',
    category: 'airport',
    coordinates: { lat: 40.6413, lng: -73.7781 },
  },
  {
    id: 'p3',
    name: 'Tech Innovation Park',
    address: '450 Silicon Avenue, Midtown Tech District',
    category: 'business',
    coordinates: { lat: 40.7589, lng: -73.9851 },
  },
  {
    id: 'p4',
    name: 'Grand Galleria Mall',
    address: '120 Broadway Commerce Blvd',
    category: 'shopping',
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: 'p5',
    name: 'City General Hospital',
    address: '550 1st Avenue, Health Care Corridor',
    category: 'hospital',
    coordinates: { lat: 40.7425, lng: -73.9745 },
  },
  {
    id: 'p6',
    name: 'Waterfront Harbor Point',
    address: 'Pier 17, South Street Esplanade',
    category: 'leisure',
    coordinates: { lat: 40.7058, lng: -74.0031 },
  },
  {
    id: 'p7',
    name: 'University Campus Center',
    address: 'Washington Square East, Greenwich',
    category: 'university',
    coordinates: { lat: 40.7295, lng: -73.9965 },
  },
  {
    id: 'p8',
    name: 'Central Park West Entrance',
    address: '72nd St & Central Park West',
    category: 'leisure',
    coordinates: { lat: 40.7765, lng: -73.976 },
  },
];

/**
 * Generate a realistic road polyline with turns and waypoints between two coordinates
 */
export function generateRouteWaypoints(start, end, steps = 14) {
  if (!start || !end) return [];

  const points = [];
  const latDelta = end.lat - start.lat;
  const lngDelta = end.lng - start.lng;

  // Add starting point
  points.push([start.lat, start.lng]);

  // Intermediate realistic urban street grid bends
  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    // Introduce slight perpendicular offset for realistic city street zigzag
    const perpOffset = Math.sin(fraction * Math.PI) * (i % 2 === 0 ? 0.003 : -0.002);

    const lat = start.lat + latDelta * fraction + perpOffset * 0.4;
    const lng = start.lng + lngDelta * fraction + perpOffset * 0.8;
    points.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }

  // Add destination point
  points.push([end.lat, end.lng]);
  return points;
}

/**
 * Search location autocomplete (offline pre-cached landmarks + OpenStreetMap Nominatim fallback)
 */
export async function searchLocations(query) {
  if (!query || query.trim().length === 0) {
    return PRESET_LANDMARKS.slice(0, 5);
  }

  const q = query.toLowerCase().trim();

  // 1. Search locally first
  const localMatches = PRESET_LANDMARKS.filter(
    (item) =>
      item.name.toLowerCase().includes(q) || item.address.toLowerCase().includes(q)
  );

  if (localMatches.length >= 2) {
    return localMatches;
  }

  // 2. Try OpenStreetMap Nominatim API (Free public service, requires no key)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'RouteSync-App/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const osmResults = data.map((item, idx) => ({
          id: `osm_${item.place_id || idx}`,
          name: item.display_name.split(',')[0],
          address: item.display_name,
          category: 'search_result',
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          },
        }));
        return [...localMatches, ...osmResults].slice(0, 6);
      }
    }
  } catch (err) {
    // Silently fall back to local matches
  }

  return localMatches.length > 0 ? localMatches : PRESET_LANDMARKS.slice(0, 3);
}

/**
 * Reverse geocode coordinate to friendly street name
 */
export async function reverseGeocode(lat, lng) {
  // Check if near any landmark
  for (const landmark of PRESET_LANDMARKS) {
    const dLat = Math.abs(landmark.coordinates.lat - lat);
    const dLng = Math.abs(landmark.coordinates.lng - lng);
    if (dLat < 0.008 && dLng < 0.008) {
      return {
        name: landmark.name,
        address: landmark.address,
        coordinates: { lat, lng },
      };
    }
  }

  // Try Nominatim reverse
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'RouteSync-App/1.0',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return {
          name: data.name || data.display_name.split(',')[0],
          address: data.display_name,
          coordinates: { lat, lng },
        };
      }
    }
  } catch (e) {
    // fallback
  }

  return {
    name: 'Selected Pin Location',
    address: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° W, Metro Area`,
    coordinates: { lat, lng },
  };
}
