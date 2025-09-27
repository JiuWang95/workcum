import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DurationPicker from './DurationPicker';
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor';
import Modal from './Modal';
import ColorPicker from './ColorPicker'; // 导入颜色选择器组件

const CustomShiftManager = ({ scrollToEditSection }) => {
  const { t } = useTranslation();
  const [shifts, setShifts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [customDuration, setCustomDuration] = useState('');
  const [shiftType, setShiftType] = useState('day');
  const [customHue, setCustomHue] = useState(120); // 添加自定义色调状态，默认为绿色
  
  // Drag and drop sorting related state
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

  // 根据班次类型自动设置默认颜色
  useEffect(() => {
    // 定义班次类型到默认颜色的映射
    const typeToColorMap = {
      day: 120,      // 绿色
      rest: 270,     // 紫色
      overnight: 240 // 蓝色
    };
    
    // 设置对应的颜色
    setCustomHue(typeToColorMap[shiftType] || 120);
  }, [shiftType]);

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
      customDuration: customDuration || null,
      shiftType,
      customHue // 保存自定义色调
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
    setShiftType('day');
    setCustomHue(120); // 重置为默认值
    setShowForm(false);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShiftName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setCustomDuration(shift.customDuration || '');
    setShiftType(shift.shiftType || 'day');
    setCustomHue(shift.customHue !== undefined ? shift.customHue : 120); // 设置自定义色调，如果不存在则默认为绿色
    setShowForm(true);
    
    // 滚动到编辑区域
    if (scrollToEditSection) {
      setTimeout(() => {
        scrollToEditSection();
      }, 100);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(t('time_entry.custom_shift.delete_confirm'))) {
      setShifts(shifts.filter(shift => shift.id !== id));
    }
  };

  // Convert duration string to hours (e.g., "8h30m" -> 8.5)
  const convertDurationToHours = (durationStr) => {
    if (!durationStr) return 0;
    
    // Match patterns like "8h", "30m", "1h30m"
    const hoursMatch = durationStr.match(/(\d+)h/);
    const minutesMatch = durationStr.match(/(\d+)m/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return hours + (minutes / 60);
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

  // Drag and drop sorting functions
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, targetItem) => {
    if (targetItem !== draggedItem) {
      setDraggedOver(targetItem.id);
    }
  };

  const handleDragLeave = (e) => {
    // No action needed
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    
    if (draggedItem && targetItem !== draggedItem) {
      const newShifts = [...shifts];
      const draggedIndex = newShifts.findIndex(item => item.id === draggedItem.id);
      const targetIndex = newShifts.findIndex(item => item.id === targetItem.id);
      
      // Remove dragged item
      const [removed] = newShifts.splice(draggedIndex, 1);
      // Insert at target position
      newShifts.splice(targetIndex, 0, removed);
      
      setShifts(newShifts);
    }
    
    setDraggedItem(null);
    setDraggedOver(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-1 h-6 sm:h-8 rounded-full mr-3"></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {t('time_entry.custom_shift.title')}
          </h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base whitespace-nowrap"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('time_entry.custom_shift.add_shift')}
        </button>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => {
          setShowForm(false);
          setEditingShift(null);
          setShiftName('');
          setStartTime('09:00');
          setEndTime('17:00');
          setCustomDuration('');
          setShiftType('day');
          setCustomHue(120); // 重置为默认值
        }}
        title={editingShift ? t('time_entry.custom_shift.edit_shift') : t('time_entry.custom_shift.add_shift')}
      >
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
          <div className="mb-2 sm:mb-3">
            <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1" htmlFor="shiftName">
              {t('time_entry.custom_shift.shift_name')}
            </label>
            <input
              type="text"
              id="shiftName"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
              placeholder={t('time_entry.custom_shift.shift_name_placeholder')}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 sm:gap-3 sm:mb-3">
            <div>
              <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1" htmlFor="shiftStartTime">
                {t('time_entry.custom_shift.start_time')}
              </label>
              <input
                type="time"
                id="shiftStartTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1" htmlFor="shiftEndTime">
                {t('time_entry.custom_shift.end_time')}
              </label>
              <input
                type="time"
                id="shiftEndTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
                required
              />
            </div>
          </div>
          
          {/* 自定义工时放在开始时间和结束时间下面 */}
          <div className="mb-2 sm:mb-3">
            <DurationPicker
              id="customDuration"
              label={t('time_entry.custom_shift.custom_duration')}
              value={customDuration}
              onChange={setCustomDuration}
            />
          </div>
          
          {/* 班次类型选择选项 */}
          <div className="mb-2 sm:mb-3">
            <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
              {t('time_entry.custom_shift.shift_type')}
            </label>
            <div className="flex space-x-3 sm:space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="shiftType"
                  value="day"
                  checked={shiftType === 'day'}
                  onChange={(e) => setShiftType(e.target.value)}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-1.5 sm:ml-2 text-gray-700 text-xs sm:text-sm">{t('time_entry.custom_shift.day_shift')}</span>
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
                <span className="ml-1.5 sm:ml-2 text-gray-700 text-xs sm:text-sm">{t('time_entry.custom_shift.rest_day')}</span>
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
                <span className="ml-1.5 sm:ml-2 text-gray-700 text-xs sm:text-sm">{t('time_entry.custom_shift.overnight_shift')}</span>
              </label>
            </div>
          </div>
          
          {/* 颜色选择器 */}
          <ColorPicker 
            selectedColor={customHue} 
            onColorChange={setCustomHue} 
          />
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingShift(null);
                setShiftName('');
                setStartTime('09:00');
                setEndTime('17:00');
                setCustomDuration('');
                setShiftType('day');
                setCustomHue(120); // 重置为默认值
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow transition-all duration-200 text-sm sm:text-base"
            >
              {editingShift ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </Modal>
      
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
                borderLeft: `3px solid ${getShiftColor(shift.shiftType, shift.customHue)}`,
                backgroundColor: getShiftBackgroundColor(shift.shiftType, shift.customHue)
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
              <div className="flex items-center min-w-0">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300 mr-2 flex-shrink-0"
                  style={{ backgroundColor: getShiftColor(shift.shiftType, shift.customHue) }}
                ></div>
                <div className="min-w-0">
                  <h3 
                    className="font-semibold text-gray-800 text-sm md:text-base truncate"
                    style={{ color: getShiftColor(shift.shiftType, shift.customHue) }}
                  >
                    {shift.name}
                  </h3>
                  {/* 类型标识：显示班次类型 */}
                  <span className="text-xs md:text-sm text-gray-500 truncate">
                    {getShiftTypeText(shift.shiftType || 'day')}
                  </span>
                </div>
              </div>
              
              {/* 中间：时间范围信息，居中显示 */}
              <div className="text-center">
                <p className="text-gray-500 text-xs md:text-sm font-medium">
                  {shift.startTime}-{shift.endTime}
                </p>
              </div>
              
              {/* 右侧：时长信息和操作按钮 */}
              <div className="flex items-center">
                {/* 工时时长 */}
                <div className="text-right mr-2">
                  {shift.customDuration !== undefined && shift.customDuration !== null && shift.customDuration !== "" ? (
                    <p className="text-gray-600 text-xs md:text-sm font-medium">
                      {convertDurationToHours(shift.customDuration).toFixed(1)}h
                    </p>
                  ) : (
                    <p className="text-gray-600 text-xs md:text-sm font-medium">
                      0.0h
                    </p>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleEdit(shift)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 p-1"
                    aria-label={t('common.edit')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(shift.id)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1"
                    aria-label={t('common.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{t('time_entry.custom_shift.no_shifts')}</h3>
          <p className="text-gray-500 hidden">{t('time_entry.custom_shift.no_shifts_description')}</p>
        </div>
      )}
    </div>
  );
};

export default CustomShiftManager;