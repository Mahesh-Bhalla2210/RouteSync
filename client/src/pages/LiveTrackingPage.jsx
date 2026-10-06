import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Navigation, ShieldCheck } from 'lucide-react';
import LiveRideTracker from '../components/Tracking/LiveRideTracker';

export default function LiveTrackingPage() {
  const { bookingId } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">RouteSync 24/7 Monitored Ride</span>
        </div>
      </div>

      {/* Main Tracker Container */}
      <LiveRideTracker bookingId={bookingId} />
    </div>
  );
}
