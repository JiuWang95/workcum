import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { exportToExcel } from '../utils/export';
import { useTranslation } from 'react-i18next';

const ReportPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filteredEntries, setFilteredEntries] = useState([]);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setEntries(savedEntries);
  }, []);

  // Filter entries based on date range
  useEffect(() => {
    const filtered = entries.filter(entry => {
      return entry.date >= startDate && entry.date <= endDate;
    });
    setFilteredEntries(filtered);
  }, [entries, startDate, endDate]);

  // Calculate total hours
  const totalMinutes = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
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
    exportToExcel(filteredEntries, `time-report-${startDate}-to-${endDate}`);
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
            {totalHours}h {remainingMinutes}m
          </p>
          <p className="text-gray-600">
            {t('reports.total_time_tracked', { startDate, endDate })}
          </p>
        </div>
        
        {filteredEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('reports.no_entries')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">{t('reports.table.date')}</th>
                  <th className="py-2 px-4 text-left">{t('reports.table.start_time')}</th>
                  <th className="py-2 px-4 text-left">{t('reports.table.end_time')}</th>
                  <th className="py-2 px-4 text-left">{t('reports.table.duration')}</th>
                  <th className="py-2 px-4 text-left">{t('reports.table.notes')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => {
                  const hours = Math.floor(entry.duration / 60);
                  const minutes = entry.duration % 60;
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-4 border-b">{entry.date}</td>
                      <td className="py-2 px-4 border-b">{entry.startTime}</td>
                      <td className="py-2 px-4 border-b">{entry.endTime}</td>
                      <td className="py-2 px-4 border-b">{hours}h {minutes}m</td>
                      <td className="py-2 px-4 border-b">{entry.notes || '-'}</td>
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