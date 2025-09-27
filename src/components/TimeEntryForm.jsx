import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';
import DurationPicker from './DurationPicker';
import ColorPicker from './ColorPicker'; // 导入颜色选择器组件

const TimeEntryForm = ({ onAddEntry, onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [customHue, setCustomHue] = useState(30); // 添加自定义色调状态，默认为橙色

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
    
    const duration = calculateDuration(startTime, endTime, customDuration);
    
    const newEntry = {
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      duration,
      notes,
      customHue // 添加自定义颜色
    };
    
    // 调用onAddEntry或onSubmit，确保至少有一个被调用
    if (onAddEntry) {
      onAddEntry(newEntry);
    } else if (onSubmit) {
      onSubmit(newEntry);
    }
    
    // Reset form
    setNotes('');
    setSelectedShift('');
    setCustomDuration('');
    setCustomHue(30); // 重置为默认值
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
        // Auto-fill shift name
        setNotes(shift.name);
      }
    } else {
      // Reset custom duration when no shift is selected
      setCustomDuration('');
      // Clear shift name
      setNotes('');
    }
  };

  return (
    <form id="timeEntryForm" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="date">
          {t('time_entry.date')}
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
          required
        />
      </div>
      
      {/* Shift template selector */}
      {shifts.length > 0 && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="shiftTemplate">
            {t('time_entry.custom_shift.select_shift')}
          </label>
          <select
            id="shiftTemplate"
            value={selectedShift}
            onChange={handleShiftChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
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
      
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="notes">
          {t('time_entry.shift_name')}
        </label>
        <input
          type="text"
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
          placeholder={t('time_entry.shift_name_placeholder')}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="startTime">
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
          <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="endTime">
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
      <div>
        <DurationPicker
          id="customDuration"
          label={t('time_entry.custom_shift.custom_duration')}
          value={customDuration}
          onChange={setCustomDuration}
        />
      </div>
      
      {/* Color picker for time entries - only 3 options and different from shift colors */}
      <ColorPicker 
        selectedColor={customHue} 
        onColorChange={setCustomHue} 
        colorOptions={[
          { name: t('time_entry.custom_shift.colors.orange'), hue: 30 },
          { name: t('time_entry.custom_shift.colors.red'), hue: 0 },
          { name: t('time_entry.custom_shift.colors.pink'), hue: 330 }
        ]}
      />
      
      {/* 移除原来的按钮，因为现在使用Modal的footer按钮 */}
    </form>
  );
};

export default TimeEntryForm;