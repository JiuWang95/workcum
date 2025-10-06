import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay,
  addWeeks,
  subWeeks
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getShiftColor, getShiftBackgroundColor, getShiftTypeBackgroundColor } from '@/utils/shiftColor.js'; // 导入颜色工具函数
import { getEntryColor } from '@/utils/entryColor.js'; // 导入时间记录颜色工具函数
import Modal from '../modals/Modal.jsx'; // 导入统一的Modal组件

const WeeklyScheduleCalendar = ({ currentDate, onDateChange }) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [shifts, setShifts] = useState([]); // Add shifts state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    date: '',
    selectedShift: '' // 只保留班次选择
  });
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedDateForReplace, setSelectedDateForReplace] = useState(null);

  // Load schedules from localStorage
  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    setSchedules(savedSchedules);
  }, []);

  // Load time entries from localStorage
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setTimeEntries(savedEntries);
  }, []);

  // 添加一个useEffect来监听localStorage的变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'timeEntries') {
        const savedEntries = JSON.parse(e.newValue || '[]');
        setTimeEntries(savedEntries);
      }
      if (e.key === 'schedules') {
        const savedSchedules = JSON.parse(e.newValue || '[]');
        setSchedules(savedSchedules);
      }
      if (e.key === 'customShifts') {
        const savedShifts = JSON.parse(e.newValue || '[]');
        setShifts(savedShifts);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load custom shifts from localStorage
  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setShifts(savedShifts);
  }, []);

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Save time entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  // Get all days to display in the week view
  const getWeekDays = (date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    const days = [];
    let day = weekStart;
    
    while (day <= weekEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  const handleDateClick = (date) => {
    // 检查该日期是否已有排班或时间记录
    const existingSchedules = getScheduleForDate(date);
    const existingTimeEntries = getTimeEntriesForDate(date);
    
    if (existingSchedules.length > 0 || existingTimeEntries.length > 0) {
      // 如果已有排班或时间记录，提示用户是否替换
      setShowReplaceModal(true);
      setSelectedDateForReplace(date);
      return;
    }
    
    setSelectedDate(date);
    setFormData({
      id: null,
      date: format(date, 'yyyy-MM-dd'),
      selectedShift: ''
    });
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setSelectedDate(new Date(schedule.date));
    // 只设置formData中存在的字段
    setFormData({
      id: schedule.id,
      date: schedule.date,
      selectedShift: schedule.selectedShift
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(t('schedule.delete_confirm'))) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
      setShowModal(false); // 添加这行代码来关闭模态框
    }
  };

  const handleDeleteTimeEntry = (id) => {
    if (window.confirm(t('time_entry.delete_confirm') || '确定要删除这个时间记录吗？')) {
      setTimeEntries(timeEntries.filter(entry => entry.id !== id));
      setShowDeleteModal(false); // 添加这行代码来关闭模态框
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证必须选择班次
    if (!formData.selectedShift) {
      alert(t('time_entry.custom_shift.select_shift') || '请选择一个班次');
      return;
    }
    
    // 获取选中的班次信息
    const selectedShiftData = shifts.find(shift => shift.id === formData.selectedShift);
    
    if (!selectedShiftData) {
      alert(t('time_entry.custom_shift.shift_not_found') || '找不到选中的班次');
      return;
    }
    
    // 构建新的排班对象
    const newSchedule = {
      id: formData.id || Date.now(),
      date: formData.date,
      selectedShift: formData.selectedShift,
      // 为了与现有代码兼容，仍然保存班次的名称、开始和结束时间
      title: selectedShiftData.name,
      startTime: selectedShiftData.startTime,
      endTime: selectedShiftData.endTime,
      notes: selectedShiftData.name,
      // 保存自定义工时信息
      customDuration: selectedShiftData.customDuration || null
    };
    
    if (formData.id) {
      // 更新现有排班
      setSchedules(schedules.map(schedule => 
        schedule.id === formData.id ? newSchedule : schedule
      ));
    } else {
      // 添加新排班
      setSchedules([...schedules, newSchedule]);
    }
    
    setShowModal(false);
  };

  // Function to convert duration string to hours
  const convertDurationToHours = (durationStr) => {
    if (!durationStr) return 0;
    
    const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
    const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
    
    const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
    
    return hours + (minutes / 60);
  };

  // 获取班次类型显示文本
  const getShiftTypeText = (shiftType) => {
    switch (shiftType) {
      case 'day':
        return t('time_entry.custom_shift.day_shift');
      case 'rest':
        return t('time_entry.custom_shift.rest_day');
      case 'overnight':
        return t('time_entry.custom_shift.overnight_shift');
      case 'special':
        return t('time_entry.custom_shift.special_shift');
      default:
        return t('time_entry.custom_shift.day_shift');
    }
  };

  const getScheduleForDate = (date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.date), date)
    );
  };

  const getTimeEntriesForDate = (date) => {
    return timeEntries.filter(entry => 
      isSameDay(new Date(entry.date), date)
    );
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="hide-scrollbar mt-2">
      {/* Week view: Each date occupies a separate row with vertical arrangement */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {weekDays.map((day, index) => {
          const daySchedules = getScheduleForDate(day);
          const dayTimeEntries = getTimeEntriesForDate(day);
          const isToday = isSameDay(day, new Date());
          
          // Calculate total minutes from schedules
          const filteredSchedules = daySchedules.filter(schedule => schedule.selectedShift);
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

          return (
            <div 
              key={index} 
              className={`rounded-lg p-2 sm:p-3 md:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isToday ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-300 shadow-sm' : 'border border-gray-200'
              }`}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex h-full">
                {/* Left side - Date information */}
                <div className={`w-1/6 sm:w-1/12 pr-0.5 sm:pr-1 border-r border-gray-200 flex flex-col items-center justify-center ${
                  isToday ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  <div className="text-black text-[0.7rem] sm:text-sm font-bold">
                    {format(day, 'EEE', { locale: zhCN })}
                  </div>
                  <div className="text-base sm:text-lg md:text-xl font-bold">
                    {format(day, 'd', { locale: zhCN })}
                  </div>
                  <div className="text-[0.6rem] sm:text-xs text-gray-500 mt-0.5">
                    {format(day, 'MM/dd', { locale: zhCN })}
                  </div>
                </div>
                
                {/* Right side - Events information */}
                <div className="w-5/6 sm:w-11/12 pl-1 sm:pl-2 flex flex-col">
                  {/* Arrangement of schedules and time entries: improved layout with full height and minimal margin */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 flex-grow -mt-px -mb-px sm:-mt-px sm:-mb-px">
                    {/* Display schedules */}
                    {daySchedules.map((schedule) => {
                      // 获取班次信息
                      const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
                      const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
                      // 获取班次类型和自定义色调
                      const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
                      const customHue = shiftInfo ? shiftInfo.customHue : undefined;
                      
                      return (
                        <div 
                          key={schedule.id} 
                          className="rounded-xl shadow-sm transition-all duration-200 ease-in-out transform hover:shadow-md p-3 min-h-[3.5rem]"
                          style={{ 
                            borderLeft: `4px solid ${getShiftColor(shiftType, customHue)}`,
                            backgroundColor: getShiftBackgroundColor(shiftType, customHue),
                            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(schedule);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            {/* 左侧：班次名称和类型标识 */}
                            <div className="flex items-start min-w-0">
                              <div 
                                className="w-3.5 h-3.5 rounded-full border-2 border-white shadow mr-2.5 mt-1 flex-shrink-0"
                                style={{ backgroundColor: getShiftColor(shiftType, customHue) }}
                              ></div>
                              <div className="min-w-0 flex-1 flex items-center">
                                <h3 
                                  className="font-bold text-gray-800 text-sm sm:text-base leading-tight mr-1"
                                  style={{ color: getShiftColor(shiftType, customHue) }}
                                >
                                  {shiftName}
                                </h3>
                                {/* 类型标识：显示班次类型，带颜色填充 */}
                                <span 
                                  className="inline-flex items-center px-1 py-0.5 rounded-full text-[0.5rem] sm:text-[0.6rem] font-medium whitespace-nowrap mr-2"
                                  style={{
                                    backgroundColor: getShiftTypeBackgroundColor(shiftType, customHue),
                                    color: getShiftColor(shiftType, customHue)
                                  }}
                                >
                                  {shiftType === 'overnight' && t('time_entry.custom_shift.overnight_shift')}
                                  {shiftType === 'rest' && t('time_entry.custom_shift.rest_day')}
                                  {shiftType === 'day' && t('time_entry.custom_shift.day_shift')}
                                  {shiftType === 'special' && t('time_entry.custom_shift.special_shift')}
                                </span>
                              </div>
                            </div>
                            
                            {/* 右侧：时间范围和工时时长 */}
                            <div className="flex flex-col items-end ml-3 flex-shrink-0">
                              {schedule.selectedShift && shifts.find(s => s.id === schedule.selectedShift)?.customDuration !== undefined && (
                                <div className="flex items-center mb-1">
                                  <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  <span className="text-gray-700 text-[0.65rem] sm:text-xs font-bold">
                                    {convertDurationToHours(shifts.find(s => s.id === schedule.selectedShift).customDuration).toFixed(1)}h
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="text-gray-600 text-xs font-medium whitespace-nowrap">
                                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Display time entries */}
                    {dayTimeEntries.map((entry) => {
                      const entryColor = getEntryColor(entry.customHue);
                      return (
                        <div 
                          key={entry.id} 
                          className="text-xs sm:text-sm font-semibold p-2 sm:p-2.5 rounded-lg flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all duration-200 shadow-sm min-h-[2.5rem]"
                          style={{
                            backgroundColor: entryColor.backgroundColor,
                            border: `1px solid ${entryColor.borderColor}`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEntry(entry);
                            setShowDeleteModal(true);
                          }}
                        >
                          <div 
                            className="font-bold truncate text-xs sm:text-sm min-w-0 flex-1"
                            style={{
                              color: entryColor.textColor
                            }}
                          >
                            {entry.notes || t('time_entry.entry')}
                          </div>
                          <div 
                            className="text-[0.65rem] sm:text-xs font-medium flex flex-col items-end ml-2 flex-shrink-0"
                            style={{
                              color: entryColor.textColor
                            }}
                          >
                            {entry.duration && (
                              <div className="bg-white bg-opacity-70 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                [{(entry.duration / 60).toFixed(1)}h]
                              </div>
                            )}
                            <div className="mt-0.5 bg-white bg-opacity-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                              {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show placeholder if no items */}
                    {daySchedules.length === 0 && dayTimeEntries.length === 0 && (
                      <div className="text-gray-400 italic py-4 text-center text-xs sm:text-sm bg-gray-50 rounded-lg flex items-center justify-center flex-grow -mt-px -mb-px sm:-mt-px sm:-mb-px">
                        {t('schedule.no_events')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={formData.id ? t('schedule.edit_schedule') : t('schedule.add_schedule')}
          size="md"
        >
            
            <form onSubmit={handleSubmit}>
              {/* 只保留班次选择框 */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2 sm:mb-3" htmlFor="shiftTemplate">
                  {t('time_entry.custom_shift.select_shift')} *
                </label>
                <div className="relative">
                  <select
                    id="shiftTemplate"
                    value={formData.selectedShift}
                    onChange={(e) => {
                      setFormData({...formData, selectedShift: e.target.value});
                    }}
                    className="appearance-none w-full py-2 px-3 sm:py-3 sm:px-4 pr-8 sm:pr-10 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  >
                    <option value="">{t('time_entry.custom_shift.select_placeholder')}</option>
                    {shifts.map((shift) => {
                      // 获取班次类型对应的颜色和图标
                      const shiftColor = getShiftColor(shift.shiftType, shift.customHue);
                      const shiftTypeText = getShiftTypeText(shift.shiftType || 'day');
                      
                      return (
                        <option key={shift.id} value={shift.id} className="flex items-center">
                          {shift.name} ({shift.startTime} - {shift.endTime})
                          {shift.customDuration && ` [${convertDurationToHours(shift.customDuration).toFixed(1)}h]`}
                          ({shiftTypeText})
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-700">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">{t('time_entry.custom_shift.select_shift_help')}</p>
              </div>
              
              <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-100">
                <div>
                  {formData.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(formData.id)}
                      className="flex items-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      {t('schedule.form.delete')}
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-2 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 sm:px-5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    {t('schedule.form.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 sm:px-5 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                  >
                    {t('schedule.form.save')}
                  </button>
                </div>
              </div>
            </form>
          </Modal>
        )}

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={t('time_entry.delete_entry')}
          size="sm"
        >
            
            <div className="mb-6">
              <p className="text-gray-700 text-center mb-4">
                {t('time_entry.delete_confirm') || '确定要删除这个时间记录吗？'}
              </p>
              {selectedEntry && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="font-bold truncate text-gray-800">{selectedEntry.notes || t('time_entry.entry')}</div>
                  <div className="text-green-700 text-sm mt-2 flex flex-wrap items-center">
                    <span className="mr-3">
                      {formatTime(selectedEntry.startTime)} - {formatTime(selectedEntry.endTime)}
                    </span>
                    {selectedEntry.duration && (
                      <span className="bg-white bg-opacity-70 px-2 py-1 rounded-lg font-bold">
                        [{(selectedEntry.duration / 60).toFixed(1)}h]
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {t('schedule.form.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteTimeEntry(selectedEntry.id);
                  setShowDeleteModal(false);
                }}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
              >
                {t('schedule.form.delete')}
              </button>
            </div>
          </Modal>
        )}
      {showReplaceModal && (
        <Modal
          isOpen={showReplaceModal}
          onClose={() => setShowReplaceModal(false)}
          title={t('schedule.replace_schedule')}
          size="sm"
        >
            
            <div className="mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {t('schedule.replace_warning') || '该日期已有排班或记录，继续操作将替换现有内容。确定要继续吗？'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowReplaceModal(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {t('schedule.form.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  // 删除该日期的所有排班和时间记录
                  const dateStr = format(selectedDateForReplace, 'yyyy-MM-dd');
                  setSchedules(schedules.filter(schedule => schedule.date !== dateStr));
                  setTimeEntries(timeEntries.filter(entry => entry.date !== dateStr));
                  
                  // 打开添加排班模态框
                  setSelectedDate(selectedDateForReplace);
                  setFormData({
                    id: null,
                    date: dateStr,
                    selectedShift: ''
                  });
                  setShowReplaceModal(false);
                  setShowModal(true);
                }}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
              >
                {t('schedule.replace')}
              </button>
            </div>
          </Modal>
        )}
    </div>
  );
};

export default WeeklyScheduleCalendar;