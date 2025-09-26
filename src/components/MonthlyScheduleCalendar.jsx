import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor';

const MonthlyScheduleCalendar = ({ currentDate, onDateChange }) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [shifts, setShifts] = useState([]);

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

  // Get all days to display in the month view
  const getCalendarDays = (date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday as start of week
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days = [];
    let day = calendarStart;
    
    while (day <= calendarEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    
    return days;
  };

  const calendarDays = getCalendarDays(currentDate);

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

  // Get week number for a date
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="bg-white rounded-lg shadow p-2 md:p-6">
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {/* Weekday headers */}
        {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => (
          <div key={day} className="text-center font-bold text-gray-600 py-2 text-xs md:text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const daySchedules = getScheduleForDate(day);
          const dayTimeEntries = getTimeEntriesForDate(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          // Combine schedules and time entries for display
          const allItems = [
            ...daySchedules.map(item => ({...item, itemType: 'schedule'})),
            ...dayTimeEntries.map(item => ({...item, itemType: 'entry'}))
          ];
          
          return (
            <div 
              key={index} 
              className={`min-h-20 md:min-h-24 border rounded p-1 md:p-2 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
            >
              <div className={`text-right text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {format(day, 'd', { locale: zhCN })}
              </div>
              
              <div className="space-y-1">
                {allItems.slice(0, 2).map((item) => {
                  // 获取班次信息（如果是排班项目）
                  const shiftInfo = item.itemType === 'schedule' ? 
                    shifts.find(shift => shift.id === item.selectedShift) : null;
                  const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`text-xs p-1 rounded truncate ${
                        item.itemType === 'schedule' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-green-100 text-green-800'
                      }`}
                      style={item.itemType === 'schedule' ? {
                        backgroundColor: getShiftBackgroundColor(shiftType),
                        borderLeft: `2px solid ${getShiftColor(shiftType)}`
                      } : {}}
                    >
                      <div className="font-bold truncate">{item.title}</div>
                      <div className={
                        item.itemType === 'schedule' 
                          ? 'text-indigo-600' 
                          : 'text-green-600'
                      }>
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </div>
                    </div>
                  );
                })}
                
                {allItems.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{allItems.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyScheduleCalendar;