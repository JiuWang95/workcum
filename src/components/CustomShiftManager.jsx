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
    // 修复移动端显示问题：添加 max-h-[60vh] 和 overflow-y-auto 来限制高度并允许滚动
    // 添加 pb-20 以防止内容被底部导航栏遮挡
    <div className="bg-white rounded-lg shadow p-4 mb-6 max-h-[60vh] overflow-y-auto pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-heading">{t('time_entry.custom_shift.title')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded text-sm focus:outline-none focus:shadow-outline"
        >
          {showForm ? t('time_entry.custom_shift.cancel') : t('time_entry.custom_shift.add_shift')}
        </button>
      </div>
      
      {showForm && (
        // 减少表单的内边距以适应移动端
        <form onSubmit={handleSubmit} className="mb-4 p-3 border border-gray-200 rounded">
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="shiftName">
              {t('time_entry.custom_shift.shift_name')}
            </label>
            <input
              type="text"
              id="shiftName"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              placeholder={t('time_entry.custom_shift.shift_name_placeholder')}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="shiftStartTime">
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
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="shiftEndTime">
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
          </div>
          
          {/* 自定义工时放在开始时间和结束时间下面 */}
          <div className="mb-3">
            <DurationPicker
              id="customDuration"
              label={t('time_entry.custom_shift.custom_duration')}
              value={customDuration}
              onChange={setCustomDuration}
            />
          </div>
          
          {/* 跨日期班次选项放在自定义工时上面 */}
          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isOvernight}
                onChange={(e) => setIsOvernight(e.target.checked)}
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <span className="ml-2 text-gray-700 text-sm">{t('time_entry.custom_shift.overnight_shift')}</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded text-sm focus:outline-none focus:shadow-outline"
            >
              {t('time_entry.custom_shift.cancel')}
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded text-sm focus:outline-none focus:shadow-outline"
            >
              {editingShift ? t('time_entry.custom_shift.update_shift') : t('time_entry.custom_shift.save_shift')}
            </button>
          </div>
        </form>
      )}
      
      {shifts.length > 0 ? (
        // 减少班次项的间距以适应移动端
        <div className="space-y-3">
          {shifts.map((shift) => (
            <div 
              key={shift.id} 
              className="border border-gray-200 rounded-lg p-3 relative overflow-hidden"
              style={{ 
                borderLeft: `3px solid ${getShiftColor(shift.name)}`,
                backgroundColor: getShiftBackgroundColor(shift.name)
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                {/* 班次名称 */}
                <div className="md:col-span-1">
                  <h3 
                    className="font-semibold text-gray-800 text-sm"
                    style={{ color: getShiftColor(shift.name) }}
                  >
                    {shift.name}
                    {shift.isOvernight && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t('time_entry.custom_shift.overnight_shift')}
                      </span>
                    )}
                  </h3>
                </div>
                
                {/* 开始时间，结束时间 */}
                <div className="md:col-span-1">
                  <p className="text-gray-600 text-xs">
                    {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                
                {/* 工时时长 */}
                <div className="md:col-span-1">
                  {shift.customDuration ? (
                    <p className="text-gray-600 text-xs">
                      {convertDurationToHours(shift.customDuration).toFixed(1)}h
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs italic">
                      {t('time_entry.custom_shift.custom_duration')}
                    </p>
                  )}
                </div>
                
                {/* 跨日期标识 */}
                <div className="md:col-span-1">
                  {shift.isOvernight ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {t('time_entry.custom_shift.overnight_shift')}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      {t('time_entry.custom_shift.regular_shift')}
                    </span>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div className="md:col-span-1 flex justify-end space-x-1">
                  <button
                    onClick={() => handleEdit(shift)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs"
                  >
                    {t('time_entry.custom_shift.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(shift.id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    {t('time_entry.custom_shift.delete')}
                  </button>
                </div>
              </div>
              
              {/* 颜色预览 */}
              <div className="mt-2 flex items-center">
                <span className="text-xs text-gray-500 mr-1">{t('time_entry.custom_shift.color_preview')}:</span>
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: getShiftColor(shift.name) }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">{t('time_entry.custom_shift.no_shifts')}</p>
      )}
    </div>
  );
};

export default CustomShiftManager;