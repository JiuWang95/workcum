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
    <div className="bg-white rounded-lg shadow p-1 hide-scrollbar mt-1">
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {/* Weekday headers */}
        {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
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
            <div 
              key={index} 
              className={`min-h-16 sm:min-h-20 md:min-h-24 border rounded-sm sm:rounded p-0.5 sm:p-1 md:p-2 flex flex-col ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              style={daySchedules.length > 0 ? {
                backgroundColor: dayBackgroundColor
              } : {}}
            >
              <div className={`text-right pr-1 sm:pr-2 ${isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                <span className="text-xs sm:text-sm md:text-base">{format(day, 'd', { locale: zhCN })}</span>
              </div>
              
              <div className="flex-1 overflow-hidden relative">
                {/* Diagonal split display for multiple items */}
                {(daySchedules.length + dayTimeEntries.length) >= 2 ? (
                  <div className="absolute inset-0 flex">
                    {/* First item (schedule) */}
                    {daySchedules.length > 0 ? (
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
                      // First item (time entry)
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
                    )}
                    
                    {/* Second item (time entry or additional schedule) */}
                    {dayTimeEntries.length > 0 ? (
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
                    ) : null}
                  </div>
                ) : (
                  // Single item display
                  <>
                    {/* Display schedules */}
                    {daySchedules.slice(0, 1).map((schedule) => {
                      const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
                      const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
                      const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
                      
                      return (
                        <div 
                          key={schedule.id}
                          className="text-[0.7rem] sm:text-sm md:text-base truncate mb-0.5 p-0.5 rounded"
                          style={{
                            backgroundColor: getShiftBackgroundColor(shiftType)
                          }}
                        >
                          <span className="font-bold">{shiftName}</span>
                        </div>
                      );
                    })}
                    
                    {/* Display time entries */}
                    {dayTimeEntries.slice(0, 1).map((entry) => {
                      return (
                        <div 
                          key={entry.id}
                          className="text-[0.7rem] sm:text-sm md:text-base truncate mb-0.5 p-0.5 rounded"
                          style={{
                            backgroundColor: '#fed7aa' // orange-200 equivalent
                          }}
                        >
                          <span className="font-bold">{entry.notes || t('time_entry.entry')}</span>
                        </div>
                      );
                    })}
                  </>
                )}
                
                {(daySchedules.length + dayTimeEntries.length) > 2 && (
                  <div className="text-[0.5rem] sm:text-xs md:text-sm text-gray-500 truncate relative z-10">
                    +{(daySchedules.length + dayTimeEntries.length) - 2} {t('schedule.more_items')}
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