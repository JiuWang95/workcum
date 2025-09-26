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
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    date: '',
    selectedShift: '' // 只保留班次选择
  });

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

  // Load custom shifts from localStorage
  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setShifts(savedShifts);
  }, []);

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

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
    <div className="bg-white rounded-lg shadow p-1 sm:p-2 md:p-4">
      {/* Week view: Each date occupies a separate row with vertical arrangement */}
      <div className="space-y-1 sm:space-y-2 md:space-y-3">
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
              className={`border rounded-md p-1.5 sm:p-2 md:p-3 cursor-pointer ${
                isToday ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
              }`}
              onClick={() => handleDateClick(day)}
            >
              {/* Date header */}
              <div className={`text-xs sm:text-sm md:text-base font-medium mb-1 sm:mb-2 flex items-center ${
                isToday ? 'text-blue-600' : 'text-gray-700'
              }`}>
                <span className="mr-1 font-bold">{format(day, 'EEE', { locale: zhCN })}</span>
                <span className="text-sm sm:text-base md:text-lg">{format(day, 'd', { locale: zhCN })}</span>
                <span className="ml-1 text-[0.6rem] sm:text-xs">{format(day, 'MMMM', { locale: zhCN })}</span>
              </div>
              
              {/* Vertical arrangement of schedules and time entries */}
              <div className="space-y-0.5 sm:space-y-1">
                {/* Display schedules */}
                {daySchedules.map((schedule) => {
                  // 获取班次信息
                  const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
                  const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
                  // 获取班次类型
                  const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
                  
                  return (
                    <div 
                      key={schedule.id} 
                      className="text-[0.6rem] sm:text-xs md:text-sm font-semibold p-1.5 sm:p-2 rounded-md"
                      style={{
                        backgroundColor: getShiftBackgroundColor(shiftType),
                        borderLeft: `2px solid ${getShiftColor(shiftType)}`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(schedule);
                      }}
                    >
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1"
                          style={{ backgroundColor: getShiftColor(shiftType) }}
                        ></span>
                        <span className="font-bold truncate text-[0.6rem] sm:text-xs">{shiftName}</span>
                        {shiftType === 'overnight' && (
                          <span className="ml-1 inline-flex items-center px-0.5 py-0 rounded-full text-[0.5rem] sm:text-[0.6rem] font-medium bg-red-100 text-red-800">
                            {t('time_entry.custom_shift.overnight_shift')}
                          </span>
                        )}
                        {shiftType === 'rest' && (
                          <span className="ml-1 inline-flex items-center px-0.5 py-0 rounded-full text-[0.5rem] sm:text-[0.6rem] font-medium bg-green-100 text-green-800">
                            {t('time_entry.custom_shift.rest_day')}
                          </span>
                        )}
                      </div>
                      <div 
                        className="text-[0.5rem] sm:text-[0.6rem] mt-0.5"
                        style={{ color: getShiftColor(shiftType) }}
                      >
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        {schedule.selectedShift && shifts.find(s => s.id === schedule.selectedShift)?.customDuration && (
                          <span className="ml-1">
                            [{convertDurationToHours(shifts.find(s => s.id === schedule.selectedShift).customDuration).toFixed(1)}h]
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Display time entries */}
                {dayTimeEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="text-[0.6rem] sm:text-xs md:text-sm font-semibold bg-green-100 text-green-800 p-1.5 sm:p-2 rounded-md"
                  >
                    <div className="font-bold truncate text-[0.6rem] sm:text-xs">{entry.notes || t('time_entry.entry')}</div>
                    <div className="text-green-600 text-[0.5rem] sm:text-[0.6rem] mt-0.5">
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      {entry.duration && (
                        <span className="ml-1">
                          [{(entry.duration / 60).toFixed(1)}h]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show placeholder if no items */}
                {daySchedules.length === 0 && dayTimeEntries.length === 0 && (
                  <div className="text-gray-400 italic py-1 text-center text-[0.6rem] sm:text-xs">
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
    </div>
  );
};

export default WeeklyScheduleCalendar;