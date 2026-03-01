import React, { useState, useEffect, useMemo } from 'react';
import { fetchNearbyFacilities } from './api';
import { Facility } from './types';
import Map from './components/Map';
import List from './components/List';
import { Search, Map as MapIcon, List as ListIcon, Activity, Filter, Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('distance-asc');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    let isResolved = false;

    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        setLocationError('Location request timed out. Please check your permissions.');
        setLoading(false);
      }
    }, 8000);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lon: longitude });
          }
        },
        (error) => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeoutId);
            setLocationError('Unable to retrieve your location. Please allow location access.');
            setLoading(false);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (err) {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        setLocationError('Geolocation access denied or unavailable.');
        setLoading(false);
      }
    }

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (userLocation) {
      setLoading(true);
      fetchNearbyFacilities(userLocation.lat, userLocation.lon, 5)
        .then((data) => {
          setFacilities(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLocationError('Failed to fetch nearby facilities.');
          setLoading(false);
        });
    }
  }, [userLocation]);

  const filteredFacilities = useMemo(() => {
    let result = facilities.filter((facility) => {
      const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            facility.amenity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOpenNow = filterOpenNow ? facility.openNow : true;
      const matchesEmergency = filterEmergency ? facility.emergency : true;
      const matchesType = filterType === 'all' ? true : facility.amenity === filterType;
      
      return matchesSearch && matchesOpenNow && matchesEmergency && matchesType;
    });

    result.sort((a, b) => {
      if (sortBy === 'distance-asc') return a.distance - b.distance;
      if (sortBy === 'distance-desc') return b.distance - a.distance;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [facilities, searchQuery, filterOpenNow, filterEmergency, filterType, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Activity className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight">MediLocate</h1>
          </div>
          
          {/* View Toggle (Desktop) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <MapIcon className="w-4 h-4" />
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ListIcon className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 gap-6">
        
        {/* Search & Filters */}
        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search hospitals, clinics, medical, pharmacies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
            </div>
            
            {/* View Toggle (Mobile) */}
            <div className="flex sm:hidden w-full items-center justify-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('map')}
                className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <MapIcon className="w-4 h-4" />
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <ListIcon className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mr-2">
              <Filter className="w-4 h-4 text-slate-500" />
              Filters & Sort:
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block py-1.5 px-3 outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="hospital">Hospitals</option>
              <option value="clinic">Clinics</option>
              <option value="medical">Medical (Doctors)</option>
              <option value="pharmacy">Pharmacies</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block py-1.5 px-3 outline-none cursor-pointer"
            >
              <option value="distance-asc">Distance: Near to Far</option>
              <option value="distance-desc">Distance: Far to Near</option>
              <option value="rating-desc">Rating: High to Low</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={filterOpenNow}
                onChange={(e) => setFilterOpenNow(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">Open Now</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={filterEmergency}
                onChange={(e) => setFilterEmergency(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">Emergency</span>
            </label>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Locating nearby medical facilities...</p>
            </div>
          ) : locationError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white z-10">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Location Error</h2>
              <p className="text-slate-600 max-w-md">{locationError}</p>
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => {
                    setLocationError(null);
                    setUserLocation({ lat: 40.7128, lon: -74.0060 }); // Default to NYC
                  }} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Use Default Location
                </button>
              </div>
            </div>
          ) : userLocation ? (
            viewMode === 'map' ? (
              <Map facilities={filteredFacilities} userLocation={userLocation} />
            ) : (
              <List facilities={filteredFacilities} />
            )
          ) : null}
        </div>
      </main>
    </div>
  );
}
