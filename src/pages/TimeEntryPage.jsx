import React, { useState } from 'react';
import TimeEntryForm from '../components/TimeEntryForm';
import CustomShiftManager from '../components/CustomShiftManager';
import { useTranslation } from 'react-i18next';

const TimeEntryPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [shifts, setShifts] = useState([]);

  // Load entries, schedules and shifts from localStorage on component mount
  React.useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    setEntries(savedEntries);
    setSchedules(savedSchedules);
    setShifts(savedShifts);
  }, []);

  const handleAddEntry = (entry) => {
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    localStorage.setItem('timeEntries', JSON.stringify(newEntries));
  };

  // Function to convert duration string to hours
  const convertDurationToHours = (durationStr) => {
    if (!durationStr) return 0;
    
    // Handle hours format like "8h"
    if (durationStr.includes('h')) {
      return parseFloat(durationStr.replace('h', ''));
    }
    
    // Handle minutes format like "480m"
    if (durationStr.includes('m')) {
      return parseFloat(durationStr.replace('m', '')) / 60;
    }
    
    return 0;
  };

  // Combine and sort entries and schedules by date
  const allRecords = [
    ...entries.map(entry => ({
      ...entry,
      type: 'entry',
      displayDuration: (entry.duration / 60).toFixed(1)
    })),
    ...schedules.map(schedule => {
      let duration = 0;
      if (schedule.selectedShift) {
        const shift = shifts.find(s => s.id === schedule.selectedShift);
        if (shift && shift.customDuration) {
          duration = convertDurationToHours(shift.customDuration) * 60;
        } else {
          // Calculate duration from start and end time
          const start = new Date(`1970-01-01T${schedule.startTime}:00`);
          const end = new Date(`1970-01-01T${schedule.endTime}:00`);
          duration = (end - start) / (1000 * 60); // Convert to minutes
        }
      }
      
      return {
        ...schedule,
        type: 'schedule',
        displayDuration: (duration / 60).toFixed(1)
      };
    })
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="page-heading">{t('time_entry.title')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <div>
              <TimeEntryForm onAddEntry={handleAddEntry} />
            </div>
            <div>
              <CustomShiftManager />
            </div>
          </div>
        </div>
        <div>
          <h2 className="section-heading">最近记录和排班</h2>
          {allRecords.length === 0 ? (
            <p className="text-gray-500">暂无记录和排班</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {allRecords.slice(0, 8).map((record, index) => (
                  <li key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{record.date}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          record.type === 'entry' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {record.type === 'entry' ? '工时记录' : '排班'}
                        </span>
                      </div>
                      <span className="text-indigo-600">{record.displayDuration} {t('time_entry.duration')}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {record.startTime} - {record.endTime}
                    </div>
                    {record.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        {record.notes}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeEntryPage;