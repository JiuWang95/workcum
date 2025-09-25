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
    
    // 同步到日历中
    const scheduleEntry = {
      id: `entry-${entry.id}`,
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      title: entry.notes || t('time_entry.entry'), // 使用班次名称作为标题
      type: 'entry'
    };
    
    const newSchedules = [...schedules, scheduleEntry];
    setSchedules(newSchedules);
    localStorage.setItem('schedules', JSON.stringify(newSchedules));
  };

  const handleDeleteEntry = (id, type) => {
    if (type === 'schedule') {
      // 删除排班记录
      if (window.confirm(t('schedule.delete_confirm'))) {
        const newSchedules = schedules.filter(schedule => schedule.id !== id);
        setSchedules(newSchedules);
        localStorage.setItem('schedules', JSON.stringify(newSchedules));
      }
    } else {
      // 删除时间记录
      if (window.confirm(t('time_entry.delete_confirm'))) {
        const newEntries = entries.filter(entry => entry.id !== id);
        setEntries(newEntries);
        localStorage.setItem('timeEntries', JSON.stringify(newEntries));
        
        // 同时从日历中删除
        const newSchedules = schedules.filter(schedule => schedule.id !== `entry-${id}`);
        setSchedules(newSchedules);
        localStorage.setItem('schedules', JSON.stringify(newSchedules));
      }
    }
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
              <CustomShiftManager />
            </div>
            <div>
              <TimeEntryForm onAddEntry={handleAddEntry} />
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
                      <div className="flex-1">
                        {/* 第一排：班次名称 */}
                        <div className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg">
                          <span className="text-lg font-bold">
                            {record.notes || (record.type === 'entry' ? t('time_entry.entry') : record.title)}
                          </span>
                        </div>
                        
                        {/* 第二排：开始结束时间 */}
                        <div className="text-sm text-gray-600 mt-1">
                          {record.startTime} - {record.endTime}
                        </div>
                        
                        {/* 第三排：日期 */}
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500">{record.date}</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${
                            record.type === 'entry' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {record.type === 'entry' ? '工时记录' : '排班'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-indigo-600">{record.displayDuration} {t('time_entry.duration')}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(record.id, record.type);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title={t('time_entry.delete')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
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