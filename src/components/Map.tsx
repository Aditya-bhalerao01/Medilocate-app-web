import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Facility } from '../types';
import L from 'leaflet';

const nearbyIcon = new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `
    <div class="relative flex h-8 w-8 items-center justify-center -ml-2 -mt-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-md"></span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface MapProps {
  facilities: Facility[];
  userLocation: { lat: number; lon: number };
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function Map({ facilities, userLocation }: MapProps) {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lon]}
      zoom={13}
      scrollWheelZoom={true}
      className="w-full flex-1 rounded-xl shadow-md z-0"
      style={{ height: '100%', minHeight: '400px' }}
    >
      <ChangeView center={[userLocation.lat, userLocation.lon]} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User Location Marker */}
      <Marker position={[userLocation.lat, userLocation.lon]}>
        <Popup>
          <div className="font-semibold text-blue-600">You are here</div>
        </Popup>
      </Marker>

      {/* Facility Markers */}
      {facilities.map((facility) => {
        const isNearby = facility.distance <= 1;
        return (
          <Marker 
            key={facility.id} 
            position={[facility.lat, facility.lon]}
            icon={isNearby ? nearbyIcon : undefined}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-900">{facility.name}</span>
                <span className="text-xs text-gray-500 capitalize">{facility.amenity}</span>
                <span className={`text-xs font-medium ${isNearby ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {facility.distance.toFixed(2)} km away {isNearby && '(Nearby)'}
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-center bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 transition"
                >
                  Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
