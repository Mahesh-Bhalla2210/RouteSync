import React, { useState } from 'react';
import { Star, X, Check, ThumbsUp, Sparkles } from 'lucide-react';
import api from '../../services/api';

const REVIEW_TAGS = [
  'Clean Vehicle',
  'Polite Driver',
  'Smooth Driving',
  'On Time',
  'Great Value',
  'Comfortable AC',
  'Followed Navigation',
];

export default function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Clean Vehicle', 'On Time']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !booking) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/reviews', {
        bookingId: booking._id,
        vehicleId: booking.vehicleId?._id || booking.vehicleId,
        providerId: booking.providerId?._id || booking.providerId,
        rating,
        comment,
        tags: selectedTags,
      });

      setIsDone(true);
      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-lg">Rate Your Ride Experience</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Thank you for your rating!</h4>
            <p className="text-xs text-slate-500">
              Your feedback helps {booking.providerId?.displayName || 'the provider'} maintain high
              service quality on RouteSync.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Star Rating Selector */}
            <div className="text-center py-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Tap to rate driver & vehicle
              </span>
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(rating)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 mt-2 block">
                {rating === 5 && '🌟 Exceptional! Loved it!'}
                {rating === 4 && '👍 Great and smooth ride.'}
                {rating === 3 && '👌 Average experience.'}
                {rating === 2 && '👎 Room for improvement.'}
                {rating === 1 && '⚠️ Poor experience.'}
              </span>
            </div>

            {/* Quick Feedback Tags */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                What went well?
              </span>
              <div className="flex flex-wrap gap-1.5">
                {REVIEW_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share more details about your driver or trip..."
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting Feedback...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
