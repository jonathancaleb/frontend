// Utility functions for data validation and formatting

/**
 * Rounds a coordinate to exactly 6 decimal places as required by the Django API
 */
export const roundCoordinate = (coord: number): number => {
  return Math.round(coord * 1000000) / 1000000;
};

/**
 * Validates and formats trip form data before API submission
 */
export const formatTripFormData = (data: any): any => {
  return {
    ...data,
    current_lat: roundCoordinate(data.current_lat),
    current_lng: roundCoordinate(data.current_lng),
    pickup_lat: roundCoordinate(data.pickup_lat),
    pickup_lng: roundCoordinate(data.pickup_lng),
    dropoff_lat: roundCoordinate(data.dropoff_lat),
    dropoff_lng: roundCoordinate(data.dropoff_lng),
    current_cycle_hours: Math.round(data.current_cycle_hours * 10) / 10, // Round to 1 decimal place
  };
};

/**
 * Validates coordinate precision
 */
export const validateCoordinate = (coord: number): boolean => {
  const coordStr = coord.toString();
  const decimalIndex = coordStr.indexOf('.');
  if (decimalIndex === -1) return true; // No decimal places
  return coordStr.length - decimalIndex - 1 <= 6; // Max 6 decimal places
};

/**
 * Validates all coordinates in trip form data
 */
export const validateTripCoordinates = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!validateCoordinate(data.current_lat)) {
    errors.push('Current location latitude has too many decimal places (max 6)');
  }
  if (!validateCoordinate(data.current_lng)) {
    errors.push('Current location longitude has too many decimal places (max 6)');
  }
  if (!validateCoordinate(data.pickup_lat)) {
    errors.push('Pickup location latitude has too many decimal places (max 6)');
  }
  if (!validateCoordinate(data.pickup_lng)) {
    errors.push('Pickup location longitude has too many decimal places (max 6)');
  }
  if (!validateCoordinate(data.dropoff_lat)) {
    errors.push('Dropoff location latitude has too many decimal places (max 6)');
  }
  if (!validateCoordinate(data.dropoff_lng)) {
    errors.push('Dropoff location longitude has too many decimal places (max 6)');
  }
  
  return errors;
};