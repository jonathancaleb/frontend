export default DailyLogSheet;

// src/components/RouteSegmentsList.tsx
import React from 'react';
import { RouteSegment } from '../types';

interface RouteSegmentsListProps {
  segments: RouteSegment[];
}

const RouteSegmentsList: React.FC<RouteSegmentsListProps> = ({ segments }) => {
  const getSegmentIcon = (type: string) => {
    switch (type) {
      case 'driving': return '🚛';
      case 'rest': return '🛌';
      case 'fuel': return '⛽';
      case 'pickup': return '📦';
      case 'dropoff': return '🏭';
      case 'break': return '☕';
      default: return '📍';
    }
  };

  const getSegmentColor = (type: string) => {
    switch (type) {
      case 'driving': return 'bg-green-100 border-green-300';
      case 'rest': return 'bg-purple-100 border-purple-300';
      case 'fuel': return 'bg-orange-100 border-orange-300';
      case 'pickup': return 'bg-blue-100 border-blue-300';
      case 'dropoff': return 'bg-red-100 border-red-300';
      case 'break': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (wholeHours === 0) return `${minutes}m`;
    if (minutes === 0) return `${wholeHours}h`;
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Route Segments</h3>
      
      <div className="space-y-3">
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className={`p-4 rounded-lg border-2 ${getSegmentColor(segment.segment_type)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getSegmentIcon(segment.segment_type)}</span>
                <div>
                  <h4 className="font-semibold text-gray-800 capitalize">
                    {segment.segment_type.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {segment.start_location}
                    {segment.start_location !== segment.end_location && 
                      ` → ${segment.end_location}`
                    }
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  {formatDuration(segment.duration_hours)}
                </div>
                {segment.distance_miles > 0 && (
                  <div className="text-sm text-gray-600">
                    {segment.distance_miles.toFixed(0)} mi
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteSegmentsList;

// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import DailyLogSheet from './components/DailyLogSheet';
import RouteSegmentsList from './components/RouteSegmentsList';
import { tripApi } from './services/api';
import { Trip, TripFormData } from './types';
import './App.css';

const App: React.FC = () => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTripSubmit = async (data: TripFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const trip = await tripApi.createTrip(data);
      setCurrentTrip(trip);
    } catch (err: any) {
      console.error('Trip creation error:', err);
      setError(err.response?.data?.error || 'Failed to create trip plan');
    } finally {
      setLoading(false);
    }
  };

  const resetTrip = () => {
    setCurrentTrip(null);
    setError(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">ELD Route Planner & Log Generator</h1>
              {currentTrip && (
                <button
                  onClick={resetTrip}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg font-medium transition-colors"
                >
                  Plan New Trip
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              <h3 className="font-semibold">Error:</h3>
              <p>{error}</p>
            </div>
          )}

          {!currentTrip ? (
            <TripForm onSubmit={handleTripSubmit} loading={loading} />
          ) : (
            <Routes>
              <Route path="/" element={<TripDashboard trip={currentTrip} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-300">
              ELD Route Planner - Compliant with FMCSA Hours of Service Regulations
            </p>
            <p className="text-sm text-gray-400 mt-2">
              For educational and planning purposes. Always verify compliance with current regulations.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

interface TripDashboardProps {
  trip: Trip;
}

const TripDashboard: React.FC<TripDashboardProps> = ({ trip }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'segments' | 'logs'>('overview');

  const tabs = [
    { id: 'overview', label: 'Route Overview' },
    { id: 'segments', label: 'Route Segments' },
    { id: 'logs', label: 'Daily Logs' }
  ];

  return (
    <div className="space-y-6">
      {/* Trip Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Trip Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Driver:</span> {trip.driver_name}</p>
              <p><span className="font-medium">Carrier:</span> {trip.carrier_name}</p>
              <p><span className="font-medium">Truck:</span> {trip.truck_number}</p>
              <p><span className="font-medium">Cycle Hours:</span> {trip.current_cycle_hours}hrs</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Route</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">From:</span> {trip.current_location}</p>
              <p><span className="font-medium">Pickup:</span> {trip.pickup_location}</p>
              <p><span className="font-medium">Delivery:</span> {trip.dropoff_location}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Total Days:</span> {trip.daily_logs.length}</p>
              <p><span className="font-medium">Segments:</span> {trip.route_segments.length}</p>
              <p><span className="font-medium">Created:</span> {new Date(trip.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <RouteMap trip={trip} />}
          {activeTab === 'segments' && <RouteSegmentsList segments={trip.route_segments} />}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {trip.daily_logs.map((log) => (
                <DailyLogSheet
                  key={log.id}
                  dailyLog={log}
                  driverName={trip.driver_name}
                  carrierName={trip.carrier_name}
                  truckNumber={trip.truck_number}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

// src/App.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

.leaflet-container {
  height: 500px;
  width: 100%;
}

// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// .env
REACT_APP_API_URL=http://localhost:8000/api

// public/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="ELD Route Planner and Log Generator - FMCSA Compliant Hours of Service Planning"
    />
    <title>ELD Route Planner</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>// package.json
{
  "name": "eld-route-planner-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@types/leaflet": "^1.9.8",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "axios": "^1.6.2",
    "leaflet": "^1.9.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.20.1",
    "react-scripts": "5.0.1",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@types/jest": "^29.5.8",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}

// src/types/index.ts
export interface Trip {
  id: string;
  current_location: string;
  current_lat: number;
  current_lng: number;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_location: string;
  dropoff_lat: number;
  dropoff_lng: number;
  current_cycle_hours: number;
  driver_name: string;
  carrier_name: string;
  truck_number: string;
  created_at: string;
  route_segments: RouteSegment[];
  daily_logs: DailyLog[];
}

export interface RouteSegment {
  id: number;
  start_location: string;
  end_location: string;
  distance_miles: number;
  duration_hours: number;
  segment_type: 'driving' | 'rest' | 'fuel' | 'pickup' | 'dropoff' | 'break';
  order: number;
}

export interface DailyLog {
  id: number;
  date: string;
  total_miles: number;
  total_hours_off_duty: number;
  total_hours_sleeper: number;
  total_hours_driving: number;
  total_hours_on_duty: number;
  log_entries: LogEntry[];
}

export interface LogEntry {
  id: number;
  start_time: string;
  end_time: string;
  duty_status: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty_not_driving';
  location: string;
  remarks: string;
}

export interface TripFormData {
  current_location: string;
  current_lat: number;
  current_lng: number;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_location: string;
  dropoff_lat: number;
  dropoff_lng: number;
  current_cycle_hours: number;
  driver_name: string;
  carrier_name: string;
  truck_number: string;
}

// src/services/api.ts
import axios from 'axios';
import { Trip, TripFormData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tripApi = {
  createTrip: async (data: TripFormData): Promise<Trip> => {
    const response = await api.post('/trips/create/', data);
    return response.data;
  },
  
  getTrip: async (tripId: string): Promise<Trip> => {
    const response = await api.get(`/trips/${tripId}/`);
    return response.data;
  },
  
  listTrips: async (): Promise<Trip[]> => {
    const response = await api.get('/trips/');
    return response.data;
  }
};

export const geocodeApi = {
  searchLocation: async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      return await response.json();
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }
};

// src/components/TripForm.tsx
import React, { useState } from 'react';
import { TripFormData } from '../types';
import { geocodeApi } from '../services/api';
import LocationInput from './LocationInput';

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
  loading: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<TripFormData>({
    current_location: '',
    current_lat: 0,
    current_lng: 0,
    pickup_location: '',
    pickup_lat: 0,
    pickup_lng: 0,
    dropoff_location: '',
    dropoff_lat: 0,
    dropoff_lng: 0,
    current_cycle_hours: 0,
    driver_name: '',
    carrier_name: '',
    truck_number: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.driver_name.trim()) newErrors.driver_name = 'Driver name is required';
    if (!formData.carrier_name.trim()) newErrors.carrier_name = 'Carrier name is required';
    if (!formData.truck_number.trim()) newErrors.truck_number = 'Truck number is required';
    if (!formData.current_location.trim()) newErrors.current_location = 'Current location is required';
    if (!formData.pickup_location.trim()) newErrors.pickup_location = 'Pickup location is required';
    if (!formData.dropoff_location.trim()) newErrors.dropoff_location = 'Drop-off location is required';
    if (formData.current_cycle_hours < 0 || formData.current_cycle_hours > 70) {
      newErrors.current_cycle_hours = 'Cycle hours must be between 0 and 70';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  const handleLocationSelect = (field: 'current' | 'pickup' | 'dropoff', location: any) => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lon);
    const name = location.display_name;

    setFormData(prev => ({
      ...prev,
      [`${field}_location`]: name,
      [`${field}_lat`]: lat,
      [`${field}_lng`]: lng,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan Your Trip</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name *
            </label>
            <input
              type="text"
              value={formData.driver_name}
              onChange={(e) => setFormData(prev => ({ ...prev, driver_name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.driver_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter driver name"
            />
            {errors.driver_name && <p className="text-red-500 text-sm mt-1">{errors.driver_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carrier Name *
            </label>
            <input
              type="text"
              value={formData.carrier_name}
              onChange={(e) => setFormData(prev => ({ ...prev, carrier_name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.carrier_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter carrier name"
            />
            {errors.carrier_name && <p className="text-red-500 text-sm mt-1">{errors.carrier_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Truck Number *
            </label>
            <input
              type="text"
              value={formData.truck_number}
              onChange={(e) => setFormData(prev => ({ ...prev, truck_number: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.truck_number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter truck number"
            />
            {errors.truck_number && <p className="text-red-500 text-sm mt-1">{errors.truck_number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Cycle Hours Used *
            </label>
            <input
              type="number"
              min="0"
              max="70"
              step="0.1"
              value={formData.current_cycle_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, current_cycle_hours: parseFloat(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.current_cycle_hours ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.0"
            />
            {errors.current_cycle_hours && <p className="text-red-500 text-sm mt-1">{errors.current_cycle_hours}</p>}
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-4">
          <LocationInput
            label="Current Location *"
            value={formData.current_location}
            onLocationSelect={(location) => handleLocationSelect('current', location)}
            error={errors.current_location}
          />

          <LocationInput
            label="Pickup Location *"
            value={formData.pickup_location}
            onLocationSelect={(location) => handleLocationSelect('pickup', location)}
            error={errors.pickup_location}
          />

          <LocationInput
            label="Drop-off Location *"
            value={formData.dropoff_location}
            onLocationSelect={(location) => handleLocationSelect('dropoff', location)}
            error={errors.dropoff_location}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {loading ? 'Planning Route...' : 'Plan Route & Generate Logs'}
        </button>
      </form>
    </div>
  );
};

export default TripForm;

// src/components/LocationInput.tsx
import React, { useState, useEffect } from 'react';
import { geocodeApi } from '../services/api';

interface LocationInputProps {
  label: string;
  value: string;
  onLocationSelect: (location: any) => void;
  error?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ label, value, onLocationSelect, error }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length > 2) {
      setLoading(true);
      try {
        const results = await geocodeApi.searchLocation(newQuery);
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
      }
      setLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    onLocationSelect(suggestion);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Enter address or city"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="text-sm text-gray-800">{suggestion.display_name}</div>
            </div>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="absolute right-3 top-9 text-gray-400">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default LocationInput;

// src/components/RouteMap.tsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Trip } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface RouteMapProps {
  trip: Trip;
}

const RouteMap: React.FC<RouteMapProps> = ({ trip }) => {
  const markers = [
    {
      position: [trip.current_lat, trip.current_lng],
      label: 'Current Location',
      location: trip.current_location,
      color: 'blue'
    },
    {
      position: [trip.pickup_lat, trip.pickup_lng],
      label: 'Pickup Location',
      location: trip.pickup_location,
      color: 'green'
    },
    {
      position: [trip.dropoff_lat, trip.dropoff_lng],
      label: 'Drop-off Location',
      location: trip.dropoff_location,
      color: 'red'
    }
  ];

  // Create route line
  const routeCoordinates: [number, number][] = [
    [trip.current_lat, trip.current_lng],
    [trip.pickup_lat, trip.pickup_lng],
    [trip.dropoff_lat, trip.dropoff_lng]
  ];

  // Calculate map bounds
  const bounds = L.latLngBounds(routeCoordinates);

  // Create segment markers for rest stops, fuel stops, etc.
  const segmentMarkers = trip.route_segments
    .filter(segment => ['rest', 'fuel', 'break'].includes(segment.segment_type))
    .map((segment, index) => ({
      position: [
        trip.current_lat + (index * 0.1), // Simple positioning - would need real coordinates
        trip.current_lng + (index * 0.1)
      ] as [number, number],
      label: segment.segment_type.charAt(0).toUpperCase() + segment.segment_type.slice(1),
      location: segment.start_location,
      color: segment.segment_type === 'fuel' ? 'orange' : 'purple'
    }));

  const getMarkerIcon = (color: string) => {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Route Map</h3>
      
      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer
          bounds={bounds}
          className="h-full w-full rounded-lg"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Main route markers */}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={marker.position as [number, number]}
              icon={getMarkerIcon(marker.color)}
            >
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold">{marker.label}</h4>
                  <p className="text-sm text-gray-600">{marker.location}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Segment markers (rest stops, fuel stops) */}
          {segmentMarkers.map((marker, index) => (
            <Marker
              key={`segment-${index}`}
              position={marker.position}
              icon={getMarkerIcon(marker.color)}
            >
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold">{marker.label}</h4>
                  <p className="text-sm text-gray-600">{marker.location}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Route line */}
          <Polyline
            positions={routeCoordinates}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        </MapContainer>
      </div>
      
      {/* Route Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-blue-600">
            {trip.route_segments.reduce((total, segment) => total + parseFloat(segment.distance_miles.toString()), 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">Total Miles</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-green-600">
            {trip.route_segments.reduce((total, segment) => total + parseFloat(segment.duration_hours.toString()), 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Total Hours</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-orange-600">
            {trip.route_segments.filter(s => s.segment_type === 'fuel').length}
          </div>
          <div className="text-sm text-gray-600">Fuel Stops</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-purple-600">
            {trip.route_segments.filter(s => s.segment_type === 'rest').length}
          </div>
          <div className="text-sm text-gray-600">Rest Periods</div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;

// src/components/DailyLogSheet.tsx
import React from 'react';
import { DailyLog } from '../types';

interface DailyLogSheetProps {
  dailyLog: DailyLog;
  driverName: string;
  carrierName: string;
  truckNumber: string;
}

const DailyLogSheet: React.FC<DailyLogSheetProps> = ({ 
  dailyLog, 
  driverName, 
  carrierName, 
  truckNumber 
}) => {
  const formatTime = (timeStr: string) => {
    const time = new Date(`1970-01-01T${timeStr}`);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const getDutyStatusLabel = (status: string) => {
    switch (status) {
      case 'off_duty': return 'Off Duty';
      case 'sleeper_berth': return 'Sleeper Berth';
      case 'driving': return 'Driving';
      case 'on_duty_not_driving': return 'On Duty (Not Driving)';
      default: return status;
    }
  };

  const getDutyStatusColor = (status: string) => {
    switch (status) {
      case 'off_duty': return 'bg-gray-200';
      case 'sleeper_berth': return 'bg-blue-200';
      case 'driving': return 'bg-green-200';
      case 'on_duty_not_driving': return 'bg-yellow-200';
      default: return 'bg-gray-200';
    }
  };

  // Create 24-hour grid
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Convert log entries to grid data
  const gridData = hours.map(hour => {
    const entry = dailyLog.log_entries.find(entry => {
      const startHour = parseInt(entry.start_time.split(':')[0]);
      const endHour = parseInt(entry.end_time.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
    return entry || null;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="border-2 border-black p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">U.S. DEPARTMENT OF TRANSPORTATION</h2>
          <h3 className="text-md font-semibold">DRIVER'S DAILY LOG</h3>
          <p className="text-sm">(ONE CALENDAR DAY — 24 HOURS)</p>
        </div>

        {/* Driver and Trip Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="mb-2">
              <span className="font-semibold">Date: </span>
              {new Date(dailyLog.date).toLocaleDateString()}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Name of Carrier: </span>
              {carrierName}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Driver's Name: </span>
              {driverName}
            </div>
            <div>
              <span className="font-semibold">Vehicle Number: </span>
              {truckNumber}
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-semibold">Total Miles: </span>
              {dailyLog.total_miles.toFixed(0)}
            </div>
            <div className="mb-2">
              <span className="font-semibold">24-Hour Period Starting: </span>
              00:00
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mb-4">
          <div className="border border-black">
            {/* Time headers */}
            <div className="flex">
              <div className="w-24 p-1 border-r border-black font-semibold text-xs">
                STATUS
              </div>
              {hours.map(hour => (
                <div key={hour} className="flex-1 p-1 border-r border-black text-center text-xs">
                  {hour === 0 ? 'Mid' : hour === 12 ? 'Noon' : hour}
                </div>
              ))}
              <div className="w-16 p-1 font-semibold text-xs text-center">
                TOTAL<br/>HOURS
              </div>
            </div>

            {/* Off Duty Row */}
            <div className="flex border-t border-black">
              <div className="w-24 p-2 border-r border-black text-xs font-semibold">
                Off Duty
              </div>
              {hours.map(hour => (
                <div key={hour} className={`flex-1 p-1 border-r border-black h-8 ${
                  gridData[hour]?.duty_status === 'off_duty' ? 'bg-gray-400' : ''
                }`}>
                </div>
              ))}
              <div className="w-16 p-2 border-l border-black text-xs text-center">
                {dailyLog.total_hours_off_duty.toFixed(1)}
              </div>
            </div>

            {/* Sleeper Berth Row */}
            <div className="flex border-t border-black">
              <div className="w-24 p-2 border-r border-black text-xs font-semibold">
                Sleeper Berth
              </div>
              {hours.map(hour => (
                <div key={hour} className={`flex-1 p-1 border-r border-black h-8 ${
                  gridData[hour]?.duty_status === 'sleeper_berth' ? 'bg-blue-400' : ''
                }`}>
                </div>
              ))}
              <div className="w-16 p-2 border-l border-black text-xs text-center">
                {dailyLog.total_hours_sleeper.toFixed(1)}
              </div>
            </div>

            {/* Driving Row */}
            <div className="flex border-t border-black">
              <div className="w-24 p-2 border-r border-black text-xs font-semibold">
                Driving
              </div>
              {hours.map(hour => (
                <div key={hour} className={`flex-1 p-1 border-r border-black h-8 ${
                  gridData[hour]?.duty_status === 'driving' ? 'bg-green-400' : ''
                }`}>
                </div>
              ))}
              <div className="w-16 p-2 border-l border-black text-xs text-center">
                {dailyLog.total_hours_driving.toFixed(1)}
              </div>
            </div>

            {/* On Duty (Not Driving) Row */}
            <div className="flex border-t border-black">
              <div className="w-24 p-2 border-r border-black text-xs font-semibold">
                On Duty<br/>(Not Driving)
              </div>
              {hours.map(hour => (
                <div key={hour} className={`flex-1 p-1 border-r border-black h-8 ${
                  gridData[hour]?.duty_status === 'on_duty_not_driving' ? 'bg-yellow-400' : ''
                }`}>
                </div>
              ))}
              <div className="w-16 p-2 border-l border-black text-xs text-center">
                {dailyLog.total_hours_on_duty.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="mb-4">
          <div className="font-semibold text-sm mb-2">REMARKS:</div>
          <div className="border border-black p-2 min-h-[100px] text-xs">
            {dailyLog.log_entries.map((entry, index) => (
              <div key={index} className="mb-1">
                {formatTime(entry.start_time)} - {getDutyStatusLabel(entry.duty_status)} - {entry.location}
                {entry.remarks && ` (${entry.remarks})`}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-between text-sm">
          <div>
            <div className="font-semibold">Total Hours: 24</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">Driver's Signature: ____________________</div>
            <div className="text-xs mt-1">I certify that these entries are true and correct</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLogSheet;