import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import ScheduleCalendar from '../components/ScheduleCalendar';
import { useTranslation } from 'react-i18next';

const SchedulePage = () => {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedules, setSchedules] = useState([]);

  // Load schedules from localStorage on component mount
  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    setSchedules(savedSchedules);
  }, []);

  // Get week dates
  const getWeekDates = (date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

  // Navigate weeks
  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Get schedule for a specific date
  const getScheduleForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    // Find existing schedule for this week
    let schedule = schedules.find(s => s.weekStartDate === weekStart);
    
    // If no schedule exists for this week, create a new one
    if (!schedule) {
      schedule = {
        id: Date.now().toString(),
        weekStartDate: weekStart,
        days: weekDates.map(d => ({
          date: format(d, 'yyyy-MM-dd'),
          tasks: []
        }))
      };
    }
    
    // Ensure all days are present in the schedule
    const updatedDays = weekDates.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const existingDay = schedule.days.find(d => d.date === dayStr);
      return existingDay || { date: dayStr, tasks: [] };
    });
    
    return { ...schedule, days: updatedDays };
  };

  const [currentSchedule, setCurrentSchedule] = useState(getScheduleForDate(currentWeek));

  // Update schedule in state and localStorage
  const updateSchedule = (updatedSchedule) => {
    // Update schedules array
    const updatedSchedules = schedules.filter(s => s.weekStartDate !== updatedSchedule.weekStartDate);
    updatedSchedules.push(updatedSchedule);
    setSchedules(updatedSchedules);
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
    
    // Update current schedule
    setCurrentSchedule(updatedSchedule);
  };

  // Handle date navigation
  useEffect(() => {
    setCurrentSchedule(getScheduleForDate(currentWeek));
  }, [currentWeek]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('schedule.title')}</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPreviousWeek}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {t('schedule.previous_week')}
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
            </h2>
            <button
              onClick={goToToday}
              className="text-indigo-600 hover:text-indigo-800 text-sm mt-1"
            >
              {t('schedule.today')}
            </button>
          </div>
          
          <button
            onClick={goToNextWeek}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {t('schedule.next_week')}
          </button>
        </div>
        
        <ScheduleCalendar 
          weekDates={weekDates} 
          schedule={currentSchedule}
          onUpdateSchedule={updateSchedule}
        />
      </div>
    </div>
  );
};

export default SchedulePage;