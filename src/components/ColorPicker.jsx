import React from 'react';
import { useTranslation } from 'react-i18next';

const ColorPicker = ({ selectedColor, onColorChange, colorOptions }) => {
  const { t } = useTranslation();
  
  // 预定义的颜色选项（默认选项）
  const defaultColorOptions = [
    { name: t('time_entry.custom_shift.colors.green'), hue: 120 },
    { name: t('time_entry.custom_shift.colors.blue'), hue: 220 },
    { name: t('time_entry.custom_shift.colors.purple'), hue: 280 },
    { name: t('time_entry.custom_shift.colors.orange'), hue: 30 },
    { name: t('time_entry.custom_shift.colors.red'), hue: 0 },
    { name: t('time_entry.custom_shift.colors.pink'), hue: 330 },
    { name: t('time_entry.custom_shift.colors.teal'), hue: 180 },
    { name: t('time_entry.custom_shift.colors.yellow'), hue: 60 }
  ];
  
  // 使用传入的颜色选项或默认选项
  const options = colorOptions || defaultColorOptions;

  // 根据色调生成颜色值
  const getColorValue = (hue) => `hsl(${hue}, 80%, 50%)`;
  const getBackgroundColorValue = (hue) => `hsl(${hue}, 80%, 90%)`;

  return (
    <div className="mb-2.5 sm:mb-3">
      <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
        {t('time_entry.custom_shift.color_picker')}
      </label>
      {/* 在移动端使用更紧凑的网格布局 */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 sm:gap-1.5">
        {options.map((color, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onColorChange(color.hue)}
            className={`flex flex-col items-center p-1 sm:p-1.5 rounded-md sm:rounded-lg border-2 transition-all duration-200 ${
              selectedColor === color.hue 
                ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-indigo-500 border-indigo-500' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ backgroundColor: getBackgroundColorValue(color.hue) }}
          >
            <div 
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full mb-0.5 border border-gray-300"
              style={{ backgroundColor: getColorValue(color.hue) }}
            ></div>
            {/* 在移动端隐藏颜色名称以节省空间 */}
            <span className="text-[9px] sm:text-[10px] text-gray-700 hidden sm:block">{color.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-1.5 sm:mt-2 flex items-center">
        <div 
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-300 mr-1.5 sm:mr-2"
          style={{ backgroundColor: getColorValue(selectedColor) }}
        ></div>
        <span className="text-[10px] sm:text-xs text-gray-600">
          {t('time_entry.custom_shift.selected_color')}: {getColorValue(selectedColor)}
        </span>
      </div>
    </div>
  );
};

export default ColorPicker;