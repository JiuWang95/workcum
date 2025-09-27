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
    const month = format(date, 'M', { locale: zhCN });
return `${month}月 ${t('schedule.week_prefix')}${weekOfMonth}${t('schedule.week_suffix')}`;
  };

  // Get month range for display
  const getMonthRange = (date) => {
    const year = format(date, 'yyyy', { locale: zhCN });
    const month = format(date, 'MM', { locale: zhCN });
    return `${year}年${parseInt(month)}月`;
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-1 sm:px-2">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="page-heading">{t('schedule.title')}</h1>
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'week' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {t('schedule.week_view')}
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'month' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {t('schedule.month_view')}
          </button>
        </div>
      </div>
      
      <div className="p-0.5 sm:p-1 md:p-2 mt-1 mb-0.5">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <button
            onClick={goToPreviousPeriod}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md text-sm sm:text-base"
          >
            {viewMode === 'week' ? t('schedule.previous_week') : t('schedule.previous_month')}
          </button>
          
          <div className="text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 bg-gradient-to-r from-indigo-50 to-blue-50 px-2 py-1 sm:px-4 sm:py-2 rounded-xl shadow-sm border border-gray-100">
              {viewMode === 'week' ? getWeekRange(currentWeek) : getMonthRange(currentWeek)}
            </h2>
          </div>
          
          <button
            onClick={goToNextPeriod}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md text-sm sm:text-base"
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
          <div className="w-full overflow-x-auto -mx-1 sm:-mx-2 md:mx-0">
            <div className="min-w-full md:min-w-0">
              <MonthlyScheduleCalendar 
                currentDate={currentWeek}
                onDateChange={setCurrentWeek}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;