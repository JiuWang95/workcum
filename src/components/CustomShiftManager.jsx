import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DurationPicker from './DurationPicker';
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor'; // 导入颜色工具函数

const CustomShiftManager = () => {
  const { t } = useTranslation();
  const [shifts, setShifts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [customDuration, setCustomDuration] = useState('');
  const [isOvernight, setIsOvernight] = useState(false); // 添加跨日期班次标识

  // Load shifts from localStorage on component mount
  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setShifts(savedShifts);
  }, []);

  // Save shifts to localStorage whenever shifts change
  useEffect(() => {
    localStorage.setItem('customShifts', JSON.stringify(shifts));
  }, [shifts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!shiftName.trim()) {
      alert(t('time_entry.custom_shift.validation.name_required'));
      return;
    }
    
    const newShift = {
      id: editingShift ? editingShift.id : Date.now().toString(),
      name: shiftName,
      startTime,
      endTime,
      customDuration: customDuration || null, // Store custom duration or null if not set
      isOvernight // 保存跨日期标识
    };
    
    if (editingShift) {
      // Update existing shift
      setShifts(shifts.map(shift => shift.id === editingShift.id ? newShift : shift));
      setEditingShift(null);
    } else {
      // Add new shift
      setShifts([...shifts, newShift]);
    }
    
    // Reset form
    setShiftName('');
    setStartTime('09:00');
    setEndTime('17:00');
    setCustomDuration('');
    setIsOvernight(false); // 重置跨日期标识
    setShowForm(false);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShiftName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setCustomDuration(shift.customDuration || '');
    setIsOvernight(shift.isOvernight || false); // 设置跨日期标识
    setShowForm(true);
  };

  const handleDelete = (shiftId) => {
    if (window.confirm(t('time_entry.custom_shift.delete_confirm'))) {
      setShifts(shifts.filter(shift => shift.id !== shiftId));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingShift(null);
    setShiftName('');
    setStartTime('09:00');
    setEndTime('17:00');
    setCustomDuration('');
    setIsOvernight(false); // 重置跨日期标识
  };

  // Function to convert duration string to hours
  const convertDurationToHours = (durationStr) => {
    if (!durationStr) return 0;
    
    const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
    const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
    
    const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
    
    return hours + (minutes / 60);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-heading">{t('time_entry.custom_shift.title')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {showForm ? t('time_entry.custom_shift.cancel') : t('time_entry.custom_shift.add_shift')}
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shiftName">
              {t('time_entry.custom_shift.shift_name')}
            </label>
            <input
              type="text"
              id="shiftName"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={t('time_entry.custom_shift.shift_name_placeholder')}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shiftStartTime">
                {t('time_entry.custom_shift.start_time')}
              </label>
              <input
                type="time"
                id="shiftStartTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shiftEndTime">
                {t('time_entry.custom_shift.end_time')}
              </label>
              <input
                type="time"
                id="shiftEndTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div>
              <DurationPicker
                id="customDuration"
                label={t('time_entry.custom_shift.custom_duration')}
                value={customDuration}
                onChange={setCustomDuration}
              />
            </div>
          </div>
          
          {/* 跨日期班次选项 */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isOvernight}
                onChange={(e) => setIsOvernight(e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-gray-700">{t('time_entry.custom_shift.overnight_shift')}</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {t('time_entry.custom_shift.cancel')}
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {editingShift ? t('time_entry.custom_shift.update_shift') : t('time_entry.custom_shift.save_shift')}
            </button>
          </div>
        </form>
      )}
      
      {shifts.length > 0 ? (
        <div className="space-y-4">
          {shifts.map((shift) => (
            <div 
              key={shift.id} 
              className="border border-gray-200 rounded-lg p-4 relative overflow-hidden"
              style={{ 
                borderLeft: `4px solid ${getShiftColor(shift.name)}`,
                backgroundColor: getShiftBackgroundColor(shift.name)
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* 班次名称 */}
                <div className="md:col-span-1">
                  <h3 
                    className="font-semibold text-lg text-gray-800"
                    style={{ color: getShiftColor(shift.name) }}
                  >
                    {shift.name}
                    {shift.isOvernight && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t('time_entry.custom_shift.overnight_shift')}
                      </span>
                    )}
                  </h3>
                </div>
                
                {/* 开始时间，结束时间 */}
                <div className="md:col-span-1">
                  <p className="text-gray-600 text-sm">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                
                {/* 工时时长 */}
                <div className="md:col-span-1">
                  {shift.customDuration ? (
                    <p className="text-gray-600 text-sm">
                      {convertDurationToHours(shift.customDuration).toFixed(1)}h
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      {t('time_entry.custom_shift.custom_duration')}
                    </p>
                  )}
                </div>
                
                {/* 跨日期标识 */}
                <div className="md:col-span-1">
                  {shift.isOvernight ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {t('time_entry.custom_shift.overnight_shift')}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm italic">
                      {t('time_entry.custom_shift.regular_shift')}
                    </span>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div className="md:col-span-1 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(shift)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    {t('time_entry.custom_shift.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(shift.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    {t('time_entry.custom_shift.delete')}
                  </button>
                </div>
              </div>
              
              {/* 颜色预览 */}
              <div className="mt-3 flex items-center">
                <span className="text-xs text-gray-500 mr-2">{t('time_entry.custom_shift.color_preview')}:</span>
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: getShiftColor(shift.name) }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">{t('time_entry.custom_shift.no_shifts')}</p>
      )}
    </div>
  );
};

export default CustomShiftManager;