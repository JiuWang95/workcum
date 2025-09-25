import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  getDaysInMonth
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor'; // 导入颜色工具函数

const MonthlyScheduleCalendar = ({ currentDate, onDateChange }) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [shifts, setShifts] = useState([]); // Add shifts state
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    notes: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    selectedShift: '' // Add selectedShift to form data
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

  // Get all days to display in the calendar (including days from previous/next months)
  const getCalendarDays = (date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    
    return days;
  };

  const calendarDays = getCalendarDays(currentDate);

  const handleDateClick = (date) => {
    // Load custom shifts from localStorage
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    setSelectedDate(date);
    setFormData({
      id: null,
      title: '',
      notes: '',
      date: format(date, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      selectedShift: '' // Add selectedShift to form data
    });
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setSelectedDate(new Date(schedule.date));
    setFormData(schedule);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(t('schedule.delete_confirm'))) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.title.trim() === '') {
      alert(t('schedule.validation.title_required'));
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      alert(t('schedule.validation.end_time_after_start'));
      return;
    }
    
    const newSchedule = {
      ...formData,
      id: formData.id || Date.now()
    };
    
    if (formData.id) {
      // Update existing schedule
      setSchedules(schedules.map(schedule => 
        schedule.id === formData.id ? newSchedule : schedule
      ));
    } else {
      // Add new schedule
      setSchedules([...schedules, newSchedule]);
    }
    
    setShowModal(false);
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
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="grid grid-cols-7 gap-1 mb-2 md:mb-4">
        {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
          <div key={index} className="text-center font-semibold text-gray-700 py-1 md:py-2 text-xs md:text-sm">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const daySchedules = getScheduleForDate(day);
          const dayTimeEntries = getTimeEntriesForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          // Limit the number of items displayed on mobile
          const maxItemsMobile = 1;
          const maxItemsDesktop = 2;
          const isMobile = window.innerWidth < 768;
          const maxItems = isMobile ? maxItemsMobile : maxItemsDesktop;
          
          const totalItems = daySchedules.length + dayTimeEntries.length;
          const showItems = Math.min(totalItems, maxItems);
          const hasMoreItems = totalItems > maxItems;
          
          return (
            <div 
              key={index} 
              className={`min-h-16 md:min-h-24 border rounded p-1 md:p-2 cursor-pointer ${
                isToday ? 'bg-blue-50 border-blue-300' : isCurrentMonth ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
              }`}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-xs md:text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {format(day, 'd', { locale: zhCN })}
              </div>
              
              <div className="space-y-0.5 md:space-y-1">
                {/* Display schedules */}
                {daySchedules.slice(0, maxItems).map((schedule) => {
                  // 获取班次信息
                  const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
                  const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
                  // 检查是否为跨日期班次
                  const isOvernight = shiftInfo ? shiftInfo.isOvernight : false;
                  
                  return (
                    <div 
                      key={schedule.id} 
                      className="text-sm font-semibold p-1 rounded truncate"
                      style={{
                        backgroundColor: getShiftBackgroundColor(shiftName),
                        borderLeft: `2px solid ${getShiftColor(shiftName)}`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(schedule);
                      }}
                    >
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: getShiftColor(shiftName) }}
                        ></span>
                        <span className="font-bold truncate">{shiftName}</span>
                        {isOvernight && (
                          <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {t('time_entry.custom_shift.overnight_shift')}
                          </span>
                        )}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: getShiftColor(shiftName) }}
                      >
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </div>
                    </div>
                  );
                })}
                
                {/* Display time entries if no schedules or space available */}
                {daySchedules.length < maxItems && dayTimeEntries.slice(0, maxItems - daySchedules.length).map((entry) => (
                  <div 
                    key={entry.id} 
                    className="text-sm font-semibold bg-green-100 text-green-800 p-1 rounded truncate"
                  >
                    <div className="font-bold truncate">{entry.notes || t('time_entry.entry')}</div>
                    <div className="text-green-600 text-xs">
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                    </div>
                  </div>
                ))}
                
                {/* Show count if there are more items */}
                {hasMoreItems && (
                  <div className="text-xs text-gray-500">
                    +{totalItems - maxItems} more
                  </div>
                )}
                
                {/* Show placeholder if no items */}
                {totalItems === 0 && (
                  <div className="flex justify-center items-center h-4 md:h-6">
                    <span className="text-gray-400 text-base md:text-lg font-bold">+</span>
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
            <h2 className="section-heading">
              {formData.id ? t('schedule.edit_schedule') : t('schedule.add_schedule')}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Shift template selector */}
              {shifts.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shiftTemplate">
                    {t('time_entry.custom_shift.select_shift')}
                  </label>
                  <select
                        id="shiftTemplate"
                        value={formData.selectedShift}
                        onChange={(e) => {
                          const shiftId = e.target.value;
                          const newFormData = {...formData, selectedShift: shiftId};
                          
                          if (shiftId) {
                            const shift = shifts.find(s => s.id === shiftId);
                            if (shift) {
                              newFormData.title = shift.name;
                              newFormData.startTime = shift.startTime;
                              newFormData.endTime = shift.endTime;
                              newFormData.notes = shift.name;
                            }
                          }
                          
                          setFormData(newFormData);
                        }}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                    <option value="">{t('time_entry.custom_shift.select_placeholder')}</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                        {shift.customDuration && ` [${shift.customDuration}]`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  {t('schedule.form.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={t('schedule.form.title_placeholder')}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  {t('schedule.form.date')}
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
                    {t('schedule.form.start_time')}
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
                    {t('schedule.form.end_time')}
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                  {t('schedule.form.notes')}
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={t('schedule.form.notes_placeholder')}
                  rows="3"
                />
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

export default MonthlyScheduleCalendar;