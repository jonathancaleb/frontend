import React, { useState, useEffect } from 'react';
import { tripApi } from '../services/api';
import { Trip } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface TripsListProps {
  onSelectTrip: (trip: Trip) => void;
  onCreateNew: () => void;
}

const TripsList: React.FC<TripsListProps> = ({ onSelectTrip, onCreateNew }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const tripsData = await tripApi.listTrips();
      setTrips(tripsData);
    } catch (err: any) {
      console.error('Failed to load trips:', err);
      setError(err.userMessage || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalDistance = (trip: Trip) => {
    return trip.route_segments.reduce((total, segment) => total + segment.distance_miles, 0);
  };

  const calculateTotalDuration = (trip: Trip) => {
    return trip.route_segments.reduce((total, segment) => total + segment.duration_hours, 0);
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading trips..." className="py-12" />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-medium">Error Loading Trips</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={loadTrips}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Trips</h2>
          <p className="text-gray-600 mt-1">
            {trips.length === 0 ? 'No trips found' : `${trips.length} trip${trips.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create New Trip
        </button>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No trips yet</h3>
            <p className="mt-2 text-gray-500">Get started by creating your first trip plan.</p>
            <button
              onClick={onCreateNew}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create First Trip
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectTrip(trip)}
            >
              <div className="p-6">
                {/* Trip Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {trip.driver_name}
                    </h3>
                    <p className="text-sm text-gray-500">{trip.truck_number}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>

                {/* Route Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-600 truncate">{trip.current_location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-gray-600 truncate">{trip.pickup_location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600 truncate">{trip.dropoff_location}</span>
                  </div>
                </div>

                {/* Trip Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Distance</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {calculateTotalDistance(trip).toFixed(0)} mi
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {calculateTotalDuration(trip).toFixed(1)} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cycle Hours</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {trip.current_cycle_hours} / 70
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Days</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {trip.daily_logs.length}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <p className="text-xs text-gray-500">
                  Created {formatDate(trip.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsList;