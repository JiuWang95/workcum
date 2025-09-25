import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, isSameDay } from 'date-fns';
import MonthlyScheduleCalendar from '../components/MonthlyScheduleCalendar';
import CustomShiftManager from '../components/CustomShiftManager';
import { useTranslation } from 'react-i18next';

const SchedulePage = () => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="page-heading">{t('schedule.title')}</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPreviousMonth}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {t('schedule.previous_month')}
          </button>
          
          <div className="text-center">
            <h2 className="section-heading">
              {format(currentMonth, 'yyyy MMMM')}
            </h2>
            <button
              onClick={goToToday}
              className="text-indigo-600 hover:text-indigo-800 text-sm mt-1"
            >
              {t('schedule.today')}
            </button>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {t('schedule.next_month')}
          </button>
        </div>
        
        <MonthlyScheduleCalendar 
          currentDate={currentMonth}
          onDateChange={setCurrentMonth}
        />
      </div>
      
      <CustomShiftManager />
    </div>
  );
};

export default SchedulePage;