import React, { useState, useEffect, useRef } from 'react';
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
  const [shiftType, setShiftType] = useState('day'); // 添加班次类型状态
  
  // 拖动排序相关状态
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);

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
      shiftType // 保存班次类型枚举
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
    setShiftType('day'); // 重置为默认值
    setShowForm(false);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShiftName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setCustomDuration(shift.customDuration || '');
    // 设置班次类型，如果不存在则默认为day
    setShiftType(shift.shiftType || 'day');
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
    setShiftType('day'); // 重置为默认值
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

  // 拖动排序相关函数
  const handleDragStart = (e, shift) => {
    setDraggedItem(shift);
    e.dataTransfer.effectAllowed = 'move';
    // 添加视觉反馈
    e.target.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    // 移除视觉反馈
    e.target.classList.remove('opacity-50');
    setDraggedItem(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, shift) => {
    e.preventDefault();
    setDraggedOver(shift.id);
  };

  const handleDragLeave = (e) => {
    // 检查是否真的离开了元素
    if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) {
      setDraggedOver(null);
    }
  };

  const handleDrop = (e, targetShift) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem.id !== targetShift.id) {
      // 重新排列班次
      const newShifts = [...shifts];
      const draggedIndex = newShifts.findIndex(s => s.id === draggedItem.id);
      const targetIndex = newShifts.findIndex(s => s.id === targetShift.id);
      
      // 移除拖动项
      const [removed] = newShifts.splice(draggedIndex, 1);
      // 在目标位置插入
      newShifts.splice(targetIndex, 0, removed);
      
      setShifts(newShifts);
    }
    
    setDraggedItem(null);
    setDraggedOver(null);
  };

  // 获取班次类型显示文本
  const getShiftTypeText = (type) => {
    switch (type) {
      case 'day':
        return t('time_entry.custom_shift.day_shift');
      case 'rest':
        return t('time_entry.custom_shift.rest_day');
      case 'overnight':
        return t('time_entry.custom_shift.overnight_shift');
      default:
        return t('time_entry.custom_shift.day_shift');
    }
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
          
          {/* 班次类型选择选项 */}
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-bold mb-1">
              {t('time_entry.custom_shift.shift_type')}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="shiftType"
                  value="day"
                  checked={shiftType === 'day'}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-gray-700 text-sm">{t('time_entry.custom_shift.day_shift')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="shiftType"
                  value="rest"
                  checked={shiftType === 'rest'}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-gray-700 text-sm">{t('time_entry.custom_shift.rest_day')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="shiftType"
                  value="overnight"
                  checked={shiftType === 'overnight'}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-gray-700 text-sm">{t('time_entry.custom_shift.overnight_shift')}</span>
              </label>
            </div>
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
        // 进一步优化班次项的显示，只显示核心信息以减小高度
        <div className="space-y-2">
          {shifts.map((shift) => (
            <div 
              key={shift.id} 
              className={`border border-gray-200 rounded-lg p-2 relative overflow-hidden flex justify-between items-center transition-all duration-200 ${
                draggedOver === shift.id ? 'bg-blue-50 ring-2 ring-blue-200' : ''
              }`}
              style={{ 
                borderLeft: `3px solid ${getShiftColor(shift.shiftType)}`,
                backgroundColor: getShiftBackgroundColor(shift.shiftType)
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, shift)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, shift)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, shift)}
            >
              {/* 左侧：班次名称和类型标识 */}
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300 mr-2 flex-shrink-0"
                  style={{ backgroundColor: getShiftColor(shift.shiftType) }}
                ></div>
                <div>
                  <h3 
                    className="font-semibold text-gray-800 text-sm"
                    style={{ color: getShiftColor(shift.shiftType) }}
                  >
                    {shift.name}
                  </h3>
                  {/* 类型标识：显示班次类型 */}
                  <span className="text-xs text-gray-500">
                    {getShiftTypeText(shift.shiftType || 'day')}
                  </span>
                </div>
              </div>
              
              {/* 右侧：时长信息和操作按钮 */}
              <div className="flex items-center">
                {/* 工时时长 */}
                <div className="text-right mr-2">
                  {shift.customDuration ? (
                    <p className="text-gray-600 text-xs font-medium">
                      {convertDurationToHours(shift.customDuration).toFixed(1)}h
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs italic">
                      {t('time_entry.custom_shift.custom_duration')}
                    </p>
                  )}
                  {/* 显示时间范围 */}
                  <p className="text-gray-500 text-xs">
                    {shift.startTime}-{shift.endTime}
                  </p>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex flex-col space-y-1">
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