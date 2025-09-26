import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getShiftColor, getShiftBackgroundColor } from '../utils/shiftColor'; // 导入颜色工具函数

const ScheduleCalendar = ({ currentDate }) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    notes: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  // Load schedules from localStorage
  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    setSchedules(savedSchedules);
  }, []);

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = [];
  let day = weekStart;
  
  while (day <= weekEnd) {
    days.push(new Date(day));
    day = addDays(day, 1);
  }

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setFormData({
      id: null,
      title: '',
      notes: '',
      date: format(date, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00'
    });
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setSelectedDate(new Date(schedule.date));
    setFormData(schedule);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(t('schedule.delete_confirm'))) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.title.trim() === '') {
      alert(t('schedule.validation.title_required'));
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      alert(t('schedule.validation.end_time_after_start'));
      return;
    }
    
    const newSchedule = {
      ...formData,
      id: formData.id || Date.now()
    };
    
    if (formData.id) {
      // Update existing schedule
      setSchedules(schedules.map(schedule => 
        schedule.id === formData.id ? newSchedule : schedule
      ));
    } else {
      // Add new schedule
      setSchedules([...schedules, newSchedule]);
    }
    
    setShowModal(false);
  };

  const getScheduleForDate = (date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.date), date)
    );
  };

  // 获取指定日期的时间记录
  const getTimeEntriesForDate = (date) => {
    // 过滤出类型为'entry'的记录作为时间记录
    return schedules.filter(schedule => 
      schedule.type === 'entry' && isSameDay(new Date(schedule.date), date)
    );
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
          <div key={index} className="text-center font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const daySchedules = getScheduleForDate(day);
          const dayTimeEntries = getTimeEntriesForDate(day);
          const isToday = isSameDay(day, new Date());
          
          // 合并排班和时间记录，并按类型分组显示
          const allItems = [
            ...daySchedules.map(item => ({...item, itemType: 'schedule'})),
            ...dayTimeEntries.map(item => ({...item, itemType: 'entry'}))
          ];
          
          return (
            <div 
              key={index} 
              className={`min-h-32 border rounded p-2 cursor-pointer ${
                isToday ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
              }`}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {format(day, 'd', { locale: zhCN })}
              </div>
              
              <div className="space-y-1">
                {allItems.slice(0, 3).map((item) => {
                  // 获取班次信息（如果是排班项目）
                  const shiftInfo = item.itemType === 'schedule' ? 
                    shifts.find(shift => shift.id === item.selectedShift) : null;
                  const isOvernight = shiftInfo ? shiftInfo.isOvernight : false;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`text-sm font-semibold p-1 rounded truncate ${
                        item.itemType === 'schedule' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}
                      style={item.itemType === 'schedule' ? {
                        backgroundColor: getShiftBackgroundColor(item.title),
                        borderLeft: `3px solid ${getShiftColor(item.title)}`
                      } : {}}
                    >
                      <div className="flex items-center">
                        <span 
                          className={`inline-block w-3 h-3 rounded-full mr-2 ${
                            item.itemType === 'schedule' 
                              ? 'bg-indigo-500' 
                              : 'bg-orange-500'
                          }`}
                          style={item.itemType === 'schedule' ? {
                            backgroundColor: getShiftColor(item.title)
                          } : {}}
                        ></span>
                        <span className="truncate">{item.title || item.notes || '-'}</span>
                      </div>
                      <div className="text-orange-600 text-[0.5rem] sm:text-[0.6rem] mt-0.5">
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        {item.duration && (
                          <span className="ml-1">
                            [{(item.duration / 60).toFixed(1)}h]
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {allItems.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{allItems.length - 3} more
                  </div>
                )}
                
                {allItems.length === 0 && (
                  <div className="text-xs text-gray-400 italic">
                    {t('schedule.add_task')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="section-heading">
              {formData.id ? t('schedule.edit_schedule') : t('schedule.add_schedule')}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  {t('schedule.form.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={t('schedule.form.title_placeholder')}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  {t('schedule.form.date')}
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
                    {t('schedule.form.start_time')}
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
                    {t('schedule.form.end_time')}
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                  {t('schedule.form.notes')}
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={t('schedule.form.notes_placeholder')}
                  rows="3"
                />
              </div>
              
              <div className="flex justify-between">
                <div>
                  {formData.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(formData.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {t('schedule.form.delete')}
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    {t('schedule.form.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {t('schedule.form.save')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;