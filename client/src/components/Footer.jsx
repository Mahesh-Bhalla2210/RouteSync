import React from 'react';
import { Navigation, ShieldCheck, Zap, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Navigation className="w-4 h-4 -rotate-45" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Route<span className="text-emerald-500">Sync</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The unified multi-provider transit aggregation platform. Compare rides in real time across
              MetroRide, SwiftCab, EcoTransit, PrimeDrive, and QuickHop to find the most economical,
              fastest, and nearest option for every journey.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <span className="font-bold text-white uppercase tracking-wider block mb-3 text-[11px]">
              Platform Features
            </span>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">Multi-Provider Ranking</span>
              </li>
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">Live Satellite Map Routing</span>
              </li>
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">Side-by-Side Comparison</span>
              </li>
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">In-App RouteSync Wallet</span>
              </li>
            </ul>
          </div>

          {/* Transportation Partners */}
          <div>
            <span className="font-bold text-white uppercase tracking-wider block mb-3 text-[11px]">
              Integrated Providers
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[11px]">
                MetroRide
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                SwiftCab
              </span>
              <span className="px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold text-[11px]">
                EcoTransit
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-[11px]">
                PrimeDrive
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">
                QuickHop
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} RouteSync Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with React, Express, Node.js & MongoDB
          </div>
        </div>
      </div>
    </footer>
  );
}
