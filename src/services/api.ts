import axios from 'axios';
import { Trip, TripFormData, TripApiResponse, convertApiResponseToTrip } from '../types';
import { formatTripFormData } from '../utils/validation';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 400 && data) {
        // Validation errors - convert to user-friendly format
        const validationErrors = Object.entries(data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        error.userMessage = `Validation errors:\n${validationErrors}`;
      } else if (status === 404) {
        error.userMessage = data?.error || 'Resource not found';
      } else if (status === 500) {
        error.userMessage = data?.error || 'Server error occurred. Please try again.';
      } else {
        error.userMessage = data?.error || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      // Network error
      error.userMessage = 'Unable to connect to server. Please check your connection and ensure the backend is running.';
    } else {
      error.userMessage = 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

export const tripApi = {
  createTrip: async (data: TripFormData): Promise<Trip> => {
    try {
      // Ensure coordinates are properly formatted before sending to API
      const formattedData = formatTripFormData(data);
      const response = await api.post<TripApiResponse>('/trips/create/', formattedData);
      return convertApiResponseToTrip(response.data);
    } catch (error: any) {
      console.error('Create trip error:', error);
      throw error;
    }
  },

  getTrip: async (tripId: string): Promise<Trip> => {
    try {
      const response = await api.get<TripApiResponse>(`/trips/${tripId}/`);
      return convertApiResponseToTrip(response.data);
    } catch (error: any) {
      console.error('Get trip error:', error);
      throw error;
    }
  },

  listTrips: async (): Promise<Trip[]> => {
    try {
      const response = await api.get<TripApiResponse[]>('/trips/');
      return response.data.map(convertApiResponseToTrip);
    } catch (error: any) {
      console.error('List trips error:', error);
      throw error;
    }
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