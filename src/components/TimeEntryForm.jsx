import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';

const TimeEntryForm = ({ onAddEntry }) => {
  const { t } = useTranslation();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [customDuration, setCustomDuration] = useState('');

  // Load custom shifts from localStorage
  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setShifts(savedShifts);
  }, []);

  const calculateDuration = (start, end, customDur) => {
    // If custom duration is provided, use it instead of calculating from start and end times
    if (customDur) {
      // Parse custom duration (e.g., "8h", "480m", "1h30m")
      const hoursMatch = customDur.match(/(\d+)h/);
      const minutesMatch = customDur.match(/(\d+)m/);
      
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      
      return hours * 60 + minutes;
    }
    
    // Otherwise, calculate duration from start and end times
    const startDate = parse(start, 'HH:mm', new Date());
    const endDate = parse(end, 'HH:mm', new Date());
    
    // Handle case where end time is next day (e.g., 23:00 to 02:00)
    const endDateTime = endDate < startDate ? new Date(endDate.getTime() + 24 * 60 * 60 * 1000) : endDate;
    
    const diffInMs = endDateTime - startDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    return diffInMinutes;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate that end time is after start time (only if no custom duration is set)
    if (!customDuration) {
      const startDateTime = parse(startTime, 'HH:mm', new Date());
      const endDateTime = parse(endTime, 'HH:mm', new Date());
      
      if (endDateTime <= startDateTime) {
        alert(t('time_entry.validation.end_time_after_start'));
        return;
      }
    }
    
    const duration = calculateDuration(startTime, endTime, customDuration);
    
    const newEntry = {
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      duration,
      notes
    };
    
    onAddEntry(newEntry);
    
    // Reset form
    setNotes('');
    setSelectedShift('');
    setCustomDuration('');
  };



  const handleShiftChange = (e) => {
    const shiftId = e.target.value;
    setSelectedShift(shiftId);
    
    if (shiftId) {
      const shift = shifts.find(s => s.id === shiftId);
      if (shift) {
        setStartTime(shift.startTime);
        setEndTime(shift.endTime);
        setCustomDuration(shift.customDuration || '');
      }
    } else {
      // Reset custom duration when no shift is selected
      setCustomDuration('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="section-heading">{t('time_entry.add_entry')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            {t('time_entry.date')}
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        {/* Shift template selector */}
        {shifts.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shiftTemplate">
              {t('time_entry.custom_shift.select_shift')}
            </label>
            <select
              id="shiftTemplate"
              value={selectedShift}
              onChange={handleShiftChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">{t('time_entry.custom_shift.select_placeholder')}</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
                  {shift.customDuration && ` [${shift.customDuration}]`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            {t('time_entry.shift_name')}
          </label>
          <input
            type="text"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('time_entry.shift_name_placeholder')}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
              {t('time_entry.start_time')}
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required={!customDuration}
              disabled={!!customDuration}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
              {t('time_entry.end_time')}
            </label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required={!customDuration}
              disabled={!!customDuration}
            />
          </div>
        </div>
        
        {/* Custom duration input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customDuration">
            {t('time_entry.custom_shift.custom_duration')}
          </label>
          <input
            type="text"
            id="customDuration"
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder={t('time_entry.custom_shift.custom_duration_placeholder') || "例如: 8h 或 480m"}
          />
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {t('time_entry.custom_shift.custom_duration_help') || "输入自定义工时，例如 8h 表示8小时，480m 表示480分钟"}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {t('time_entry.add_entry')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeEntryForm;