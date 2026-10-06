import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { PRESET_LANDMARKS } from '../services/mapService';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  // Pre-seed initial pickup & dropoff for instant demo delight
  const [pickupLocation, setPickupLocation] = useState(PRESET_LANDMARKS[0]); // Central Railway Station
  const [dropoffLocation, setDropoffLocation] = useState(PRESET_LANDMARKS[2]); // Tech Innovation Park
  const [vehicleType, setVehicleType] = useState('all');
  const [preference, setPreference] = useState('recommended');

  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Selected ride for checkout / booking modal
  const [selectedRide, setSelectedRide] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Side-by-side comparison selection (up to 3 rides)
  const [comparedRides, setComparedRides] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Map click target mode: 'pickup' | 'dropoff' | null
  const [mapSelectionMode, setMapSelectionMode] = useState(null);

  // Execute ride search and comparison across all providers
  const searchRides = async (customParams = {}) => {
    const pickup = customParams.pickup || pickupLocation;
    const dropoff = customParams.dropoff || dropoffLocation;
    const vType = customParams.vehicleType || vehicleType;
    const pref = customParams.preference || preference;

    if (!pickup?.coordinates || !dropoff?.coordinates) {
      setSearchError('Please select both pickup and destination locations.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await api.post('/rides/search', {
        pickup: {
          address: pickup.address || pickup.name,
          lat: pickup.coordinates.lat,
          lng: pickup.coordinates.lng,
        },
        dropoff: {
          address: dropoff.address || dropoff.name,
          lat: dropoff.coordinates.lat,
          lng: dropoff.coordinates.lng,
        },
        vehicleType: vType,
        preference: pref,
      });

      if (res.success && res.data) {
        setSearchResults(res.data);
      } else {
        setSearchError('No available rides found for the selected route.');
      }
    } catch (err) {
      console.error('Ride search failed:', err);
      setSearchError(err.message || 'Failed to search rides.');
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle ride in comparison list (max 3 rides)
  const toggleCompareRide = (ride) => {
    setComparedRides((prev) => {
      const exists = prev.some((r) => r.vehicleId === ride.vehicleId);
      if (exists) {
        return prev.filter((r) => r.vehicleId !== ride.vehicleId);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 rides side-by-side.');
        return prev;
      }
      return [...prev, ride];
    });
  };

  const clearComparison = () => {
    setComparedRides([]);
  };

  return (
    <BookingContext.Provider
      value={{
        pickupLocation,
        setPickupLocation,
        dropoffLocation,
        setDropoffLocation,
        vehicleType,
        setVehicleType,
        preference,
        setPreference,
        searchResults,
        setSearchResults,
        isSearching,
        searchError,
        searchRides,
        selectedRide,
        setSelectedRide,
        isBookingModalOpen,
        setIsBookingModalOpen,
        comparedRides,
        toggleCompareRide,
        clearComparison,
        isComparisonModalOpen,
        setIsComparisonModalOpen,
        mapSelectionMode,
        setMapSelectionMode,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
