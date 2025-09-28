import React, { useState, useEffect } from 'react';
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor'; // 导入颜色工具函数

const CalendarDay = ({ day, isCurrentMonth, isToday: isTodayProp, daySchedules, dayTimeEntries, shifts, dayBackgroundColor, t, getShiftBackgroundColor }) => {
  // Render single schedule or time entry
  const renderSingleItem = () => {
    if (daySchedules.length > 0) {
      const schedule = daySchedules[0];
      const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
      const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
      
      // 获取班次类型和背景色
      const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
      const bgColor = getShiftBackgroundColor(shiftType);
      
      // 处理班次名称在移动端的显示
      const displayShiftName = shiftName ? shiftName : t('time_entry.entry');
      const truncatedShiftName = displayShiftName.length > 8 ? 
        displayShiftName.substring(0, 6) + '...' : displayShiftName;
      
      return (
        <div 
          className="text-[0.6rem] sm:text-xs md:text-sm p-0.5 sm:p-1 rounded-lg sm:rounded-lg h-full flex items-center justify-center leading-tight"
          style={{ background: `linear-gradient(135deg, ${bgColor}, ${getShiftColor(shiftType)}20)` }}
        >
          <div className="font-bold text-center truncate w-full px-0.5">
            {truncatedShiftName}
          </div>
        </div>
      );
    } else if (dayTimeEntries.length > 0) {
      const entry = dayTimeEntries[0];
      // 处理时间条目名称在移动端的显示
      const displayEntryName = entry.notes ? entry.notes : t('time_entry.entry');
      const truncatedEntryName = displayEntryName.length > 8 ? 
        displayEntryName.substring(0, 6) + '...' : displayEntryName;
      
      return (
        <div 
          className="text-[0.6rem] sm:text-xs md:text-sm p-0.5 sm:p-1 rounded-lg sm:rounded-lg h-full flex items-center justify-center leading-tight"
          style={{ background: 'linear-gradient(135deg, #fed7aa, #f9731620)' }}
        >
          <div className="font-bold text-center text-orange-800 truncate w-full px-0.5">
            {truncatedEntryName}
          </div>
        </div>
      );
    }
    return null;
  };

  // Render multiple schedules or time entries with diagonal split
  const renderMultipleItems = () => {
    // First item (schedule or time entry)
    const firstItem = daySchedules.length > 0 ? (
      (() => {
        const firstSchedule = daySchedules[0];
        const shiftInfo = shifts.find(shift => shift.id === firstSchedule.selectedShift);
        const shiftName = shiftInfo ? shiftInfo.name : firstSchedule.title;
        
        // 获取第一个排班的背景色
        const firstShiftType = shiftInfo ? shiftInfo.shiftType : 'day';
        const firstBgColor = getShiftBackgroundColor(firstShiftType);
        
        // 处理班次名称在移动端的显示
        const displayShiftName = shiftName ? shiftName : t('time_entry.entry');
        const truncatedShiftName = displayShiftName.length > 6 ? 
          displayShiftName.substring(0, 4) + '..' : displayShiftName;
        
        return (
          <div 
            className="text-[0.5rem] sm:text-[0.6rem] md:text-xs p-0.5 sm:p-1 rounded-lg sm:rounded-lg absolute inset-0 shadow-sm flex items-center justify-center leading-tight"
            style={{
              background: `linear-gradient(135deg, ${firstBgColor}, ${getShiftColor(firstShiftType)}20)`
            }}
          >
            <div className="font-bold text-center truncate w-full px-0.5">
              {truncatedShiftName}
            </div>
          </div>
        );
      })()
    ) : dayTimeEntries.length > 0 ? (
      // 处理时间条目名称在移动端的显示
      (() => {
        const displayEntryName = dayTimeEntries[0].notes ? dayTimeEntries[0].notes : t('time_entry.entry');
        const truncatedEntryName = displayEntryName.length > 6 ? 
          displayEntryName.substring(0, 4) + '..' : displayEntryName;
        
        return (
          <div 
            className="text-[0.5rem] sm:text-[0.6rem] md:text-xs p-0.5 sm:p-1 rounded-lg sm:rounded-lg absolute inset-0 shadow-sm flex items-center justify-center leading-tight"
            style={{ background: 'linear-gradient(135deg, #fed7aa, #f9731620)' }}
          >
            <div className="font-bold text-center text-orange-800 truncate w-full px-0.5">
              {truncatedEntryName}
            </div>
          </div>
        );
      })()
    ) : null;
    
    // Second item (schedule or time entry)
    const secondItem = daySchedules.length > 1 ? (
      (() => {
        const secondSchedule = daySchedules[1];
        const shiftInfo = shifts.find(shift => shift.id === secondSchedule.selectedShift);
        const shiftName = shiftInfo ? shiftInfo.name : secondSchedule.title;
        
        // 获取第二个排班的背景色
        const secondShiftType = shiftInfo ? shiftInfo.shiftType : 'day';
        const secondBgColor = getShiftBackgroundColor(secondShiftType);
        
        // 处理班次名称在移动端的显示
        const displayShiftName = shiftName ? shiftName : t('time_entry.entry');
        const truncatedShiftName = displayShiftName.length > 4 ? 
          displayShiftName.substring(0, 3) + '.' : displayShiftName;
        
        return (
          <div 
            className="text-[0.4rem] sm:text-[0.5rem] md:text-[0.6rem] p-0.5 sm:p-1 rounded-lg sm:rounded-lg absolute bottom-0 right-0 shadow-sm flex items-center justify-center leading-tight"
            style={{
              background: `linear-gradient(135deg, ${secondBgColor}, ${getShiftColor(secondShiftType)}20)`,
              width: '50%',
              height: '50%'
            }}
          >
            <div className="font-bold text-center truncate w-full px-0.5">
              {truncatedShiftName}
            </div>
          </div>
        );
      })()
    ) : dayTimeEntries.length > 0 && daySchedules.length === 0 ? (
      // 处理时间条目名称在移动端的显示
      (() => {
        const displayEntryName = dayTimeEntries[0].notes ? dayTimeEntries[0].notes : t('time_entry.entry');
        const truncatedEntryName = displayEntryName.length > 4 ? 
          displayEntryName.substring(0, 3) + '.' : displayEntryName;
        
        return (
          <div 
            className="text-[0.4rem] sm:text-[0.5rem] md:text-[0.6rem] p-0.5 sm:p-1 rounded-lg sm:rounded-lg absolute bottom-0 right-0 shadow-sm flex items-center justify-center leading-tight"
            style={{ 
              background: 'linear-gradient(135deg, #fed7aa, #f9731620)',
              width: '50%',
              height: '50%'
            }}
          >
            <div className="font-bold text-center text-orange-800 truncate w-full px-0.5">
              {truncatedEntryName}
            </div>
          </div>
        );
      })()
    ) : dayTimeEntries.length > 1 ? (
      // 处理第二个时间条目名称在移动端的显示
      (() => {
        const displayEntryName = dayTimeEntries[1].notes ? dayTimeEntries[1].notes : t('time_entry.entry');
        const truncatedEntryName = displayEntryName.length > 4 ? 
          displayEntryName.substring(0, 3) + '.' : displayEntryName;
        
        return (
          <div 
            className="text-[0.4rem] sm:text-[0.5rem] md:text-[0.6rem] p-0.5 sm:p-1 rounded-lg sm:rounded-lg absolute bottom-0 right-0 shadow-sm flex items-center justify-center leading-tight"
            style={{ 
              background: 'linear-gradient(135deg, #fed7aa, #f9731620)',
              width: '50%',
              height: '50%'
            }}
          >
            <div className="font-bold text-center text-orange-800 truncate w-full px-0.5">
              {truncatedEntryName}
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
    <div className={`rounded-lg p-0.5 sm:p-1 flex flex-col transition-all duration-200 hover:shadow-md active:scale-95 min-h-16 sm:min-h-20 md:min-h-24 lg:min-h-28 ${
      isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
    } ${isTodayProp ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-300 shadow-sm' : ''}`}
      style={daySchedules.length > 0 || dayTimeEntries.length > 0 ? { backgroundColor: dayBackgroundColor } : {}}
    >
      <div className={`text-right ${isTodayProp ? 'bg-blue-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ml-auto text-[10px] sm:text-xs' : ''}`}>
        <span className="font-bold">{format(day, 'd', { locale: zhCN })}</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative mt-0.5 sm:mt-1">
        {/* 多个项目时使用对角线分割显示 */}
        {(daySchedules.length + dayTimeEntries.length) >= 2 ? 
          renderMultipleItems() : 
          renderSingleItem()
        }
        
        {/* 显示额外项目数量 */}
        {(daySchedules.length + dayTimeEntries.length) > 2 && (
          <div className="text-[0.5rem] sm:text-[0.6rem] md:text-xs text-gray-600 truncate relative z-10 bg-white bg-opacity-80 px-1 py-0.5 rounded-full shadow-sm mt-1">
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
    
    // 添加storage事件监听器
    const handleStorageChange = (e) => {
      if (e.key === 'schedules') {
        try {
          const updatedSchedules = JSON.parse(e.newValue || '[]');
          setSchedules(updatedSchedules);
        } catch (error) {
          console.error('Error parsing schedules from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 在每次打开月历时同步周历数据
  useEffect(() => {
    // 从localStorage获取最新的数据
    const latestSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const latestTimeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const latestShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    // 更新状态
    setSchedules(latestSchedules);
    setTimeEntries(latestTimeEntries);
    setShifts(latestShifts);
  }, [currentDate]);

  // Load time entries from localStorage
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setTimeEntries(savedEntries);
    
    // 添加storage事件监听器
    const handleStorageChange = (e) => {
      if (e.key === 'timeEntries') {
        try {
          const updatedEntries = JSON.parse(e.newValue || '[]');
          setTimeEntries(updatedEntries);
        } catch (error) {
          console.error('Error parsing timeEntries from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load custom shifts from localStorage
  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setShifts(savedShifts);
    
    // 添加storage事件监听器
    const handleStorageChange = (e) => {
      if (e.key === 'customShifts') {
        try {
          const updatedShifts = JSON.parse(e.newValue || '[]');
          setShifts(updatedShifts);
        } catch (error) {
          console.error('Error parsing customShifts from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
    <div className="hide-scrollbar mt-1">
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {/* Weekday headers */}
        {[t('common.weekdays.sunday'), t('common.weekdays.monday'), t('common.weekdays.tuesday'), t('common.weekdays.wednesday'), t('common.weekdays.thursday'), t('common.weekdays.friday'), t('common.weekdays.saturday')].map((day, index) => (
          <div key={index} className="text-center text-xs sm:text-sm md:text-base font-bold text-gray-600 py-1 sm:py-2">
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