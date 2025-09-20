// Local storage utilities for trip management

const STORAGE_KEYS = {
  RECENT_TRIPS: 'eld_recent_trips',
  LAST_VIEWED_TRIP: 'eld_last_viewed_trip',
  USER_PREFERENCES: 'eld_user_preferences'
} as const;

export interface RecentTrip {
  id: string;
  driver_name: string;
  truck_number: string;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  created_at: string;
  last_viewed: string;
}

export interface UserPreferences {
  defaultCarrier?: string;
  recentDriverNames?: string[];
  recentTruckNumbers?: string[];
}

// Recent trips management
export const saveRecentTrip = (trip: RecentTrip): void => {
  try {
    const recent = getRecentTrips();
    const updated = [
      { ...trip, last_viewed: new Date().toISOString() },
      ...recent.filter(t => t.id !== trip.id)
    ].slice(0, 10); // Keep only 10 most recent
    
    localStorage.setItem(STORAGE_KEYS.RECENT_TRIPS, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save recent trip:', error);
  }
};

export const getRecentTrips = (): RecentTrip[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_TRIPS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load recent trips:', error);
    return [];
  }
};

export const removeRecentTrip = (tripId: string): void => {
  try {
    const recent = getRecentTrips();
    const updated = recent.filter(t => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.RECENT_TRIPS, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to remove recent trip:', error);
  }
};

// Last viewed trip
export const saveLastViewedTrip = (tripId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_VIEWED_TRIP, tripId);
  } catch (error) {
    console.warn('Failed to save last viewed trip:', error);
  }
};

export const getLastViewedTrip = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_VIEWED_TRIP);
  } catch (error) {
    console.warn('Failed to load last viewed trip:', error);
    return null;
  }
};

// User preferences
export const saveUserPreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save user preferences:', error);
  }
};

export const getUserPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load user preferences:', error);
    return {};
  }
};

export const addToRecentValues = (type: 'drivers' | 'trucks' | 'carriers', value: string): void => {
  try {
    const preferences = getUserPreferences();
    
    switch (type) {
      case 'drivers':
        preferences.recentDriverNames = [
          value,
          ...(preferences.recentDriverNames || []).filter(name => name !== value)
        ].slice(0, 5);
        break;
      case 'trucks':
        preferences.recentTruckNumbers = [
          value,
          ...(preferences.recentTruckNumbers || []).filter(truck => truck !== value)
        ].slice(0, 5);
        break;
      case 'carriers':
        preferences.defaultCarrier = value;
        break;
    }
    
    saveUserPreferences(preferences);
  } catch (error) {
    console.warn('Failed to add recent value:', error);
  }
};

// Clear all data
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear data:', error);
  }
};

// Convert Trip to RecentTrip
export const tripToRecentTrip = (trip: any): RecentTrip => ({
  id: trip.id,
  driver_name: trip.driver_name,
  truck_number: trip.truck_number,
  current_location: trip.current_location,
  pickup_location: trip.pickup_location,
  dropoff_location: trip.dropoff_location,
  created_at: trip.created_at,
  last_viewed: new Date().toISOString()
});