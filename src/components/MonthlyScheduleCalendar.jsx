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
    <div className="bg-white rounded-lg shadow p-1 sm:p-2 md:p-4">
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {/* Weekday headers */}
        {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => (
          <div key={day} className="text-center font-bold text-gray-600 py-1 sm:py-2 text-xs sm:text-sm">
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
          
          // Determine background color based on the first schedule item
          let dayBackgroundColor = '';
          let dayBorderColor = '';
          if (daySchedules.length > 0) {
            const firstSchedule = daySchedules[0];
            const shiftInfo = shifts.find(shift => shift.id === firstSchedule.selectedShift);
            const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
            dayBackgroundColor = getShiftBackgroundColor(shiftType);
            dayBorderColor = getShiftColor(shiftType);
          }
          
          return (
            <div 
              key={index} 
              className={`min-h-16 sm:min-h-20 md:min-h-24 border rounded-sm sm:rounded p-0.5 sm:p-1 md:p-2 flex flex-col ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              style={daySchedules.length > 0 ? {
                backgroundColor: dayBackgroundColor
              } : {}}
            >
              <div className={`text-right text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                isToday ? 'text-blue-600' : daySchedules.length > 0 ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {format(day, 'd', { locale: zhCN })}
              </div>
              
              <div className="space-y-0.5 sm:space-y-1 flex-grow">
                {allItems.slice(0, 3).map((item) => {
                  // 获取班次信息（如果是排班项目）
                  const shiftInfo = item.itemType === 'schedule' ? 
                    shifts.find(shift => shift.id === item.selectedShift) : null;
                  const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`text-[0.6rem] sm:text-xs p-0.5 sm:p-1 rounded truncate ${
                        item.itemType === 'schedule' 
                          ? 'bg-white bg-opacity-50 text-gray-800' 
                          : 'bg-white bg-opacity-70 text-gray-800'
                      }`}
                    >
                      <div className="font-bold truncate text-[0.6rem] sm:text-xs">{item.title}</div>
                    </div>
                  );
                })}
                
                {allItems.length > 3 && (
                  <div className="text-[0.5rem] sm:text-xs text-gray-700">
                    +{allItems.length - 3}
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