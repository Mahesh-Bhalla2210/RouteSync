import React from 'react';
import { X, Check, Star, Zap, DollarSign, Clock, ShieldCheck, Leaf, Award } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function RideComparisonModal() {
  const {
    comparedRides,
    clearComparison,
    toggleCompareRide,
    isComparisonModalOpen,
    setIsComparisonModalOpen,
    setSelectedRide,
    setIsBookingModalOpen,
  } = useBooking();

  if (!isComparisonModalOpen || comparedRides.length === 0) return null;

  const handleBook = (ride) => {
    setSelectedRide(ride);
    setIsComparisonModalOpen(false);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Multi-Provider Ride Comparison</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {comparedRides.length} Rides Selected
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare fares, pickup speeds, vehicle types, and ratings across providers side-by-side.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsComparisonModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table / Matrix */}
        <div className="p-5 sm:p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">
                  Feature
                </th>
                {comparedRides.map((ride) => (
                  <th key={ride.vehicleId} className="py-3 px-4 text-center w-1/4">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm mb-1.5"
                        style={{ backgroundColor: ride.provider?.brandColor || '#3b82f6' }}
                      >
                        {ride.provider?.code}
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {ride.provider?.displayName || ride.provider?.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCompareRide(ride)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {/* Fare Row */}
              <tr className="bg-emerald-50/40">
                <td className="py-3 px-4 font-bold text-slate-700">Estimated Total Fare</td>
                {comparedRides.map((ride) => (
                  <td key={ride.vehicleId} className="py-3 px-4 text-center font-black text-lg text-emerald-700">
                    ${ride.fare.totalFare.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Pickup ETA Row */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Pickup Arrival ETA</td>
                {comparedRides.map((ride) => (
                  <td key={ride.vehicleId} className="py-3 px-4 text-center font-extrabold text-blue-600">
                    ⚡ {ride.metrics.pickupEtaMins} mins away
                  </td>
                ))}
              </tr>

              {/* Total Duration Row */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Total Travel Duration</td>
                {comparedRides.map((ride) => (
                  <td key={ride.vehicleId} className="py-3 px-4 text-center font-medium text-slate-800">
                    ~{ride.metrics.journeyDurationMins} mins
                  </td>
                ))}
              </tr>

              {/* Vehicle & Seats Row */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Vehicle & Capacity</td>
                {comparedRides.map((ride) => (
                  <td key={ride.vehicleId} className="py-3 px-4 text-center text-xs text-slate-600">
                    <span className="font-bold text-slate-900 block">{ride.vehicleModel}</span>
                    <span>{ride.vehicleType} • {ride.seats} seats</span>
                  </td>
                ))}
              </tr>

              {/* Driver Rating Row */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Driver & Rating</td>
                {comparedRides.map((ride) => (
                  <td key={ride.vehicleId} className="py-3 px-4 text-center text-xs">
                    <span className="font-bold text-slate-900 flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {ride.driver.rating}
                    </span>
                    <span className="text-slate-500">{ride.driver.name}</span>
                  </td>
                ))}
              </tr>

              {/* Cancellation Policy Row */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Cancellation Policy</td>
                {comparedRides.map((ride) => (
                  <td key={ride.vehicleId} className="py-3 px-4 text-center text-xs text-slate-600">
                    {ride.provider?.cancellationPolicy || 'Standard 3 min policy'}
                  </td>
                ))}
              </tr>

              {/* Electric / Eco Row */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700">Eco-Friendly</td>
                {comparedRides.map((ride) => (
                  <td key={ride.vehicleId} className="py-3 px-4 text-center text-xs">
                    {ride.vehicleType === 'EV' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        <Leaf className="w-3 h-3" /> 100% Zero Emissions
                      </span>
                    ) : (
                      <span className="text-slate-400">Standard Hybrid/Gas</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Booking CTA Row */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-700">Action</td>
                {comparedRides.map((ride) => (
                  <td key={ride.vehicleId} className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleBook(ride)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
                    >
                      Choose & Book
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={clearComparison}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={() => setIsComparisonModalOpen(false)}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg bg-slate-200"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
