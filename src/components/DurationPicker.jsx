import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DurationPicker = ({ value, onChange, id, label, className = "" }) => {
  const { t } = useTranslation();
  
  // Parse initial value (e.g., "8h", "480m", "1h30m")
  const parseDuration = (durationStr) => {
    if (!durationStr) return { hours: 0, minutes: 0 };
    
    // Match patterns like "8h", "30m", "1h30m"
    const hoursMatch = durationStr.match(/(\d+)h/);
    const minutesMatch = durationStr.match(/(\d+)m/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return { hours, minutes };
  };
  
  const [hours, setHours] = useState(parseDuration(value).hours);
  const [minutes, setMinutes] = useState(parseDuration(value).minutes);
  
  // Update parent component when hours or minutes change
  useEffect(() => {
    // Format the duration string
    let durationStr = "";
    if (hours > 0) durationStr += `${hours}h`;
    if (minutes > 0) durationStr += `${minutes}m`;
    
    // If both are zero, keep empty string
    if (hours === 0 && minutes === 0) durationStr = "";
    
    onChange(durationStr);
  }, [hours, minutes]);
  
  // Handle changes from parent
  useEffect(() => {
    const parsed = parseDuration(value);
    setHours(parsed.hours);
    setMinutes(parsed.minutes);
  }, [value]);
  
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="flex space-x-2">
        <div className="flex-1">
          <label className="block text-gray-700 text-xs mb-1" htmlFor={`${id}-hours`}>
            {t('time_entry.custom_shift.hours')}
          </label>
          <input
            type="number"
            id={`${id}-hours`}
            min="0"
            max="24"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 text-xs mb-1" htmlFor={`${id}-minutes`}>
            {t('time_entry.custom_shift.minutes')}
          </label>
          <input
            type="number"
            id={`${id}-minutes`}
            min="0"
            max="59"
            step="5"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>
    </div>
  );
};

export default DurationPicker;