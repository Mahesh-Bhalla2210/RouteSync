import React, { useState } from 'react';
import {
  Wallet,
  User,
  Plus,
  MapPin,
  Shield,
  CreditCard,
  Check,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, topupWallet, quickLogin, logout } = useAuth();
  const [topupAmount, setTopupAmount] = useState('50');
  const [isProcessing, setIsProcessing] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState(false);

  const handleTopup = async (amt) => {
    const val = amt || topupAmount;
    if (!val || Number(val) <= 0) return;

    setIsProcessing(true);
    setTopupSuccess(false);

    try {
      await topupWallet(Number(val));
      setTopupSuccess(true);
      setTimeout(() => setTopupSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Top-up failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'
            }
            alt="User avatar"
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.name}</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Role: {user?.role || 'user'}
              </span>
              <span className="text-xs text-slate-400">• {user?.phone}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* RouteSync Wallet Center */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                RouteSync Digital Wallet
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white">
                ${(user?.walletBalance || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Instant cashless booking across all transit providers</span>
          </div>
        </div>

        {/* Top-up Form */}
        <div className="pt-4 border-t border-slate-700/60 space-y-3">
          <span className="text-xs font-bold text-slate-300 block">Select Top-Up Amount:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[25, 50, 100, 200].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleTopup(amt)}
                disabled={isProcessing}
                className="py-2.5 rounded-xl font-extrabold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600/60 transition-all text-white flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>${amt}</span>
              </button>
            ))}
          </div>

          {topupSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Wallet successfully credited!</span>
            </div>
          )}
        </div>
      </div>

      {/* Saved Places */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Saved Favorite Locations</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white shadow-sm text-emerald-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Home</span>
              <span className="text-[11px] text-slate-500">742 Evergreen Terrace, Midtown</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white shadow-sm text-blue-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Work / Office</span>
              <span className="text-[11px] text-slate-500">100 Silicon Ave, Tech District</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Account Switcher */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Demo Evaluation Accounts</h3>
        <p className="text-xs text-slate-500">
          Switch user roles immediately to test passenger booking or provider fleet management:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => quickLogin('user')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 shadow-sm transition-all"
          >
            Alex Johnson (Passenger)
          </button>
          <button
            type="button"
            onClick={() => quickLogin('provider')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 shadow-sm transition-all"
          >
            Sarah Connor (Provider Manager)
          </button>
          <button
            type="button"
            onClick={() => quickLogin('admin')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 shadow-sm transition-all"
          >
            System Admin
          </button>
        </div>
      </div>
    </div>
  );
}
