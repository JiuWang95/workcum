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
      
      // 将班次名称拆分为单个字符并垂直排列
      const shiftNameChars = shiftName.split('');
      
      return (
        <div 
          className="text-xs sm:text-sm md:text-base mb-1 p-1 rounded-lg shadow-sm flex flex-col items-center justify-center h-full"
          style={{
            background: `linear-gradient(135deg, ${getShiftBackgroundColor(shiftType)}, ${getShiftColor(shiftType)}20)`
          }}
        >
          <div className="font-bold flex flex-col items-center">
            {shiftNameChars.map((char, index) => (
              <span key={index} className="leading-none">{char}</span>
            ))}
          </div>
        </div>
      );
    }
    
    // 显示时间记录
    if (dayTimeEntries.length > 0) {
      const entry = dayTimeEntries[0];
      const entryText = entry.notes || t('time_entry.entry');
      
      // 将时间记录文本拆分为单个字符并垂直排列
      const entryTextChars = entryText.split('');
      
      return (
        <div 
          className="text-xs sm:text-sm md:text-base mb-1 p-1 rounded-lg shadow-sm flex flex-col items-center justify-center h-full"
          style={{
            background: 'linear-gradient(135deg, #fed7aa, #fdba74)'
          }}
        >
          <div className="font-bold flex flex-col items-center">
            {entryTextChars.map((char, index) => (
              <span key={index} className="leading-none">{char}</span>
            ))}
          </div>
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
        
        // 将班次名称拆分为单个字符并垂直排列
        const shiftNameChars = shiftName.split('');
        
        return (
          <div 
            className="w-full h-full flex items-start justify-start p-1 rounded-lg shadow-sm"
            style={{
              background: `linear-gradient(to bottom right, ${bgColor} 50%, ${dayTimeEntries.length > 0 ? '#fed7aa' : bgColor} 50%)`
            }}
          >
            <div className="text-xs sm:text-sm md:text-base p-1 rounded-lg bg-white bg-opacity-90 font-bold flex flex-col items-center justify-center h-full">
              <div className="font-bold flex flex-col items-center">
                {shiftNameChars.map((char, index) => (
                  <span key={index} className="leading-none">{char}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })()
    ) : (
      // 第一个项目（时间记录）
      dayTimeEntries.length > 0 && (
        <div 
          className="w-full h-full flex items-start justify-start p-1 rounded-lg shadow-sm"
          style={{
            background: `linear-gradient(to bottom right, #fed7aa 50%, #fdba74 50%)`
          }}
        >
          <div className="text-xs sm:text-sm md:text-base p-1 rounded-lg bg-white bg-opacity-90 font-bold flex flex-col items-center justify-center h-full">
            <div className="font-bold flex flex-col items-center">
              {dayTimeEntries[0].notes ? dayTimeEntries[0].notes.split('').map((char, index) => (
                <span key={index} className="leading-none">{char}</span>
              )) : <span>{t('time_entry.entry')}</span>}
            </div>
          </div>
        </div>
      )
    );
    
    // 第二个项目（时间记录或额外排班）
    const secondItem = dayTimeEntries.length > 0 ? (
      <div 
        className="text-xs sm:text-sm md:text-base p-1 rounded-lg absolute bottom-0 right-0 shadow-sm flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #fed7aa, #fdba74)'
        }}
      >
        <div className="font-bold flex flex-col items-center">
          {dayTimeEntries[0].notes ? dayTimeEntries[0].notes.split('').map((char, index) => (
            <span key={index} className="leading-none">{char}</span>
          )) : <span>{t('time_entry.entry')}</span>}
        </div>
      </div>
    ) : daySchedules.length > 1 ? (
      (() => {
        const secondSchedule = daySchedules[1];
        const shiftInfo = shifts.find(shift => shift.id === secondSchedule.selectedShift);
        const shiftName = shiftInfo ? shiftInfo.name : secondSchedule.title;
        
        // 获取第二个排班的背景色
        const secondShiftType = shiftInfo ? shiftInfo.shiftType : 'day';
        const secondBgColor = getShiftBackgroundColor(secondShiftType);
        
        // 将班次名称拆分为单个字符并垂直排列
        const shiftNameChars = shiftName.split('');
        
        return (
          <div 
            className="text-xs sm:text-sm md:text-base p-1 rounded-lg absolute bottom-0 right-0 shadow-sm flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${secondBgColor}, ${getShiftColor(secondShiftType)}20)`
            }}
          >
            <div className="font-bold flex flex-col items-center">
              {shiftNameChars.map((char, index) => (
                <span key={index} className="leading-none">{char}</span>
              ))}
            </div>
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
      className={`min-h-24 sm:min-h-28 md:min-h-32 border rounded-lg p-1 sm:p-2 md:p-3 flex flex-col transition-all duration-200 hover:shadow-md ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
      } ${isTodayProp ? 'border-blue-500 border-2 shadow-sm' : 'border-gray-200'}`}
      style={daySchedules.length > 0 ? { backgroundColor: dayBackgroundColor } : {}}
    >
      <div className={`text-right ${isTodayProp ? 'bg-blue-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center ml-auto' : ''}`}>
        <span className="text-sm sm:text-base md:text-lg font-bold">{format(day, 'd', { locale: zhCN })}</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {/* 多个项目时使用对角线分割显示 */}
        {(daySchedules.length + dayTimeEntries.length) >= 2 ? 
          renderMultipleItems() : 
          renderSingleItem()
        }
        
        {/* 显示额外项目数量 */}
        {(daySchedules.length + dayTimeEntries.length) > 2 && (
          <div className="text-[0.6rem] sm:text-xs md:text-sm text-gray-600 truncate relative z-10 bg-white bg-opacity-80 px-1.5 py-0.5 rounded-full shadow-sm">
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
    <div className="bg-white rounded-xl shadow-lg p-2 sm:p-3 md:p-4 hide-scrollbar mt-2">
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Weekday headers */}
        {[t('common.weekdays.sunday'), t('common.weekdays.monday'), t('common.weekdays.tuesday'), t('common.weekdays.wednesday'), t('common.weekdays.thursday'), t('common.weekdays.friday'), t('common.weekdays.saturday')].map((day, index) => (
          <div key={index} className="text-center text-sm sm:text-base md:text-lg font-bold text-gray-600 py-2 sm:py-3 bg-gradient-to-b from-gray-50 to-white rounded-lg shadow-sm">
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