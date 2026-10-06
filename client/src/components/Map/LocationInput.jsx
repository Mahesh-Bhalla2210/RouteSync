import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Check, Sparkles } from 'lucide-react';
import { searchLocations, PRESET_LANDMARKS } from '../../services/mapService';

export default function LocationInput({
  label = 'Location',
  placeholder = 'Enter address or landmark...',
  value,
  onChange,
  onSelectOnMap,
  isPickingOnMap = false,
  accentColor = 'emerald', // 'emerald' for pickup, 'rose' for dropoff
}) {
  const [query, setQuery] = useState(value?.name || value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Sync internal query when value prop updates
  useEffect(() => {
    if (value) {
      setQuery(value.name || value.address || '');
    }
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchLocations(query);
      setSuggestions(results);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (item) => {
    setQuery(item.name || item.address);
    onChange(item);
    setIsOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            name: 'Current Location',
            address: 'GPS Geolocation coordinate',
            coordinates: {
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6)),
            },
          };
          onChange(loc);
          setQuery('Current Location');
        },
        () => {
          // Fallback to central station
          const fallback = PRESET_LANDMARKS[0];
          onChange(fallback);
          setQuery(fallback.name);
        }
      );
    }
  };

  const isRose = accentColor === 'rose';

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isRose ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          {label}
        </label>
        <div className="flex items-center gap-2">
          {!isRose && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline transition-colors"
            >
              <Navigation className="w-3 h-3" />
              Use Current
            </button>
          )}
          {onSelectOnMap && (
            <button
              type="button"
              onClick={onSelectOnMap}
              className={`text-[11px] font-medium px-2 py-0.5 rounded transition-all ${
                isPickingOnMap
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {isPickingOnMap ? 'Click map to set' : 'Pick on map'}
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <MapPin className={`w-4 h-4 ${isRose ? 'text-rose-500' : 'text-emerald-500'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-9 pr-8 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-sm transition-all ${
            isRose
              ? 'border-slate-200 focus:border-rose-400 focus:ring-rose-100'
              : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(true);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 max-h-64 overflow-y-auto">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Popular & Suggested Spots</span>
            {isLoading && <span className="text-emerald-600 animate-spin">●</span>}
          </div>

          {suggestions.map((item) => (
            <button
              key={item.id || item.address}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-start gap-2.5 border-b border-slate-50 last:border-b-0"
            >
              <div
                className={`mt-0.5 p-1 rounded-md ${
                  isRose ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{item.address}</div>
              </div>
              {value?.name === item.name && (
                <Check className="w-4 h-4 text-emerald-600 mt-1" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
