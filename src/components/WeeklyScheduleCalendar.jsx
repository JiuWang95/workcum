import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay,
  addWeeks,
  subWeeks
} from 'date-fns';
import { useTranslation } from 'react-i18next';

const WeeklyScheduleCalendar = ({ currentDate, onDateChange }) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [shifts, setShifts] = useState([]); // Add shifts state
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    notes: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    selectedShift: '' // Add selectedShift to form data
  });

  // Load schedules from localStorage
  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    setSchedules(savedSchedules);
  }, []);

  // Load time entries from localStorage
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setTimeEntries(savedEntries);
  }, []);

  // Load custom shifts from localStorage
  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setShifts(savedShifts);
  }, []);

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Get all days to display in the week view
  const getWeekDays = (date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    const days = [];
    let day = weekStart;
    
    while (day <= weekEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  const handleDateClick = (date) => {
    // Load custom shifts from localStorage
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    setSelectedDate(date);
    setFormData({
      id: null,
      title: '',
      notes: '',
      date: format(date, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      selectedShift: '' // Add selectedShift to form data
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

  // Function to convert duration string to hours
  const convertDurationToHours = (durationStr) => {
    if (!durationStr) return 0;
    
    const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
    const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
    
    const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
    
    return hours + (minutes / 60);
  };

  const getScheduleForDate = (date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.date), date)
    );
  };

  const getTimeEntriesForDate = (date) => {
    return timeEntries.filter(entry => 
      isSameDay(new Date(entry.date), date)
    );
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      {/* Week view: Each date occupies a separate row with vertical arrangement */}
      <div className="space-y-4">
        {weekDays.map((day, index) => {
          const daySchedules = getScheduleForDate(day);
          const dayTimeEntries = getTimeEntriesForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={index} 
              className={`border rounded-lg p-4 cursor-pointer ${
                isToday ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
              }`}
              onClick={() => handleDateClick(day)}
            >
              {/* Date header */}
              <div className={`text-lg font-medium mb-3 flex items-center ${
                isToday ? 'text-blue-600' : 'text-gray-700'
              }`}>
                <span className="mr-2">{format(day, 'EEE')}</span>
                <span className="text-xl">{format(day, 'd')}</span>
                <span className="ml-2 text-sm">{format(day, 'MMMM')}</span>
              </div>
              
              {/* Vertical arrangement of schedules and time entries */}
              <div className="space-y-2">
                {/* Display schedules */}
                {daySchedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="text-sm bg-indigo-100 text-indigo-800 p-3 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(schedule);
                    }}
                  >
                    <div className="font-medium">{schedule.title}</div>
                    <div className="text-indigo-600 text-sm mt-1">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      {schedule.selectedShift && shifts.find(s => s.id === schedule.selectedShift)?.customDuration && (
                        <span className="ml-2">
                          [{convertDurationToHours(shifts.find(s => s.id === schedule.selectedShift).customDuration).toFixed(1)}h]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Display time entries */}
                {dayTimeEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="text-sm bg-green-100 text-green-800 p-3 rounded-lg"
                  >
                    <div className="font-medium">{t('time_entry.entry')}</div>
                    <div className="text-green-600 text-sm mt-1">
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      {entry.duration && (
                        <span className="ml-2">
                          [{(entry.duration / 60).toFixed(1)}h]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show placeholder if no items */}
                {daySchedules.length === 0 && dayTimeEntries.length === 0 && (
                  <div className="text-gray-400 italic py-2 text-center">
                    {t('schedule.no_events')}
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
              {/* Shift template selector */}
              {shifts.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shiftTemplate">
                    {t('time_entry.custom_shift.select_shift')}
                  </label>
                  <select
                        id="shiftTemplate"
                        value={formData.selectedShift}
                        onChange={(e) => {
                          const shiftId = e.target.value;
                          const newFormData = {...formData, selectedShift: shiftId};
                          
                          if (shiftId) {
                            const shift = shifts.find(s => s.id === shiftId);
                            if (shift) {
                              newFormData.title = shift.name;
                              newFormData.startTime = shift.startTime;
                              newFormData.endTime = shift.endTime;
                              newFormData.notes = shift.name;
                            }
                          }
                          
                          setFormData(newFormData);
                        }}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                    <option value="">{t('time_entry.custom_shift.select_placeholder')}</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                        {shift.customDuration && ` [${convertDurationToHours(shift.customDuration).toFixed(1)}h]`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
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

export default WeeklyScheduleCalendar;