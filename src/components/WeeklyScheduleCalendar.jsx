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
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor'; // 导入颜色工具函数

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

  // Load schedules, time entries and shifts from localStorage
  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    setSchedules(savedSchedules);
    setTimeEntries(savedEntries);
    setShifts(savedShifts);
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
    }
  };

  const handleDeleteTimeEntry = (id) => {
    if (window.confirm(t('time_entry.delete_confirm') || '确定要删除这个时间记录吗？')) {
      setTimeEntries(timeEntries.filter(entry => entry.id !== id));
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
    <div className="bg-white rounded-xl shadow-lg p-2 sm:p-3 md:p-4 hide-scrollbar mt-2">
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
          
          // Determine background color based on content
          let dayBackgroundColor = 'bg-white'; // Default background
          let dayBorderColor = 'border-gray-200'; // Default border
          
          // If there are schedules, use the first schedule's shift type for background
          if (daySchedules.length > 0 && daySchedules[0].selectedShift) {
            const shiftInfo = shifts.find(shift => shift.id === daySchedules[0].selectedShift);
            const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
            dayBackgroundColor = getShiftBackgroundColor(shiftType) + ' bg-opacity-20';
            dayBorderColor = 'border-' + getShiftColor(shiftType);
          } 
          // If there are time entries but no schedules, use time entry color
          else if (dayTimeEntries.length > 0) {
            dayBackgroundColor = 'bg-yellow-100'; // Time entry background color
            dayBorderColor = 'border-yellow-300';
          }
          
          return (
            <div 
              key={index} 
              className={`rounded-lg p-2 sm:p-3 md:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isToday ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-sm' : dayBackgroundColor + ' ' + dayBorderColor
              } border-2`}
              onClick={() => handleDateClick(day)}
            >
              {/* Date header */}
              <div className={`text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 flex items-center justify-between ${
                isToday ? 'text-blue-600' : 'text-gray-700'
              }`}>
                <div className="flex items-center">
                  <span className="mr-2">{format(day, 'EEE', { locale: zhCN })}</span>
                  <span className="text-lg sm:text-xl md:text-2xl">{format(day, 'd', { locale: zhCN })}</span>
                </div>
                <span className="text-xs sm:text-sm md:text-base bg-gray-100 px-2 py-1 rounded-full">
                  {format(day, 'M月', { locale: zhCN })}
                </span>
              </div>
              
              {/* Arrangement of schedules and time entries: vertical on larger screens, horizontal wrap on mobile */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {/* 显示排班 */}
                {daySchedules.map((schedule) => {
                  // 获取班次信息
                  const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
                  const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
                  // 获取班次类型
                  const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
                  
                  return (
                    <div 
                      key={schedule.id} 
                      className="text-xs sm:text-sm md:text-base font-semibold p-2 sm:p-3 rounded-lg flex-shrink-0 w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] shadow-sm cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${getShiftBackgroundColor(shiftType)}, ${getShiftColor(shiftType)}30)`,
                        border: `1px solid ${getShiftColor(shiftType)}`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(schedule);
                      }}
                    >
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2"
                          style={{ backgroundColor: getShiftColor(shiftType) }}
                        ></span>
                        <span className="font-bold truncate text-xs sm:text-sm md:text-base">{shiftName}</span>
                        {shiftType === 'overnight' && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.6rem] sm:text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm">
                            {t('time_entry.custom_shift.overnight_shift')}
                          </span>
                        )}
                        {shiftType === 'rest' && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.6rem] sm:text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                            {t('time_entry.custom_shift.rest_day')}
                          </span>
                        )}
                      </div>
                      <div 
                        className="text-[0.6rem] sm:text-xs md:text-sm mt-1 font-medium"
                        style={{ color: getShiftColor(shiftType) }}
                      >
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        {schedule.selectedShift && shifts.find(s => s.id === schedule.selectedShift)?.customDuration !== undefined && (
                          <span className="ml-2 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full">
                            [{convertDurationToHours(shifts.find(s => s.id === schedule.selectedShift).customDuration).toFixed(1)}h]
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* 显示时间记录 */}
                {dayTimeEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="text-xs sm:text-sm md:text-base font-semibold p-2 sm:p-3 rounded-lg flex-shrink-0 w-full sm:w-auto cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, #FDE68A, #F59E0B30)`,
                      border: `1px solid #F59E0B`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntry(entry);
                      setShowDeleteModal(true);
                    }}
                  >
                    <div className="font-bold truncate text-xs sm:text-sm" style={{ color: '#92400E' }}>{entry.notes || t('time_entry.entry')}</div>
                    <div className="text-[0.6rem] sm:text-xs mt-1 font-medium" style={{ color: '#92400E' }}>
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      {entry.duration && (
                        <span className="ml-2 bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full">
                          [{(entry.duration / 60).toFixed(1)}h]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show placeholder if no items */}
                {daySchedules.length === 0 && dayTimeEntries.length === 0 && (
                  <div className="text-gray-400 italic py-3 text-center text-sm sm:text-base md:text-lg bg-gray-50 rounded-lg w-full">
                    {t('schedule.no_events')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="section-heading text-center mb-6">
              {formData.id ? t('schedule.edit_schedule') : t('schedule.add_schedule')}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* 只保留班次选择框 */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shiftTemplate">
                  {t('time_entry.custom_shift.select_shift')} *
                </label>
                <select
                  id="shiftTemplate"
                  value={formData.selectedShift}
                  onChange={(e) => {
                    setFormData({...formData, selectedShift: e.target.value});
                  }}
                  className="shadow appearance-none border-2 border-indigo-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">{t('time_entry.custom_shift.select_placeholder')}</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                      {shift.customDuration && ` [${convertDurationToHours(shift.customDuration).toFixed(1)}h]`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-between">
                <div>
                  {formData.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(formData.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {t('schedule.form.delete')}
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    {t('schedule.form.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {t('schedule.form.save')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="section-heading text-center mb-6">
              {t('time_entry.delete_entry')}
            </h2>
            
            <div className="mb-6">
              <p className="text-gray-700 text-center">
                {t('time_entry.delete_confirm') || '确定要删除这个时间记录吗？'}
              </p>
              {selectedEntry && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <div className="font-bold truncate">{selectedEntry.notes || t('time_entry.entry')}</div>
                  <div className="text-green-600 text-sm mt-1">
                    {formatTime(selectedEntry.startTime)} - {formatTime(selectedEntry.endTime)}
                    {selectedEntry.duration && (
                      <span className="ml-2">
                        [{(selectedEntry.duration / 60).toFixed(1)}h]
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                {t('schedule.form.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteTimeEntry(selectedEntry.id);
                  setShowDeleteModal(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                {t('schedule.form.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    {showReplaceModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="section-heading text-center mb-6">
                  {t('schedule.replace_confirmation')}
                </h2>
                
                <div className="mb-6">
                  <p className="text-gray-700 text-center">
                    {t('schedule.replace_warning') || '该日期已有排班或记录，继续操作将替换现有内容。确定要继续吗？'}
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowReplaceModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {t('schedule.replace')}
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default WeeklyScheduleCalendar;