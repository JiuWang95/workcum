import React from 'react';
import { useTranslation } from 'react-i18next';
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor';

const ShiftColorTest = () => {
  const { t } = useTranslation();
  
  const testShifts = [
    { type: 'day', name: t('time_entry.custom_shift.day_shift') },
    { type: 'overnight', name: t('time_entry.custom_shift.overnight_shift') },
    { type: 'rest', name: t('time_entry.custom_shift.rest_day') },
    { type: 'regular', name: t('time_entry.custom_shift.regular_shift') }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{t('time_entry.custom_shift.color_test')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testShifts.map((shift, index) => (
          <div 
            key={index} 
            className="border rounded-lg p-4"
            style={{ 
              borderLeft: `4px solid ${getShiftColor(shift.type)}`,
              backgroundColor: getShiftBackgroundColor(shift.type)
            }}
          >
            <h3 
              className="font-semibold text-lg mb-2"
              style={{ color: getShiftColor(shift.type) }}
            >
              {shift.name}
            </h3>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-600">{t('time_entry.custom_shift.text_color')}</p>
                <div 
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: getShiftColor(shift.type) }}
                ></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('time_entry.custom_shift.background_color')}</p>
                <div 
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: getShiftBackgroundColor(shift.type) }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiftColorTest;