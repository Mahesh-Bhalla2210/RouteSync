import React from 'react';
import { ArrowUpDown, Search, Sparkles, Zap, DollarSign, Navigation, Star, Car } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import LocationInput from '../Map/LocationInput';
import { PRESET_LANDMARKS } from '../../services/mapService';

const VEHICLE_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'Sedan', label: 'Sedan' },
  { id: 'SUV', label: 'SUV' },
  { id: 'EV', label: '⚡ Electric (EV)' },
  { id: 'Auto', label: 'Auto' },
  { id: 'Moto', label: 'Bike' },
  { id: 'Hatchback', label: 'Hatchback' },
];

const PREFERENCES = [
  { id: 'recommended', label: 'Recommended', icon: Sparkles },
  { id: 'cheapest', label: 'Cheapest', icon: DollarSign },
  { id: 'fastest', label: 'Fastest', icon: Zap },
  { id: 'nearest', label: 'Nearest', icon: Navigation },
  { id: 'rating', label: 'Top Rated', icon: Star },
];

export default function RideSearchForm() {
  const {
    pickupLocation,
    setPickupLocation,
    dropoffLocation,
    setDropoffLocation,
    vehicleType,
    setVehicleType,
    preference,
    setPreference,
    searchRides,
    isSearching,
    mapSelectionMode,
    setMapSelectionMode,
  } = useBooking();

  const handleSwap = () => {
    const temp = pickupLocation;
    setPickupLocation(dropoffLocation);
    setDropoffLocation(temp);
  };

  const handleQuickRoute = (pickupIdx, dropoffIdx) => {
    setPickupLocation(PRESET_LANDMARKS[pickupIdx]);
    setDropoffLocation(PRESET_LANDMARKS[dropoffIdx]);
    searchRides({
      pickup: PRESET_LANDMARKS[pickupIdx],
      dropoff: PRESET_LANDMARKS[dropoffIdx],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchRides();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-5 md:p-6 transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Locations Inputs with Swap Button */}
        <div className="space-y-3 relative">
          <LocationInput
            label="Pickup Location"
            placeholder="Where are you right now?"
            value={pickupLocation}
            onChange={setPickupLocation}
            accentColor="emerald"
            isPickingOnMap={mapSelectionMode === 'pickup'}
            onSelectOnMap={() =>
              setMapSelectionMode((prev) => (prev === 'pickup' ? null : 'pickup'))
            }
          />

          {/* Swap Button */}
          <div className="flex justify-end -my-2 mr-3 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-sm transition-all"
              title="Swap pickup and destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <LocationInput
            label="Destination"
            placeholder="Where do you want to go?"
            value={dropoffLocation}
            onChange={setDropoffLocation}
            accentColor="rose"
            isPickingOnMap={mapSelectionMode === 'dropoff'}
            onSelectOnMap={() =>
              setMapSelectionMode((prev) => (prev === 'dropoff' ? null : 'dropoff'))
            }
          />
        </div>

        {/* Quick Demo Route Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => handleQuickRoute(0, 1)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            Station → Airport
          </button>
          <button
            type="button"
            onClick={() => handleQuickRoute(0, 2)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            Station → Tech Park
          </button>
          <button
            type="button"
            onClick={() => handleQuickRoute(3, 5)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            Galleria Mall → Harbor
          </button>
        </div>

        {/* Vehicle Type Horizontal Chips */}
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
            Preferred Vehicle Type
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {VEHICLE_TYPES.map((type) => {
              const isSelected = vehicleType.toLowerCase() === type.id.toLowerCase();
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setVehicleType(type.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Preference Tabs */}
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
            Prioritize By
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            {PREFERENCES.map((pref) => {
              const Icon = pref.icon;
              const isSelected = preference === pref.id;
              return (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => {
                    setPreference(pref.id);
                    // trigger search with new preference if we already have results
                    searchRides({ preference: pref.id });
                  }}
                  className={`text-xs font-semibold py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : ''}`} />
                  <span>{pref.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          disabled={isSearching}
          className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-70"
        >
          {isSearching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Scanning All Providers...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Find & Compare Best Rides</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
