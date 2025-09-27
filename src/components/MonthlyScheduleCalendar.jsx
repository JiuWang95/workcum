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
  subMonths,
  isToday
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor';

// CalendarDay 组件用于渲染单个日期单元格
const CalendarDay = ({ 
  day, 
  isCurrentMonth, 
  isToday: isTodayProp, 
  daySchedules, 
  dayTimeEntries, 
  shifts, 
  dayBackgroundColor,
  t,
  getShiftBackgroundColor 
}) => {
  // 渲染单个项目
  const renderSingleItem = () => {
    // 显示排班
    if (daySchedules.length > 0) {
      const schedule = daySchedules[0];
      const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
      const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
      const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
      
      return (
        <div 
          className="text-[0.7rem] sm:text-sm md:text-base truncate mb-0.5 p-0.5 rounded"
          style={{
            backgroundColor: getShiftBackgroundColor(shiftType)
          }}
        >
          <span className="font-bold">{shiftName}</span>
        </div>
      );
    }
    
    // 显示时间记录
    if (dayTimeEntries.length > 0) {
      const entry = dayTimeEntries[0];
      return (
        <div 
          className="text-[0.7rem] sm:text-sm md:text-base truncate mb-0.5 p-0.5 rounded"
          style={{
            backgroundColor: '#fed7aa' // orange-200 equivalent
          }}
        >
          <span className="font-bold">{entry.notes || t('time_entry.entry')}</span>
        </div>
      );
    }
    
    return null;
  };

  // 渲染多个项目时的对角线分割显示
  const renderMultipleItems = () => {
    // 第一个项目（排班）
    const firstItem = daySchedules.length > 0 ? (
      (() => {
        const firstSchedule = daySchedules[0];
        const shiftInfo = shifts.find(shift => shift.id === firstSchedule.selectedShift);
        const shiftName = shiftInfo ? shiftInfo.name : firstSchedule.title;
        const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
        const bgColor = getShiftBackgroundColor(shiftType);
        
        return (
          <div 
            className="w-full h-full flex items-start justify-start p-0.5 rounded truncate"
            style={{
              background: `linear-gradient(to bottom right, ${bgColor} 50%, ${dayTimeEntries.length > 0 ? '#fed7aa' : bgColor} 50%)`
            }}
          >
            <div className="text-[0.7rem] sm:text-sm md:text-base truncate p-0.5 rounded bg-white bg-opacity-80">
              <span className="font-bold">{shiftName}</span>
            </div>
          </div>
        );
      })()
    ) : (
      // 第一个项目（时间记录）
      dayTimeEntries.length > 0 && (
        <div 
          className="w-full h-full flex items-start justify-start p-0.5 rounded truncate"
          style={{
            background: `linear-gradient(to bottom right, #fed7aa 50%, #fed7aa 50%)`
          }}
        >
          <div className="text-[0.7rem] sm:text-sm md:text-base truncate p-0.5 rounded bg-white bg-opacity-80">
            <span className="font-bold">{dayTimeEntries[0].notes || t('time_entry.entry')}</span>
          </div>
        </div>
      )
    );
    
    // 第二个项目（时间记录或额外排班）
    const secondItem = dayTimeEntries.length > 0 ? (
      <div 
        className="text-[0.7rem] sm:text-sm md:text-base truncate p-0.5 rounded absolute bottom-0 right-0"
        style={{
          backgroundColor: '#fed7aa' // orange-200 equivalent
        }}
      >
        <span className="font-bold">{dayTimeEntries[0].notes || t('time_entry.entry')}</span>
      </div>
    ) : daySchedules.length > 1 ? (
      (() => {
        const secondSchedule = daySchedules[1];
        const shiftInfo = shifts.find(shift => shift.id === secondSchedule.selectedShift);
        const shiftName = shiftInfo ? shiftInfo.name : secondSchedule.title;
        
        return (
          <div className="text-[0.7rem] sm:text-sm md:text-base truncate p-0.5 rounded absolute bottom-0 right-0 bg-white bg-opacity-80">
            <span className="font-bold">{shiftName}</span>
          </div>
        );
      })()
    ) : null;
    
    return (
      <div className="absolute inset-0 flex">
        {firstItem}
        {secondItem}
      </div>
    );
  };

  return (
    <div 
      className={`min-h-16 sm:min-h-20 md:min-h-24 border rounded-sm sm:rounded p-0.5 sm:p-1 md:p-2 flex flex-col ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
      } ${isTodayProp ? 'border-blue-500 border-2' : 'border-gray-200'}`}
      style={daySchedules.length > 0 ? { backgroundColor: dayBackgroundColor } : {}}
    >
      <div className={`text-right pr-1 sm:pr-2 ${isTodayProp ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
        <span className="text-xs sm:text-sm md:text-base">{format(day, 'd', { locale: zhCN })}</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {/* 多个项目时使用对角线分割显示 */}
        {(daySchedules.length + dayTimeEntries.length) >= 2 ? 
          renderMultipleItems() : 
          renderSingleItem()
        }
        
        {/* 显示额外项目数量 */}
        {(daySchedules.length + dayTimeEntries.length) > 2 && (
          <div className="text-[0.5rem] sm:text-xs md:text-sm text-gray-500 truncate relative z-10">
            +{(daySchedules.length + dayTimeEntries.length) - 2} {t('schedule.more_items')}
          </div>
        )}
      </div>
    </div>
  );
};
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
    <div className="bg-white rounded-lg shadow p-1 hide-scrollbar mt-1">
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {/* Weekday headers */}
        {[t('common.weekdays.sunday'), t('common.weekdays.monday'), t('common.weekdays.tuesday'), t('common.weekdays.wednesday'), t('common.weekdays.thursday'), t('common.weekdays.friday'), t('common.weekdays.saturday')].map((day, index) => (
          <div key={index} className="text-center text-xs sm:text-sm md:text-base font-medium text-gray-500 py-1">
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
          
          // Determine background color based on the first item (schedule or time entry)
          let dayBackgroundColor = '';
          let dayBorderColor = '';
          if (daySchedules.length > 0) {
            // If there are schedules, use the first schedule's color
            const firstSchedule = daySchedules[0];
            const shiftInfo = shifts.find(shift => shift.id === firstSchedule.selectedShift);
            const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
            dayBackgroundColor = getShiftBackgroundColor(shiftType);
            dayBorderColor = getShiftColor(shiftType);
          } else if (dayTimeEntries.length > 0) {
            // If there are only time entries, use orange color
            dayBackgroundColor = '#fed7aa'; // orange-200 equivalent
            dayBorderColor = '#f97316'; // orange-500 equivalent
          }
          
          return (
            <CalendarDay 
              key={index}
              day={day}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              daySchedules={daySchedules}
              dayTimeEntries={dayTimeEntries}
              shifts={shifts}
              dayBackgroundColor={dayBackgroundColor}
              t={t}
              getShiftBackgroundColor={getShiftBackgroundColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyScheduleCalendar;