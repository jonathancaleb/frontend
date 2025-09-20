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