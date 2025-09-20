// API Response types (match exact API response format)
export interface TripApiResponse {
  id: string;
  current_location: string;
  current_lat: string;  // API returns as string
  current_lng: string;  // API returns as string
  pickup_location: string;
  pickup_lat: string;   // API returns as string
  pickup_lng: string;   // API returns as string
  dropoff_location: string;
  dropoff_lat: string;  // API returns as string
  dropoff_lng: string;  // API returns as string
  current_cycle_hours: string;  // API returns as string
  driver_name: string;
  carrier_name: string;
  truck_number: string;
  created_at: string;
  route_segments: RouteSegmentApiResponse[];
  daily_logs: DailyLogApiResponse[];
}

export interface RouteSegmentApiResponse {
  id: number;
  start_location: string;
  end_location: string;
  distance_miles: string;  // API returns as string
  duration_hours: string;  // API returns as string
  segment_type: 'driving' | 'rest' | 'fuel' | 'pickup' | 'dropoff' | 'break';
  order: number;
}

export interface DailyLogApiResponse {
  id: number;
  date: string;
  total_miles: string;           // API returns as string
  total_hours_off_duty: string;  // API returns as string
  total_hours_sleeper: string;   // API returns as string
  total_hours_driving: string;   // API returns as string
  total_hours_on_duty: string;   // API returns as string
  log_entries: LogEntryApiResponse[];
}

export interface LogEntryApiResponse {
  id: number;
  start_time: string;
  end_time: string;
  duty_status: 'off_duty' | 'sleeper_berth' | 'driving' | 'on_duty_not_driving';
  location: string;
  remarks: string;
}

// Frontend types (parsed numbers for easier use)
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

// Type conversion utilities
export const convertApiResponseToTrip = (apiResponse: TripApiResponse): Trip => ({
  ...apiResponse,
  current_lat: parseFloat(apiResponse.current_lat),
  current_lng: parseFloat(apiResponse.current_lng),
  pickup_lat: parseFloat(apiResponse.pickup_lat),
  pickup_lng: parseFloat(apiResponse.pickup_lng),
  dropoff_lat: parseFloat(apiResponse.dropoff_lat),
  dropoff_lng: parseFloat(apiResponse.dropoff_lng),
  current_cycle_hours: parseFloat(apiResponse.current_cycle_hours),
  route_segments: apiResponse.route_segments.map(segment => ({
    ...segment,
    distance_miles: parseFloat(segment.distance_miles),
    duration_hours: parseFloat(segment.duration_hours),
  })),
  daily_logs: apiResponse.daily_logs.map(log => ({
    ...log,
    total_miles: parseFloat(log.total_miles),
    total_hours_off_duty: parseFloat(log.total_hours_off_duty),
    total_hours_sleeper: parseFloat(log.total_hours_sleeper),
    total_hours_driving: parseFloat(log.total_hours_driving),
    total_hours_on_duty: parseFloat(log.total_hours_on_duty),
    log_entries: log.log_entries, // No conversion needed for log entries
  })),
});

// Location search result type for geocoding
export interface LocationSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  importance: number;
}