import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { exportToExcelReport } from '../utils/export';
import { useTranslation } from 'react-i18next';
import FileNameModal from '../components/FileNameModal';

const ReportPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [startDate, setStartDate] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [isExcelFileNameModalOpen, setIsExcelFileNameModalOpen] = useState(false);

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
      // 修改逻辑：如果自定义工时存在（即使是0），也使用自定义工时
      if (shift && shift.customDuration !== undefined && shift.customDuration !== null && shift.customDuration !== "") {
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

  const setLastWeek = () => {
    const now = new Date();
    const lastWeek = subDays(now, 7);
    setStartDate(format(startOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  const setNextWeek = () => {
    const now = new Date();
    const nextWeek = subDays(now, -7);
    setStartDate(format(startOfWeek(nextWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(nextWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  };

  const setThisMonth = () => {
    const now = new Date();
    setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
  };

  // Export to Excel
  const handleExport = () => {
    setIsExcelFileNameModalOpen(true);
  };

  const handleExcelFileNameConfirm = (fileName) => {
    setIsExcelFileNameModalOpen(false);
    exportToExcelReport(filteredEntries, filteredSchedules, shifts, fileName, t);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="page-heading">{t('reports.title')}</h1>
      
      <FileNameModal
        isOpen={isExcelFileNameModalOpen}
        onClose={() => setIsExcelFileNameModalOpen(false)}
        onConfirm={handleExcelFileNameConfirm}
        defaultFileName={`time-report-${startDate}-to-${endDate}`}
        title={t('reports.export_modal.title')}
        fileType="Excel"
        fileExtension=".xlsx"
      />
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
        </div>
        
        <div className="hidden md:block mb-6">
          <div className="flex justify-between items-end gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={setLastWeek}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded whitespace-nowrap"
              >
                {t('reports.last_week')}
              </button>
              <button
                onClick={setThisWeek}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded whitespace-nowrap"
              >
                {t('reports.this_week')}
              </button>
              <button
                onClick={setNextWeek}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded whitespace-nowrap"
              >
                {t('reports.next_week')}
              </button>
              <button
                onClick={setThisMonth}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded whitespace-nowrap"
              >
                {t('reports.this_month')}
              </button>
            </div>
            <button
              onClick={handleExport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
            >
              {t('reports.export_excel')}
            </button>
          </div>
        </div>
        
        <div className="md:hidden mb-6">
          <div className="flex flex-wrap items-end gap-2 mb-2">
            <button
              onClick={setLastWeek}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded whitespace-nowrap"
            >
              {t('reports.last_week')}
            </button>
            <button
              onClick={setThisWeek}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded whitespace-nowrap"
            >
              {t('reports.this_week')}
            </button>
            <button
              onClick={setNextWeek}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded whitespace-nowrap"
            >
              {t('reports.next_week')}
            </button>
            <button
              onClick={setThisMonth}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded whitespace-nowrap"
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
          <p className="text-xl font-bold text-indigo-600 md:text-2xl">
            {(totalMinutes / 60).toFixed(1)}h
          </p>
          <p className="text-gray-600 text-sm md:text-base">
            {t('reports.total_time_tracked', { startDate, endDate })}
          </p>
        </div>
        
        {filteredEntries.length === 0 && filteredSchedules.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm md:text-base">{t('reports.no_entries')}</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">{t('reports.table.notes')}</th>
                    <th className="py-2 px-4 text-left">{t('reports.table.start_time')}</th>
                    <th className="py-2 px-4 text-left">{t('reports.table.end_time')}</th>
                    <th className="py-2 px-4 text-left">{t('reports.table.duration')}</th>
                    <th className="py-2 px-4 text-left">{t('reports.table.date')}</th>
                    <th className="py-2 px-4 text-left">{t('reports.table.type')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 合并时间记录和排班记录，并按时间顺序排序 */}
                  {(() => {
                    // 创建包含所有记录的数组，并添加类型标识
                    const allRecords = [
                      ...filteredEntries.map(entry => ({ ...entry, type: 'entry' })),
                      ...filteredSchedules.map(schedule => ({ ...schedule, type: 'schedule' }))
                    ];
                    
                    // 按日期和时间排序
                    allRecords.sort((a, b) => {
                      // 首先按日期排序
                      if (a.date !== b.date) {
                        return a.date.localeCompare(b.date);
                      }
                      
                      // 如果日期相同，按开始时间排序
                      return a.startTime.localeCompare(b.startTime);
                    });
                    
                    return allRecords.map((record, index) => {
                      if (record.type === 'entry') {
                        // 时间记录
                        return (
                          <tr key={`entry-${record.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-2 px-4 border-b">{record.notes || t('time_entry.entry')}</td>
                            <td className="py-2 px-4 border-b">{record.startTime}</td>
                            <td className="py-2 px-4 border-b">{record.endTime}</td>
                            <td className="py-2 px-4 border-b">{(record.duration / 60).toFixed(1)}h</td>
                            <td className="py-2 px-4 border-b">{record.date}</td>
                            <td className="py-2 px-4 border-b">
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">{t('reports.table.time_entry')}</span>
                            </td>
                          </tr>
                        );
                      } else {
                        // 排班记录
                        let duration = 0;
                        // 优先使用排班记录中保存的自定义工时
                        if (record.customDuration !== undefined && record.customDuration !== null && record.customDuration !== "") {
                          duration = convertDurationToHours(record.customDuration) * 60;
                        } else if (record.selectedShift) {
                          const shift = shifts.find(s => s.id === record.selectedShift);
                          if (shift && shift.customDuration !== undefined && shift.customDuration !== null && shift.customDuration !== "") {
                            duration = convertDurationToHours(shift.customDuration) * 60;
                          } else {
                            // Calculate duration from start and end time
                            const start = new Date(`1970-01-01T${record.startTime}:00`);
                            const end = new Date(`1970-01-01T${record.endTime}:00`);
                            duration = (end - start) / (1000 * 60); // Convert to minutes
                          }
                        }
                        
                        return (
                          <tr key={`schedule-${record.id}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="py-2 px-4 border-b">{record.notes || record.title || '-'}</td>
                            <td className="py-2 px-4 border-b">{record.startTime}</td>
                            <td className="py-2 px-4 border-b">{record.endTime}</td>
                            <td className="py-2 px-4 border-b">{(duration / 60).toFixed(1)}h</td>
                            <td className="py-2 px-4 border-b">{record.date}</td>
                            <td className="py-2 px-4 border-b">
                              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">{t('reports.table.schedule')}</span>
                            </td>
                          </tr>
                        );
                      }
                    });
                  })()}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {/* 合并时间记录和排班记录，并按时间顺序排序 */}
              {(() => {
                // 创建包含所有记录的数组，并添加类型标识
                const allRecords = [
                  ...filteredEntries.map(entry => ({ ...entry, type: 'entry' })),
                  ...filteredSchedules.map(schedule => ({ ...schedule, type: 'schedule' }))
                ];
                
                // 按日期和时间排序
                allRecords.sort((a, b) => {
                  // 首先按日期排序
                  if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                  }
                  
                  // 如果日期相同，按开始时间排序
                  return a.startTime.localeCompare(b.startTime);
                });
                
                return allRecords.map((record, index) => {
                  if (record.type === 'entry') {
                    // 时间记录
                    return (
                      <div key={`entry-${record.id}`} className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg md:text-xl">{record.notes || t('time_entry.entry')}</h3>
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">{t('reports.table.time_entry')}</span>
                            </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">{t('reports.table.start_time')}:</span>
                            <span className="ml-1">{record.startTime}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('reports.table.end_time')}:</span>
                            <span className="ml-1">{record.endTime}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('reports.table.duration')}:</span>
                            <span className="ml-1">{(record.duration / 60).toFixed(1)}h</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('reports.table.date')}:</span>
                            <span className="ml-1">{record.date}</span>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // 排班记录
                    let duration = 0;
                    // 优先使用排班记录中保存的自定义工时
                    if (record.customDuration !== undefined && record.customDuration !== null && record.customDuration !== "") {
                      duration = convertDurationToHours(record.customDuration) * 60;
                    } else if (record.selectedShift) {
                      const shift = shifts.find(s => s.id === record.selectedShift);
                      if (shift && shift.customDuration !== undefined && shift.customDuration !== null && shift.customDuration !== "") {
                        duration = convertDurationToHours(shift.customDuration) * 60;
                      } else {
                        // Calculate duration from start and end time
                        const start = new Date(`1970-01-01T${record.startTime}:00`);
                        const end = new Date(`1970-01-01T${record.endTime}:00`);
                        duration = (end - start) / (1000 * 60); // Convert to minutes
                      }
                    }
                    
                    return (
                      <div key={`schedule-${record.id}`} className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg md:text-xl">{record.notes || record.title || '-'}</h3>
                              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">{t('reports.table.schedule')}</span>
                            </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">{t('reports.table.start_time')}:</span>
                            <span className="ml-1">{record.startTime}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('reports.table.end_time')}:</span>
                            <span className="ml-1">{record.endTime}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('reports.table.duration')}:</span>
                            <span className="ml-1">{(duration / 60).toFixed(1)}h</span>
                          </div>
                          <div>
                            <span className="font-medium">{t('reports.table.date')}:</span>
                            <span className="ml-1">{record.date}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                });
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;