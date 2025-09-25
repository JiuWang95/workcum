import React, { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import WeeklyScheduleCalendar from '../components/WeeklyScheduleCalendar';
import { useTranslation } from 'react-i18next';

const SchedulePage = () => {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Navigate weeks
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Get week range for display
  const getWeekRange = (date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="page-heading">{t('schedule.title')}</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPreviousWeek}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {t('schedule.previous_week')}
          </button>
          
          <div className="text-center">
            <h2 className="section-heading">
              {getWeekRange(currentWeek)}
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
        
        <WeeklyScheduleCalendar 
          currentDate={currentWeek}
          onDateChange={setCurrentWeek}
        />
      </div>
    </div>
  );
};

export default SchedulePage;