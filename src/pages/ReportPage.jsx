import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { exportToExcelReport } from '../utils/export';
import { useTranslation } from 'react-i18next';
import { getEntryColor } from '../utils/entryColor'; // 导入时间记录颜色工具函数
import Modal from '../components/modals/Modal'; // 导入Modal组件
import { getData, watchStorageChanges } from '../utils/dataManager'; // 导入数据管理工具

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
  const [excelFileName, setExcelFileName] = useState(''); // 添加自定义文件名状态
  const [selectedButton, setSelectedButton] = useState('thisWeek'); // 添加选中状态跟踪

  // Load entries and schedules from dataManager on component mount
  useEffect(() => {
    const loadData = () => {
      const savedEntries = getData('timeEntries');
      const savedSchedules = getData('schedules');
      const savedShifts = getData('customShifts');
      setEntries(savedEntries);
      setSchedules(savedSchedules);
      setShifts(savedShifts);
    };

    // Load initial data
    loadData();

    // Watch for storage changes
    const unsubscribe = watchStorageChanges(() => {
      loadData();
    });

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
    setSelectedButton('thisWeek'); // 设置选中状态
  };

  const setLastWeek = () => {
    const now = new Date();
    const lastWeek = subDays(now, 7);
    setStartDate(format(startOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(lastWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setSelectedButton('lastWeek'); // 设置选中状态
  };

  const setNextWeek = () => {
    const now = new Date();
    const nextWeek = subDays(now, -7);
    setStartDate(format(startOfWeek(nextWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(nextWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    setSelectedButton('nextWeek'); // 设置选中状态
  };

  const setThisMonth = () => {
    const now = new Date();
    setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
    setSelectedButton('thisMonth'); // 设置选中状态
  };

  // Export to Excel
  const handleExport = () => {
    // 打开文件名弹窗
    const defaultFileName = `time-report-${startDate}-to-${endDate}`;
    setExcelFileName(defaultFileName);
    setIsExcelFileNameModalOpen(true);
  };

  // Handle Excel file name confirmation
  const handleExcelFileNameConfirm = () => {
    if (excelFileName.trim() !== '') {
      exportToExcelReport(filteredEntries, filteredSchedules, shifts, excelFileName, t);
      setIsExcelFileNameModalOpen(false);
    }
  };

  // 删除handleExcelFileNameConfirm函数，不再需要

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="page-heading">{t('reports.title')}</h1>
      
      {/* 文件名弹窗 */}
      <Modal
        isOpen={isExcelFileNameModalOpen}
        onClose={() => setIsExcelFileNameModalOpen(false)}
        title={t('reports.export_modal.title')}
        size="sm"
      >
        <Modal.Body>
          <div className="mb-4">
            <label htmlFor="excelFileName" className="block text-gray-700 text-sm font-medium mb-2">
              {t('reports.file_name')}
            </label>
            <div className="relative">
              <input
                type="text"
                id="excelFileName"
                value={excelFileName}
                onChange={(e) => setExcelFileName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 pr-10"
                placeholder={t('reports.enter_file_name')}
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {t('data.export_modal.extension')}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 w-full">
            <button
              onClick={() => setIsExcelFileNameModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200 text-base"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleExcelFileNameConfirm}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow transition-all duration-200 text-base flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('common.export')}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              {t('reports.from_date')}
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={setLastWeek}
                className={`font-medium py-2 px-4 rounded-lg whitespace-nowrap shadow transition-all duration-200 transform hover:scale-105 ${
                  selectedButton === 'lastWeek'
                    ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 shadow-md'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800'
                }`}
              >
                {t('reports.last_week')}
              </button>
              <button
                onClick={setThisWeek}
                className={`font-medium py-2 px-4 rounded-lg whitespace-nowrap shadow transition-all duration-200 transform hover:scale-105 ${
                  selectedButton === 'thisWeek'
                    ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 shadow-md'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800'
                }`}
              >
                {t('reports.this_week')}
              </button>
              <button
                onClick={setNextWeek}
                className={`font-medium py-2 px-4 rounded-lg whitespace-nowrap shadow transition-all duration-200 transform hover:scale-105 ${
                  selectedButton === 'nextWeek'
                    ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 shadow-md'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800'
                }`}
              >
                {t('reports.next_week')}
              </button>
              <button
                onClick={setThisMonth}
                className={`font-medium py-2 px-4 rounded-lg whitespace-nowrap shadow transition-all duration-200 transform hover:scale-105 ${
                  selectedButton === 'thisMonth'
                    ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 shadow-md'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800'
                }`}
              >
                {t('reports.this_month')}
              </button>
            </div>
            {/* 在桌面端保留导出按钮 */}
            <button
              onClick={handleExport}
              className="hidden md:inline-flex bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg whitespace-nowrap shadow-md transition-all duration-200 transform hover:scale-105 items-center"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                />
              </svg>
              {t('reports.export_excel')}
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 shadow-md border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="subsection-heading text-indigo-800">{t('reports.summary')}</h2>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                {t('reports.total_time_tracked', { startDate, endDate })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-600 md:text-4xl">
                {(totalMinutes / 60).toFixed(1)}<span className="text-xl">h</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* 在移动端将导出按钮放在汇总板块下方并居中 */}
        <div className="md:hidden flex justify-center mb-6">
          <button
            onClick={handleExport}
            className="inline-flex bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg whitespace-nowrap shadow-md transition-all duration-200 transform hover:scale-105 items-center"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
              />
            </svg>
            {t('reports.export_excel')}
          </button>
        </div>
        {filteredEntries.length === 0 && filteredSchedules.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm md:text-base">{t('reports.no_entries')}</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-2 px-3 text-left text-sm font-medium">{t('reports.table.notes')}</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">{t('reports.table.start_time')}</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">{t('reports.table.end_time')}</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">{t('reports.table.duration')}</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">{t('reports.table.date')}</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">{t('reports.table.type')}</th>
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
                        const entryColor = getEntryColor(record.customHue);
                        return (
                          <tr key={`entry-${record.id}`} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="py-2 px-3 text-sm">
                              <span 
                                className="font-medium"
                                style={{
                                  color: entryColor.textColor
                                }}
                              >
                                {record.notes || t('time_entry.entry')}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-sm">{record.startTime}</td>
                            <td className="py-2 px-3 text-sm">{record.endTime}</td>
                            <td className="py-2 px-3 text-sm font-medium text-indigo-600">{(record.duration / 60).toFixed(1)}h</td>
                            <td className="py-2 px-3 text-sm">{record.date}</td>
                            <td className="py-2 px-3">
                              <span 
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: entryColor.backgroundColor,
                                  color: entryColor.textColor
                                }}
                              >
                                {t('reports.table.time_entry')}
                              </span>
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
                          <tr key={`schedule-${record.id}`} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="py-2 px-3 text-sm">{record.notes || record.title || '-'}</td>
                            <td className="py-2 px-3 text-sm">{record.startTime}</td>
                            <td className="py-2 px-3 text-sm">{record.endTime}</td>
                            <td className="py-2 px-3 text-sm font-medium text-indigo-600">{(duration / 60).toFixed(1)}h</td>
                            <td className="py-2 px-3 text-sm">{record.date}</td>
                            <td className="py-2 px-3">
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
            <div className="md:hidden space-y-3">
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
                    const entryColor = getEntryColor(record.customHue);
                    return (
                      <div 
                        key={`entry-${record.id}`} 
                        className="p-3 rounded-lg border"
                        style={{
                          backgroundColor: entryColor.backgroundColor,
                          borderColor: entryColor.borderColor
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 
                            className="font-medium text-sm"
                            style={{
                              color: entryColor.textColor
                            }}
                          >
                            {record.notes || t('time_entry.entry')}
                          </h3>
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: entryColor.backgroundColor,
                              color: entryColor.textColor
                            }}
                          >
                            {t('reports.table.time_entry')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">{t('reports.table.start_time')}</p>
                            <p className="text-sm">{record.startTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reports.table.end_time')}</p>
                            <p className="text-sm">{record.endTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reports.table.duration')}</p>
                            <p 
                              className="text-sm font-medium"
                              style={{
                                color: entryColor.textColor
                              }}
                            >
                              {(record.duration / 60).toFixed(1)}h
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reports.table.date')}</p>
                            <p className="text-sm">{record.date}</p>
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
                      <div key={`schedule-${record.id}`} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-sm">{record.notes || record.title || '-'}</h3>
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">{t('reports.table.schedule')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">{t('reports.table.start_time')}</p>
                            <p className="text-sm">{record.startTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reports.table.end_time')}</p>
                            <p className="text-sm">{record.endTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reports.table.duration')}</p>
                            <p className="text-sm font-medium text-indigo-600">{(duration / 60).toFixed(1)}h</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('reports.table.date')}</p>
                            <p className="text-sm">{record.date}</p>
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