import React, { useState } from 'react';
import {
  Star,
  Users,
  Zap,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Award,
  Leaf,
  Navigation,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react';
import { useBooking } from '../../context/BookingContext';

export default function RideCard({ ride, isFeatured = false }) {
  const { setSelectedRide, setIsBookingModalOpen, comparedRides, toggleCompareRide } =
    useBooking();
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);

  const isCompared = comparedRides.some((r) => r.vehicleId === ride.vehicleId);

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'best_match':
        return <Award className="w-3 h-3 text-amber-500" />;
      case 'cheapest':
        return <DollarSign className="w-3 h-3 text-emerald-500" />;
      case 'fastest':
        return <Zap className="w-3 h-3 text-blue-500" />;
      case 'eco':
        return <Leaf className="w-3 h-3 text-teal-500" />;
      case 'nearest':
        return <Navigation className="w-3 h-3 text-indigo-500" />;
      default:
        return <Star className="w-3 h-3 text-amber-400" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'best_match':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'cheapest':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'fastest':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'eco':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 bg-white border ${
        isFeatured
          ? 'border-emerald-400 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20'
          : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
      } p-4 sm:p-5 relative`}
    >
      {/* Featured Header Pill */}
      {isFeatured && (
        <div className="absolute -top-3 left-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-yellow-300" />
          <span>Recommended Best Choice</span>
        </div>
      )}

      {/* Main Top Row: Provider & Vehicle Info + Price */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Provider Logo / Initial */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: ride.provider?.brandColor || '#3b82f6' }}
          >
            {ride.provider?.code || 'RS'}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-base">
                {ride.provider?.displayName || ride.provider?.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                {ride.vehicleType}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • {ride.plateNumber}
              </span>
            </div>

            <div className="text-sm font-semibold text-slate-700 mt-0.5">
              {ride.vehicleModel}
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-800">{ride.driver.rating}</span>
                <span>({ride.driver.name})</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{ride.seats} seats</span>
              </span>
            </div>
          </div>
        </div>

        {/* Fare Price */}
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ${ride.fare.totalFare.toFixed(2)}
          </div>
          <button
            type="button"
            onClick={() => setShowFareBreakdown(!showFareBreakdown)}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 ml-auto transition-colors"
          >
            <span>Fare Breakdown</span>
            {showFareBreakdown ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Badges Bar */}
      {ride.badges && ride.badges.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-100">
          {ride.badges.map((badge, idx) => (
            <span
              key={idx}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getBadgeColor(
                badge.type
              )}`}
            >
              {getBadgeIcon(badge.type)}
              <span>{badge.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Metrics Row: Pickup ETA, Distance, Duration */}
      <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Pickup ETA
          </span>
          <span className="text-sm font-extrabold text-blue-600 flex items-center justify-center gap-1 mt-0.5">
            <Zap className="w-3.5 h-3.5" />
            {ride.metrics.pickupEtaMins} mins
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Trip Distance
          </span>
          <span className="text-sm font-extrabold text-slate-700 mt-0.5 block">
            {ride.metrics.journeyDistanceKm} km
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Trip Duration
          </span>
          <span className="text-sm font-extrabold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            ~{ride.metrics.journeyDurationMins} mins
          </span>
        </div>
      </div>

      {/* Expandable Fare Breakdown */}
      {showFareBreakdown && (
        <div className="mt-2.5 p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
          <div className="flex justify-between text-slate-600">
            <span>Base Fare</span>
            <span className="font-semibold">${ride.fare.baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Distance Rate ({ride.metrics.journeyDistanceKm} km)</span>
            <span className="font-semibold">${ride.fare.distanceFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated Time ({ride.metrics.journeyDurationMins} min)</span>
            <span className="font-semibold">${ride.fare.timeFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Platform Service Fee</span>
            <span className="font-semibold">${ride.fare.serviceFee.toFixed(2)}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
            <span>Estimated Total</span>
            <span className="text-emerald-600">${ride.fare.totalFare.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Card Actions: Compare Checkbox & Book Button */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleCompareRide(ride)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
            isCompared
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isCompared ? (
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>{isCompared ? 'Added to Compare' : 'Compare Ride'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRide(ride);
            setIsBookingModalOpen(true);
          }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 ${
            isFeatured
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
          }`}
        >
          <span>Book with {ride.provider?.displayName || ride.provider?.code}</span>
        </button>
      </div>
    </div>
  );
}
