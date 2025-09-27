import React, { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, getWeekOfMonth, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import WeeklyScheduleCalendar from '../components/WeeklyScheduleCalendar';
import MonthlyScheduleCalendar from '../components/MonthlyScheduleCalendar';
import { useTranslation } from 'react-i18next';

const SchedulePage = () => {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  // Navigate weeks/months
  const goToPreviousPeriod = () => {
    if (viewMode === 'week') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(subMonths(currentWeek, 1));
    }
  };

  const goToNextPeriod = () => {
    if (viewMode === 'week') {
      setCurrentWeek(addWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addMonths(currentWeek, 1));
    }
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Get week range for display
  const getWeekRange = (date) => {
    const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
    return `${format(date, 'MMM', { locale: zhCN })} ${t('schedule.week_prefix')}${weekOfMonth}${t('schedule.week_suffix')}`;
  };

  // Get month range for display
  const getMonthRange = (date) => {
    return format(date, 'yyyy年 MMMM', { locale: zhCN });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-heading">{t('schedule.title')}</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {t('schedule.week_view')}
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {t('schedule.month_view')}
          </button>
        </div>
      </div>
      
      <div className="p-4 mt-4 mb-1">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={goToPreviousPeriod}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {viewMode === 'week' ? t('schedule.previous_week') : t('schedule.previous_month')}
          </button>
          
          <div className="text-center">
            <h2 className="section-heading">
              {viewMode === 'week' ? getWeekRange(currentWeek) : getMonthRange(currentWeek)}
            </h2>
          </div>
          
          <button
            onClick={goToNextPeriod}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {viewMode === 'week' ? t('schedule.next_week') : t('schedule.next_month')}
          </button>
        </div>
        
        {viewMode === 'week' ? (
          <WeeklyScheduleCalendar 
            currentDate={currentWeek}
            onDateChange={setCurrentWeek}
          />
        ) : (
          <MonthlyScheduleCalendar 
            currentDate={currentWeek}
            onDateChange={setCurrentWeek}
          />
        )}
      </div>
    </div>
  );
};

export default SchedulePage;