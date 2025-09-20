import React, { useState } from 'react';
import { TripFormData } from '../types';
import { geocodeApi } from '../services/api';
import { formatTripFormData, roundCoordinate } from '../utils/validation';
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
    
    // Format coordinates to ensure they have max 6 decimal places
    const formattedData = formatTripFormData(formData);
    onSubmit(formattedData);
  };

  const handleLocationSelect = (field: 'current' | 'pickup' | 'dropoff', location: any) => {
    // Round coordinates to 6 decimal places to match API requirements
    const lat = roundCoordinate(parseFloat(location.lat));
    const lng = roundCoordinate(parseFloat(location.lon));
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
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Location coordinates</strong> are automatically rounded to 6 decimal places for API compatibility.
                </p>
              </div>
            </div>
          </div>
          
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