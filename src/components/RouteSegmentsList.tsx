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