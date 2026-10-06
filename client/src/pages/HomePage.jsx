import React, { useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  DollarSign,
  Layers,
  Award,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import RideSearchForm from '../components/Rides/RideSearchForm';
import RideCard from '../components/Rides/RideCard';
import RouteMap from '../components/Map/RouteMap';
import RideComparisonModal from '../components/Rides/RideComparisonModal';
import BookingModal from '../components/Rides/BookingModal';
import { reverseGeocode } from '../services/mapService';

export default function HomePage() {
  const {
    pickupLocation,
    setPickupLocation,
    dropoffLocation,
    setDropoffLocation,
    searchResults,
    searchRides,
    isSearching,
    searchError,
    comparedRides,
    setIsComparisonModalOpen,
    mapSelectionMode,
    setMapSelectionMode,
  } = useBooking();

  // Run initial search on mount so the user immediately sees live options!
  useEffect(() => {
    if (!searchResults) {
      searchRides();
    }
  }, []);

  // Map click handler to set pickup or dropoff point directly on the interactive map
  const handleMapClick = async (lat, lng, mode) => {
    const geo = await reverseGeocode(lat, lng);
    if (mode === 'pickup') {
      setPickupLocation(geo);
      setMapSelectionMode(null);
      searchRides({ pickup: geo });
    } else if (mode === 'dropoff') {
      setDropoffLocation(geo);
      setMapSelectionMode(null);
      searchRides({ dropoff: geo });
    }
  };

  const rides = searchResults?.rides || [];
  const recommendedRide = searchResults?.recommended;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-500/10 via-slate-50 to-transparent pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Provider Transportation Aggregator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            One Search. <span className="text-emerald-600">All Providers.</span> The Smartest Ride.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            RouteSync aggregates and ranks available vehicles from MetroRide, SwiftCab, EcoTransit, PrimeDrive & QuickHop so you always get the lowest fare and fastest arrival.
          </p>
        </div>
      </section>

      {/* Main App Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Search Form + Comparison Tray + Ride List */}
          <div className="lg:col-span-6 space-y-6">
            <RideSearchForm />

            {/* Side-by-side comparison floating drawer / banner */}
            {comparedRides.length > 0 && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    {comparedRides.length}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">
                      {comparedRides.length} {comparedRides.length === 1 ? 'Ride' : 'Rides'} Selected
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Compare fare, pickup ETA, and vehicle specs side-by-side
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComparisonModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <span>Compare Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Error Message */}
            {searchError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {searchError}
              </div>
            )}

            {/* Rides Results Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Available Rides</span>
                    {searchResults && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {searchResults.totalOptionsFound} options found
                      </span>
                    )}
                  </h3>
                  {searchResults && (
                    <span className="text-xs text-slate-500">
                      Route: {searchResults.journeyDistanceKm} km (~{searchResults.journeyDurationMins} mins)
                    </span>
                  )}
                </div>
              </div>

              {/* Loading Skeleton */}
              {isSearching && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-5 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="w-32 h-5 bg-slate-200 rounded" />
                        <div className="w-16 h-6 bg-slate-200 rounded" />
                      </div>
                      <div className="w-48 h-4 bg-slate-100 rounded" />
                      <div className="w-full h-8 bg-slate-50 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Best Match Card (if available) */}
              {!isSearching && recommendedRide && (
                <div className="space-y-2">
                  <RideCard ride={recommendedRide} isFeatured={true} />
                </div>
              )}

              {/* Other Ranked Rides */}
              {!isSearching &&
                rides
                  .filter((r) => r.vehicleId !== recommendedRide?.vehicleId)
                  .map((ride) => <RideCard key={ride.vehicleId} ride={ride} />)}

              {!isSearching && rides.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">No vehicles match your criteria</h4>
                  <p className="text-xs text-slate-500">
                    Try switching vehicle type to "All Types" or select a different destination.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Interactive Leaflet Route Map */}
          <div className="lg:col-span-6 sticky top-20 space-y-4">
            <div className="bg-white p-3.5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between mb-3 px-2">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Live Satellite Transit Map</h3>
                  <p className="text-[11px] text-slate-500">
                    Displays available vehicles across all providers and calculated path
                  </p>
                </div>
                {mapSelectionMode ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 animate-pulse">
                    Picking on Map
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">
                    Click pin to view vehicle
                  </span>
                )}
              </div>

              <RouteMap
                pickup={pickupLocation}
                dropoff={dropoffLocation}
                vehicles={rides}
                selectionMode={mapSelectionMode}
                onMapClick={handleMapClick}
                className="h-[520px] w-full rounded-2xl"
              />

              {/* Map Legend */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold">Pickup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-semibold">Destination</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400">Providers:</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" /> Metro
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" /> Swift
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-600" /> Eco
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-600" /> Prime
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-600" /> Quick
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RideComparisonModal />
      <BookingModal />
    </div>
  );
}
