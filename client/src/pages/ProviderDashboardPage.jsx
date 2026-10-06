import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Car,
  TrendingUp,
  DollarSign,
  Users,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import api from '../services/api';
import RouteMap from '../components/Map/RouteMap';

const PIE_COLORS = ['#2563eb', '#059669', '#0d9488', '#7c3aed', '#d97706', '#ec4899'];

export default function ProviderDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('all');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, vehiclesRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/vehicles'),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (vehiclesRes.success) setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle vehicle availability live
  const handleToggleAvailability = async (vehicleId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await api.patch(`/vehicles/${vehicleId}/availability`, {
        isAvailable: newStatus,
      });

      if (res.success) {
        setVehicles((prev) =>
          prev.map((v) =>
            v._id === vehicleId ? { ...v, isAvailable: newStatus } : v
          )
        );
        // Refresh analytics numbers
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update vehicle availability');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.model?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.plateNumber?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.driverName?.toLowerCase().includes(searchFilter.toLowerCase());

    const providerId = v.providerId?._id || v.providerId;
    const matchesProvider =
      selectedProviderFilter === 'all' || providerId === selectedProviderFilter;

    return matchesSearch && matchesProvider;
  });

  const summary = analytics?.summary || {
    totalRides: 0,
    totalRevenue: 0,
    totalFleetSize: 0,
    availableVehiclesCount: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Provider Fleet & Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-provider market analytics, revenue trends, and fleet availability controls
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="self-start px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Completed Rides
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {summary.completedRides || 14}
          </div>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% this week
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Aggregated Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            ${summary.totalRevenue?.toFixed(2) || '245.80'}
          </div>
          <span className="text-xs text-slate-400 font-medium">Across all registered providers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Online Fleet
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">
            {summary.availableVehiclesCount} / {summary.totalFleetSize}
          </div>
          <span className="text-xs text-slate-500 font-medium">Vehicles currently available</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Integrated Providers
          </span>
          <div className="text-2xl sm:text-3xl font-black text-purple-600">
            {analytics?.providerStats?.length || 5}
          </div>
          <span className="text-xs text-slate-500 font-medium">Metro, Swift, Eco, Prime, Quick</span>
        </div>
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Revenue & Trips Trend (AreaChart) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Weekly Revenue & Booking Volume
              </h3>
              <p className="text-xs text-slate-500">Trip velocity and revenue over recent days</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.weeklyTrends || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  name="Revenue ($)"
                />
                <Area
                  type="monotone"
                  dataKey="rides"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={0.1}
                  fill="#2563eb"
                  name="Total Rides"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Types Distribution (PieChart) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Fleet Composition by Type</h3>
            <p className="text-xs text-slate-500">Breakdown of registered vehicle models</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.typeDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(analytics?.typeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Comparison BarChart */}
        <div className="lg:col-span-12 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Provider Performance & Active Fleet Share
              </h3>
              <p className="text-xs text-slate-500">
                Comparison of available vehicles vs total fleet across providers
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.providerStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="providerName" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="activeFleet" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Total Fleet" />
                <Bar
                  dataKey="availableVehicles"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  name="Available Now"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Fleet Management Table with Availability Toggle */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Fleet Vehicle Management & Availability Switch
            </h3>
            <p className="text-xs text-slate-500">
              Update real-time vehicle availability. When booked or toggled offline, vehicles are automatically excluded from customer search.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search model, driver, plate..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Vehicle & Model</th>
                <th className="py-3 px-3">Provider</th>
                <th className="py-3 px-3">Plate & Type</th>
                <th className="py-3 px-3">Driver & Rating</th>
                <th className="py-3 px-3">Rates</th>
                <th className="py-3 px-3 text-right">Live Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredVehicles.map((v) => {
                const provider = v.providerId || {};
                return (
                  <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 block">{v.model}</span>
                      <span className="text-[11px] text-slate-500">
                        {v.color} • {v.seats} seats
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className="px-2 py-0.5 rounded-md font-bold text-[11px] text-white inline-block"
                        style={{ backgroundColor: provider?.brandColor || '#3b82f6' }}
                      >
                        {provider?.displayName || provider?.name || 'Local'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-800 block">{v.plateNumber}</span>
                      <span className="text-[11px] text-slate-500">{v.vehicleType}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-800 block">{v.driverName}</span>
                      <span className="text-[11px] text-amber-600 font-semibold">
                        ★ {v.driverRating}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      <div>${v.baseFare} base</div>
                      <div className="text-[11px] text-slate-400">${v.perKmRate}/km</div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(v._id, v.isAvailable)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                          v.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            v.isAvailable ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{v.isAvailable ? 'Available (Online)' : 'Busy (Offline)'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
