import React from 'react';
import { Facility } from '../types';
import { MapPin, Star, Navigation, Clock, AlertTriangle } from 'lucide-react';

interface FacilityCardProps {
  facility: Facility;
  key?: React.Key;
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  const isNearby = facility.distance <= 1;

  return (
    <div className={`p-4 rounded-xl shadow-sm border flex flex-col gap-3 hover:shadow-md transition-all relative overflow-hidden ${
      isNearby 
        ? 'bg-emerald-50/30 border-emerald-300 ring-1 ring-emerald-300/50' 
        : 'bg-white border-gray-100'
    }`}>
      {isNearby && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          &lt; 1km Away
        </div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">{facility.name}</h3>
          <p className="text-sm text-gray-500 capitalize mt-1">{facility.amenity}</p>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium">
          <Star className="w-4 h-4 fill-current" />
          {facility.rating}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-1">
        {facility.openNow && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Open Now
          </span>
        )}
        {facility.emergency && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Emergency Services
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{facility.distance.toFixed(2)} km</span>
        </div>
        
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </a>
      </div>
    </div>
  );
}
