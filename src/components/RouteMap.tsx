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