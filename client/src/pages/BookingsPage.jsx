import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  RotateCcw,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import ReviewModal from '../components/Tracking/ReviewModal';

export default function BookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPickupLocation, setDropoffLocation, searchRides } = useBooking();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/bookings/my');
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, {
        reason: 'Passenger cancelled',
      });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleRebook = (booking) => {
    setPickupLocation({
      name: booking.pickupLocation.address,
      address: booking.pickupLocation.address,
      coordinates: booking.pickupLocation.coordinates,
    });
    setDropoffLocation({
      name: booking.dropoffLocation.address,
      address: booking.dropoffLocation.address,
      coordinates: booking.dropoffLocation.coordinates,
    });
    searchRides({
      pickup: booking.pickupLocation,
      dropoff: booking.dropoffLocation,
    });
    navigate('/');
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'active') return b.status === 'confirmed' || b.status === 'in_progress';
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            Confirmed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Ride History & Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active rides, view receipts, and rebook favorite destinations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start">
          {['all', 'active', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-all ${
                filter === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-xs font-bold text-slate-500">Loading your bookings...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg">No rides found</h3>
          <p className="text-xs text-slate-500">
            {filter === 'all'
              ? 'You have not booked any rides yet. Search vehicles across providers to begin!'
              : `You have no ${filter} rides.`}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-colors"
          >
            <span>Book a Ride</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBookings.map((b) => {
            const vehicle = b.vehicleId || {};
            const provider = b.providerId || {};
            const isActive = b.status === 'confirmed' || b.status === 'in_progress';

            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-sm"
                      style={{ backgroundColor: provider?.brandColor || '#3b82f6' }}
                    >
                      {provider?.code || 'RS'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {provider?.displayName || provider?.name}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {vehicle?.model || 'Sedan'}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Plate: {vehicle?.plateNumber} • {vehicle?.color}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 block">
                      ${b.finalFare?.toFixed(2)}
                    </span>
                    {getStatusBadge(b.status)}
                  </div>
                </div>

                {/* Route Points */}
                <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Pickup
                      </span>
                      <span className="font-semibold text-slate-800">
                        {b.pickupLocation?.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Destination
                      </span>
                      <span className="font-semibold text-slate-800">
                        {b.dropoffLocation?.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    <span>Code: </span>
                    <span className="font-bold text-slate-700">{b.bookingCode}</span>
                    <span> • {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b._id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
                        >
                          Cancel
                        </button>
                        <Link
                          to={`/track/${b._id}`}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-1"
                        >
                          <span>Track Live</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </>
                    ) : (
                      <>
                        {b.status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => setSelectedReviewBooking(b)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <Star className="w-3 h-3 text-amber-500" />
                            <span>Review</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRebook(b)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Rebook</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedReviewBooking && (
        <ReviewModal
          isOpen={!!selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          booking={selectedReviewBooking}
          onReviewSubmitted={() => {
            setSelectedReviewBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}
