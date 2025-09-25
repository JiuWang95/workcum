import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CustomShiftManager = () => {
  const { t } = useTranslation();
  const [shifts, setShifts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [customDuration, setCustomDuration] = useState('');

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
      customDuration: customDuration || null // Store custom duration or null if not set
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
    setShowForm(false);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShiftName(shift.name);
    setStartTime(shift.startTime);
    setEndTime(shift.endTime);
    setCustomDuration(shift.customDuration || '');
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customDuration">
                {t('time_entry.custom_shift.custom_duration')}
              </label>
              <input
                type="text"
                id="customDuration"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="例如: 8h 或 480m"
              />
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <div key={shift.id} className="border border-gray-200 rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{shift.name}</h3>
                  <p className="text-gray-600">{shift.startTime} - {shift.endTime}</p>
                  {shift.customDuration && (
                    <p className="text-gray-600 text-sm">{t('time_entry.custom_shift.custom_duration')}: {shift.customDuration}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(shift)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {t('time_entry.custom_shift.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(shift.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {t('time_entry.custom_shift.delete')}
                  </button>
                </div>
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