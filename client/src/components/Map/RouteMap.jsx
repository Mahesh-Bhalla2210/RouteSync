import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Car, MapPin, Flag, Zap, Navigation } from 'lucide-react';
import { generateRouteWaypoints } from '../../services/mapService';

// Map click handler for picking location from map
function MapClickHandler({ onMapClick, selectionMode }) {
  useMapEvents({
    click: (e) => {
      if (selectionMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng, selectionMode);
      }
    },
  });
  return null;
}

// Auto-fit bounds component to automatically pan and zoom to show all markers
function AutoFitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        const leafletBounds = L.latLngBounds(bounds);
        map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 15 });
      } catch (e) {
        // ignore bounds fit error
      }
    }
  }, [bounds, map]);
  return null;
}

// Helper to create custom HTML DivIcons
const createHtmlIcon = (htmlContent, size = [36, 36]) => {
  return L.divIcon({
    html: htmlContent,
    className: 'custom-leaflet-marker',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2],
  });
};

export default function RouteMap({
  pickup,
  dropoff,
  vehicles = [],
  activeVehiclePosition = null,
  selectionMode = null,
  onMapClick = null,
  className = 'h-[460px] w-full rounded-2xl',
}) {
  const defaultCenter = pickup?.coordinates || { lat: 40.7505, lng: -73.9934 };

  // Calculate route polyline waypoints if both pickup and dropoff exist
  const routePoints =
    pickup?.coordinates && dropoff?.coordinates
      ? generateRouteWaypoints(pickup.coordinates, dropoff.coordinates)
      : [];

  // Compile bounds coordinates
  const boundsPoints = [];
  if (pickup?.coordinates) boundsPoints.push([pickup.coordinates.lat, pickup.coordinates.lng]);
  if (dropoff?.coordinates) boundsPoints.push([dropoff.coordinates.lat, dropoff.coordinates.lng]);
  if (activeVehiclePosition) boundsPoints.push([activeVehiclePosition.lat, activeVehiclePosition.lng]);

  // Icons
  const pickupIcon = createHtmlIcon(`
    <div class="relative flex items-center justify-center">
      <div class="radar-pulse bg-emerald-500 opacity-40"></div>
      <div class="custom-pin-bubble bg-emerald-600 text-white w-9 h-9 border-2 border-white shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `);

  const dropoffIcon = createHtmlIcon(`
    <div class="custom-pin-bubble bg-rose-600 text-white w-9 h-9 border-2 border-white shadow-xl">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
    </div>
  `);

  const movingCarIcon = createHtmlIcon(`
    <div class="custom-pin-bubble bg-blue-600 text-white w-10 h-10 border-2 border-white shadow-2xl ring-4 ring-blue-400/40 animate-bounce">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
    </div>
  `, [40, 40]);

  return (
    <div className={`relative overflow-hidden border border-slate-200/80 shadow-inner ${className}`}>
      {/* Map selection banner indicator */}
      {selectionMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-slate-700/60 flex items-center gap-2 animate-pulse">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          Click anywhere on the map to set {selectionMode === 'pickup' ? 'Pickup Location' : 'Destination'}
        </div>
      )}

      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} selectionMode={selectionMode} />
        {boundsPoints.length > 1 && <AutoFitBounds bounds={boundsPoints} />}

        {/* Route Polyline */}
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color="#2563eb"
            weight={5}
            opacity={0.8}
            dashArray={activeVehiclePosition ? '8, 8' : undefined}
          />
        )}

        {/* Pickup Pin */}
        {pickup?.coordinates && (
          <Marker position={[pickup.coordinates.lat, pickup.coordinates.lng]} icon={pickupIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-bold text-emerald-700 block">Pickup Location</span>
                <span className="text-slate-600">{pickup.name || pickup.address}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Pin */}
        {dropoff?.coordinates && (
          <Marker position={[dropoff.coordinates.lat, dropoff.coordinates.lng]} icon={dropoffIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-bold text-rose-700 block">Destination</span>
                <span className="text-slate-600">{dropoff.name || dropoff.address}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active In-Transit Vehicle Pin */}
        {activeVehiclePosition && (
          <Marker
            position={[activeVehiclePosition.lat, activeVehiclePosition.lng]}
            icon={movingCarIcon}
          >
            <Popup>
              <div className="p-1 text-xs font-semibold text-blue-600">
                Driver en route
              </div>
            </Popup>
          </Marker>
        )}

        {/* Available Nearby Vehicles Pins */}
        {!activeVehiclePosition &&
          vehicles.map((v) => {
            const coords = v.currentCoordinates;
            if (!coords || !coords.lat || !coords.lng) return null;

            const brandColor = v.provider?.brandColor || '#3b82f6';
            const vehicleIcon = createHtmlIcon(`
              <div class="custom-pin-bubble w-7 h-7 border-2 border-white shadow-md text-white" style="background-color: ${brandColor}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
              </div>
            `, [28, 28]);

            return (
              <Marker key={v.vehicleId || v._id} position={[coords.lat, coords.lng]} icon={vehicleIcon}>
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5" style={{ color: brandColor }}>
                      <span>{v.provider?.displayName || v.provider?.name || 'Provider'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {v.vehicleType}
                      </span>
                    </div>
                    <div className="text-slate-800 font-medium">{v.vehicleModel || v.model}</div>
                    <div className="text-slate-500 text-[11px]">
                      Driver: {v.driver?.name || v.driverName} ({v.driver?.rating || v.driverRating}★)
                    </div>
                    {v.fare && (
                      <div className="text-emerald-700 font-bold text-xs pt-1 border-t border-slate-100">
                        ${v.fare.totalFare} estimated
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
