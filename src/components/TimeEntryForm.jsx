import React, { useState } from 'react';
import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';

const TimeEntryForm = ({ onAddEntry }) => {
  const { t } = useTranslation();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [syncToSchedule, setSyncToSchedule] = useState(false);

  const calculateDuration = (start, end) => {
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
    
    // Validate that end time is after start time
    const startDateTime = parse(startTime, 'HH:mm', new Date());
    const endDateTime = parse(endTime, 'HH:mm', new Date());
    
    if (endDateTime <= startDateTime) {
      alert(t('time_entry.validation.end_time_after_start'));
      return;
    }
    
    const duration = calculateDuration(startTime, endTime);
    
    const newEntry = {
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      duration,
      notes
    };
    
    onAddEntry(newEntry);
    
    // Sync to schedule if requested
    if (syncToSchedule) {
      syncEntryToSchedule(newEntry);
    }
    
    // Reset form
    setNotes('');
    setSyncToSchedule(false);
  };

  const syncEntryToSchedule = (entry) => {
    // Load existing schedules from localStorage
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    
    // Create a new schedule task based on the time entry
    const newSchedule = {
      id: Date.now().toString() + '_schedule',
      title: t('time_entry.entry') + ': ' + (entry.notes || t('time_entry.entry')),
      notes: entry.notes || '',
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime
    };
    
    // Add the new schedule to the list
    const updatedSchedules = [...savedSchedules, newSchedule];
    
    // Save updated schedules to localStorage
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    
    // Show confirmation
    alert(t('time_entry.sync_success'));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('time_entry.add_entry')}</h2>
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
              required
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
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            {t('time_entry.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
            placeholder={t('time_entry.notes_placeholder')}
          />
        </div>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={syncToSchedule}
              onChange={(e) => setSyncToSchedule(e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-gray-700">{t('time_entry.sync_to_schedule')}</span>
          </label>
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