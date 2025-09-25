import React from 'react';
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor';

const ShiftColorTest = () => {
  const testShifts = [
    { name: '早班' },
    { name: '晚班' },
    { name: '夜班' },
    { name: 'Morning Shift' },
    { name: 'Evening Shift' },
    { name: 'Night Shift' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">班次颜色测试</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testShifts.map((shift, index) => (
          <div 
            key={index} 
            className="border rounded-lg p-4"
            style={{ 
              borderLeft: `4px solid ${getShiftColor(shift.name)}`,
              backgroundColor: getShiftBackgroundColor(shift.name)
            }}
          >
            <h3 
              className="font-semibold text-lg mb-2"
              style={{ color: getShiftColor(shift.name) }}
            >
              {shift.name}
            </h3>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-600">文字颜色</p>
                <div 
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: getShiftColor(shift.name) }}
                ></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">背景颜色</p>
                <div 
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: getShiftBackgroundColor(shift.name) }}
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