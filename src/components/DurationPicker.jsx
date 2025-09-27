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
  
  // Generate hour options (0-24)
  const hourOptions = Array.from({ length: 25 }, (_, i) => (
    <option key={i} value={i}>{i}</option>
  ));
  
  // Generate minute options (0-59, step by 5)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => {
    const min = i * 5;
    return <option key={min} value={min}>{min}</option>;
  });
  
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <select
            id={`${id}-hours`}
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-8"
          >
            {hourOptions}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500 text-xs">
            {t('time_entry.custom_shift.hours')}
          </div>
        </div>
        <div className="flex-1 relative">
          <select
            id={`${id}-minutes`}
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-8"
          >
            {minuteOptions}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500 text-xs">
            {t('time_entry.custom_shift.minutes')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DurationPicker;