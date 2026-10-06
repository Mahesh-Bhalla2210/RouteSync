import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Shield,
  Share2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Car,
  Check,
  Star,
} from 'lucide-react';
import RouteMap from '../Map/RouteMap';
import ReviewModal from './ReviewModal';
import api from '../../services/api';

const STATUS_STEPS = [
  { id: 'driver_assigned', label: 'Driver Assigned', desc: 'Driver confirmed your request' },
  { id: 'driver_arriving', label: 'On The Way', desc: 'Heading towards your pickup point' },
  { id: 'driver_arrived', label: 'Arrived at Pickup', desc: 'Vehicle waiting outside' },
  { id: 'trip_started', label: 'Trip In Progress', desc: 'Heading to destination' },
  { id: 'completed', label: 'Trip Completed', desc: 'Arrived safely at destination' },
];

export default function LiveRideTracker({ bookingId }) {
  const [liveData, setLiveData] = useState(null);
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [sosAlertTriggered, setSosAlertTriggered] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Fetch live tracking details
  const fetchLiveTracking = async () => {
    try {
      const res = await api.get(`/rides/live/${bookingId}`);
      if (res.success && res.data) {
        setLiveData(res.data);
        if (res.data.bookingId) {
          setBooking(res.data.bookingId);
        }
      }
    } catch (err) {
      console.error('Failed to load live ride data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTracking();
    const interval = setInterval(fetchLiveTracking, 4000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Advance simulation step
  const handleAdvanceStep = async () => {
    try {
      const res = await api.post(`/rides/live/${bookingId}/advance`);
      if (res.success && res.data) {
        setLiveData((prev) => ({ ...prev, ...res.data }));
        if (res.data.currentStatus === 'completed') {
          setIsReviewOpen(true);
          setAutoSimulate(false);
        }
      }
    } catch (err) {
      console.error('Simulation step error:', err);
    }
  };

  // Auto-simulation timer
  useEffect(() => {
    let timer;
    if (autoSimulate && liveData?.currentStatus !== 'completed') {
      timer = setInterval(() => {
        handleAdvanceStep();
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [autoSimulate, liveData?.currentStatus]);

  if (isLoading || !liveData) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-sm font-bold text-slate-700 block">Connecting to GPS Satellite & Driver...</span>
        </div>
      </div>
    );
  }

  const currentStatus = liveData.currentStatus || 'driver_assigned';
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.id === currentStatus);
  const vehicle = booking?.vehicleId || {};
  const provider = booking?.providerId || {};
  const pickup = booking?.pickupLocation;
  const dropoff = booking?.dropoffLocation;

  // Compute animated vehicle coordinates based on trip progress
  let vehiclePosition = liveData.liveCoordinates || pickup?.coordinates;
  if (currentStatus === 'driver_assigned') {
    vehiclePosition = liveData.liveCoordinates;
  } else if (currentStatus === 'driver_arriving') {
    // Intermediary point between vehicle and pickup
    vehiclePosition = {
      lat: (liveData.liveCoordinates.lat + (pickup?.coordinates?.lat || 0)) / 2,
      lng: (liveData.liveCoordinates.lng + (pickup?.coordinates?.lng || 0)) / 2,
    };
  } else if (currentStatus === 'driver_arrived') {
    vehiclePosition = pickup?.coordinates;
  } else if (currentStatus === 'trip_started') {
    // Intermediary point between pickup and dropoff
    vehiclePosition = {
      lat: ((pickup?.coordinates?.lat || 0) + (dropoff?.coordinates?.lat || 0)) / 2,
      lng: ((pickup?.coordinates?.lng || 0) + (dropoff?.coordinates?.lng || 0)) / 2,
    };
  } else if (currentStatus === 'completed') {
    vehiclePosition = dropoff?.coordinates;
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold flex items-center gap-2">
              <span>Interactive Live Trip Simulation</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              Advance through trip milestones in real-time to preview status events and maps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
              autoSimulate
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${autoSimulate ? 'fill-current' : ''}`} />
            <span>{autoSimulate ? 'Auto-Simulating (On)' : 'Auto-Simulate (Off)'}</span>
          </button>

          {currentStatus !== 'completed' ? (
            <button
              type="button"
              onClick={handleAdvanceStep}
              className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Next Phase →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsReviewOpen(true)}
              className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>Rate Trip</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Map + Tracking Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map */}
        <div className="lg:col-span-7 bg-white p-3 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <RouteMap
            pickup={pickup}
            dropoff={dropoff}
            activeVehiclePosition={vehiclePosition}
            className="h-[480px] w-full rounded-2xl"
          />

          {/* Quick trip badges under map */}
          <div className="mt-3 p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-900">
                Booking ID: {booking?.bookingCode || 'RS-94021'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>{booking?.distanceKm} km trip</span>
              <span className="font-bold text-slate-900">${booking?.finalFare?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Status Milestones & Driver Info */}
        <div className="lg:col-span-5 space-y-5">
          {/* Status Header Card */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Trip Status
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {STATUS_STEPS[currentStepIndex]?.label || 'Driver Assigned'}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {currentStatus === 'completed' ? 'Arrived' : 'ETA'}
                </span>
                <span className="text-lg font-black text-emerald-600 flex items-center justify-end gap-1">
                  <Clock className="w-4 h-4" />
                  {currentStatus === 'completed'
                    ? 'Completed'
                    : currentStatus === 'trip_started'
                    ? `~${liveData.dropoffETA || 10} min`
                    : `~${liveData.pickupETA || 2} min`}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="space-y-3.5 relative before:absolute before:top-2 before:bottom-2 before:left-3 before:w-0.5 before:bg-slate-200">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.id} className="flex items-start gap-3 relative z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-slate-900 text-white ring-4 ring-emerald-100 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <span
                        className={`text-xs font-bold block ${
                          isCurrent
                            ? 'text-slate-900'
                            : isPassed
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="text-[11px] text-slate-500">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Driver & Vehicle Card */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-md text-base"
                  style={{ backgroundColor: provider?.brandColor || '#3b82f6' }}
                >
                  {provider?.code || 'RS'}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {provider?.displayName || provider?.name}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {vehicle?.driverName || 'David Miller'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">
                      {vehicle?.driverRating || 4.9}
                    </span>
                    <span>• {vehicle?.vehicleType}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white block uppercase tracking-wider">
                  {vehicle?.plateNumber || 'MTR-4912'}
                </span>
                <span className="text-xs text-slate-500 font-medium mt-1 block">
                  {vehicle?.model || 'Toyota Camry Hybrid'}
                </span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <a
                href={`tel:${vehicle?.driverPhone || '+15553014412'}`}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call</span>
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{shareCopied ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSosAlertTriggered(true)}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-1.5 text-xs font-bold text-rose-700 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                <span>SOS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Safety Modal */}
      {sosAlertTriggered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Emergency Assistance Triggered</h3>
            <p className="text-xs text-slate-600">
              RouteSync Safety Protocol is active. Your live location ({vehiclePosition?.lat},{' '}
              {vehiclePosition?.lng}) and driver details ({vehicle?.plateNumber}) have been shared with
              local authorities and emergency contacts.
            </p>
            <button
              type="button"
              onClick={() => setSosAlertTriggered(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Dismiss Alert
            </button>
          </div>
        </div>
      )}

      {/* Review Modal on Trip Completion */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        booking={booking}
        onReviewSubmitted={() => {
          // Review submitted handler
        }}
      />
    </div>
  );
}
