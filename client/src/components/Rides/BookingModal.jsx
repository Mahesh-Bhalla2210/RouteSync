import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CreditCard,
  Wallet,
  Banknote,
  MapPin,
  Clock,
  Car,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function BookingModal() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const {
    selectedRide,
    isBookingModalOpen,
    setIsBookingModalOpen,
    pickupLocation,
    dropoffLocation,
  } = useBooking();

  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [driverNotes, setDriverNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  if (!isBookingModalOpen || !selectedRide) return null;

  const fareTotal = selectedRide.fare.totalFare;
  const userWallet = user?.walletBalance || 0;
  const isWalletInsufficient = paymentMethod === 'wallet' && userWallet < fareTotal;

  const handleConfirmBooking = async () => {
    if (isWalletInsufficient) {
      setBookingError(
        `Insufficient wallet balance ($${userWallet.toFixed(2)}). Please select Card or Cash, or top up your wallet in Profile.`
      );
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const payload = {
        vehicleId: selectedRide.vehicleId,
        pickupLocation: {
          address: pickupLocation?.name || pickupLocation?.address || 'Pickup Point',
          coordinates: pickupLocation?.coordinates,
        },
        dropoffLocation: {
          address: dropoffLocation?.name || dropoffLocation?.address || 'Destination Point',
          coordinates: dropoffLocation?.coordinates,
        },
        paymentMethod,
        notes: driverNotes,
      };

      const res = await api.post('/bookings', payload);

      if (res.success && res.data) {
        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }

        // Deduct wallet in local state if paid with wallet
        if (paymentMethod === 'wallet') {
          setUser((prev) => ({
            ...prev,
            walletBalance: Number((userWallet - fareTotal).toFixed(2)),
          }));
        }

        setIsBookingModalOpen(false);
        // Navigate to live ride tracking page!
        navigate(`/track/${res.data._id}`);
      } else {
        setBookingError('Booking could not be confirmed. Please try again.');
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingError(err.message || 'Booking failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900">Confirm Your Ride</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review details, vehicle specs, and confirm payment
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBookingModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Vehicle & Provider Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: selectedRide.provider?.brandColor || '#3b82f6' }}
              >
                {selectedRide.provider?.code}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {selectedRide.provider?.displayName || selectedRide.provider?.name}
                </span>
                <span className="text-base font-extrabold text-slate-900 block">
                  {selectedRide.vehicleModel}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Driver: {selectedRide.driver.name} • {selectedRide.plateNumber}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-slate-900">
                ${fareTotal.toFixed(2)}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                ⚡ ~{selectedRide.metrics.pickupEtaMins}m away
              </span>
            </div>
          </div>

          {/* Route Summary */}
          <div className="p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Pickup Location
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {pickupLocation?.name || pickupLocation?.address}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Destination
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {dropoffLocation?.name || dropoffLocation?.address}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Distance: {selectedRide.metrics.journeyDistanceKm} km</span>
              <span>Est. Journey Time: ~{selectedRide.metrics.journeyDurationMins} mins</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* RouteSync Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Wallet
                  className={`w-4 h-4 mb-1.5 ${
                    paymentMethod === 'wallet' ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-bold text-slate-900 block">RouteSync Wallet</span>
                <span className="text-[11px] text-slate-500 block">
                  Bal: ${userWallet.toFixed(2)}
                </span>
              </button>

              {/* Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CreditCard
                  className={`w-4 h-4 mb-1.5 ${
                    paymentMethod === 'card' ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-bold text-slate-900 block">Card (•••• 4242)</span>
                <span className="text-[11px] text-slate-500 block">Instant pay</span>
              </button>

              {/* Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Banknote
                  className={`w-4 h-4 mb-1.5 ${
                    paymentMethod === 'cash' ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-bold text-slate-900 block">Cash</span>
                <span className="text-[11px] text-slate-500 block">Pay at dropoff</span>
              </button>
            </div>
          </div>

          {/* Notes for driver */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Pickup Notes for Driver (Optional)
            </label>
            <input
              type="text"
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              placeholder="e.g. Waiting beside the main glass entrance..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>

          {/* Error notice if any */}
          {bookingError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* Cancellation guarantee note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {selectedRide.provider?.cancellationPolicy ||
                'Free cancellation available before driver arrives.'}
            </span>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 text-base transition-all transform active:scale-[0.99] disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Assigning Driver & Vehicle...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Book Ride • ${fareTotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
