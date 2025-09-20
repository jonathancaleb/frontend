import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TripForm from './components/TripForm';
import TripsList from './components/TripsList';
import RouteMap from './components/RouteMap';
import DailyLogSheet from './components/DailyLogSheet';
import RouteSegmentsList from './components/RouteSegmentsList';
import SuccessMessage from './components/SuccessMessage';
import { tripApi } from './services/api';
import { 
  saveRecentTrip, 
  saveLastViewedTrip, 
  getLastViewedTrip, 
  tripToRecentTrip,
  addToRecentValues
} from './services/localStorage';
import { Trip, TripFormData } from './types';
import './App.css';

type AppView = 'list' | 'form' | 'trip';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('list');
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Try to load last viewed trip on app start
  useEffect(() => {
    const lastTripId = getLastViewedTrip();
    if (lastTripId) {
      loadTrip(lastTripId);
    }
  }, []);

  const loadTrip = async (tripId: string) => {
    try {
      const trip = await tripApi.getTrip(tripId);
      setCurrentTrip(trip);
      setCurrentView('trip');
      saveRecentTrip(tripToRecentTrip(trip));
      saveLastViewedTrip(trip.id);
    } catch (err: any) {
      console.error('Failed to load trip:', err);
      // If trip not found, just stay on list view
      setCurrentView('list');
    }
  };

  const handleTripSubmit = async (data: TripFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const trip = await tripApi.createTrip(data);
      setCurrentTrip(trip);
      setCurrentView('trip');
      setSuccess('Trip created successfully! Route planned and HOS logs generated.');
      
      // Save to local storage
      saveRecentTrip(tripToRecentTrip(trip));
      saveLastViewedTrip(trip.id);
      addToRecentValues('drivers', data.driver_name);
      addToRecentValues('trucks', data.truck_number);
      addToRecentValues('carriers', data.carrier_name);
    } catch (err: any) {
      console.error('Trip creation error:', err);
      // Use the enhanced error message from the API interceptor
      const errorMessage = err.userMessage || err.response?.data?.error || 'Failed to create trip plan';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (trip: Trip) => {
    setCurrentTrip(trip);
    setCurrentView('trip');
    setError(null);
    setSuccess(null);
    
    // Save to local storage
    saveRecentTrip(tripToRecentTrip(trip));
    saveLastViewedTrip(trip.id);
  };

  const handleCreateNew = () => {
    setCurrentView('form');
    setCurrentTrip(null);
    setError(null);
    setSuccess(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setCurrentTrip(null);
    setError(null);
    setSuccess(null);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'list':
        return 'ELD Trip Management';
      case 'form':
        return 'Create New Trip';
      case 'trip':
        return `Trip: ${currentTrip?.driver_name || 'Unknown'}`;
      default:
        return 'ELD Route Planner & Log Generator';
    }
  };

  const getHeaderButtons = () => {
    switch (currentView) {
      case 'list':
        return (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg font-medium transition-colors"
          >
            Create New Trip
          </button>
        );
      case 'form':
        return (
          <button
            onClick={handleBackToList}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-400 rounded-lg font-medium transition-colors"
          >
            Back to Trips
          </button>
        );
      case 'trip':
        return (
          <div className="flex space-x-3">
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg font-medium transition-colors"
            >
              Plan New Trip
            </button>
            <button
              onClick={handleBackToList}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-400 rounded-lg font-medium transition-colors"
            >
              All Trips
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{getHeaderTitle()}</h1>
              {getHeaderButtons()}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {success && (
            <SuccessMessage 
              message={success} 
              onDismiss={clearMessages}
              autoHide={true}
              duration={6000}
            />
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error.includes('\n') ? (
                      <div className="whitespace-pre-line">{error}</div>
                    ) : (
                      <p>{error}</p>
                    )}
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={clearMessages}
                    className="inline-flex bg-red-100 rounded-md p-1.5 text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render current view */}
          {currentView === 'list' && (
            <TripsList onSelectTrip={handleSelectTrip} onCreateNew={handleCreateNew} />
          )}
          
          {currentView === 'form' && (
            <TripForm onSubmit={handleTripSubmit} loading={loading} />
          )}
          
          {currentView === 'trip' && currentTrip && (
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