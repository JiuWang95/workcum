import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { exportToExcel } from '../utils/export';
import { useTranslation } from 'react-i18next';

const ReportPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [startDate, setStartDate] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  // Load entries and schedules from localStorage on component mount
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setEntries(savedEntries);
    setSchedules(savedSchedules);
    setShifts(savedShifts);
  }, []);

  // Filter entries and schedules based on date range
  useEffect(() => {
    const filteredEntries = entries.filter(entry => {
      return entry.date >= startDate && entry.date <= endDate;
    });
    
    const filteredSchedules = schedules.filter(schedule => {
      return schedule.date >= startDate && schedule.date <= endDate;
    });
    
    setFilteredEntries(filteredEntries);
    setFilteredSchedules(filteredSchedules);
  }, [entries, schedules, startDate, endDate]);

  // Function to convert duration string to hours
  const convertDurationToHours = (durationStr) => {
    if (!durationStr) return 0;
    
    const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
    const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
    
    const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
    
    return hours + (minutes / 60);
  };

  // Calculate total hours from both entries and schedules
  const totalMinutesFromEntries = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
  
  const totalMinutesFromSchedules = filteredSchedules.reduce((sum, schedule) => {
    if (schedule.selectedShift) {
      const shift = shifts.find(s => s.id === schedule.selectedShift);
      if (shift && shift.customDuration) {
        return sum + (convertDurationToHours(shift.customDuration) * 60);
      }
      
      // Calculate duration from start and end time if no custom duration
      const start = new Date(`1970-01-01T${schedule.startTime}:00`);
      const end = new Date(`1970-01-01T${schedule.endTime}:00`);
      const duration = (end - start) / (1000 * 60); // Convert to minutes
      return sum + duration;
    }
    return sum;
  }, 0);
  
  const totalMinutes = totalMinutesFromEntries + totalMinutesFromSchedules;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Quick date range selectors
  const setThisWeek = () => {
    const now = new Date();
    setStartDate(format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  const setThisMonth = () => {
    const now = new Date();
    setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
  };

  // Export to Excel
  const handleExport = () => {
    exportToExcel(filteredEntries, filteredSchedules, shifts, `time-report-${startDate}-to-${endDate}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="page-heading">{t('reports.title')}</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              {t('reports.from_date')}
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
              {t('reports.to_date')}
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={setThisWeek}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              {t('reports.this_week')}
            </button>
            <button
              onClick={setThisMonth}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              {t('reports.this_month')}
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              {t('reports.export_excel')}
            </button>
          </div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <h2 className="subsection-heading">{t('reports.summary')}</h2>
          <p className="text-2xl font-bold text-indigo-600">
            {(totalMinutes / 60).toFixed(1)}h
          </p>
          <p className="text-gray-600">
            {t('reports.total_time_tracked', { startDate, endDate })}
          </p>
        </div>
        
        {filteredEntries.length === 0 && filteredSchedules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('reports.no_entries')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">{t('reports.table.notes')}</th>
                  <th className="py-2 px-4 text-left">{t('reports.table.start_time')}</th>
                  <th className="py-2 px-4 text-left">{t('reports.table.end_time')}</th>
                  <th className="py-2 px-4 text-left">{t('reports.table.duration')}</th>
                  <th className="py-2 px-4 text-left">{t('reports.table.date')}</th>
                  <th className="py-2 px-4 text-left">类型</th>
                </tr>
              </thead>
              <tbody>
                {/* Display time entries */}
                {filteredEntries.map((entry, index) => {
                  return (
                    <tr key={`entry-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4 border-b">{entry.notes || t('time_entry.entry')}</td>
                      <td className="py-2 px-4 border-b">{entry.startTime}</td>
                      <td className="py-2 px-4 border-b">{entry.endTime}</td>
                      <td className="py-2 px-4 border-b">{(entry.duration / 60).toFixed(1)}h</td>
                      <td className="py-2 px-4 border-b">{entry.date}</td>
                      <td className="py-2 px-4 border-b">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">工时记录</span>
                      </td>
                    </tr>
                  );
                })}
                
                {/* Display schedules */}
                {filteredSchedules.map((schedule, index) => {
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
                  
                  return (
                    <tr key={`schedule-${index}`} className={(filteredEntries.length + index) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4 border-b">{schedule.notes || schedule.title || '-'}</td>
                      <td className="py-2 px-4 border-b">{schedule.startTime}</td>
                      <td className="py-2 px-4 border-b">{schedule.endTime}</td>
                      <td className="py-2 px-4 border-b">{(duration / 60).toFixed(1)}h</td>
                      <td className="py-2 px-4 border-b">{schedule.date}</td>
                      <td className="py-2 px-4 border-b">
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">排班</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;