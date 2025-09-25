import React, { useState } from 'react';
import TimeEntryForm from '../components/TimeEntryForm';
import CustomShiftManager from '../components/CustomShiftManager';
import { useTranslation } from 'react-i18next';

const TimeEntryPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);

  // Load entries from localStorage on component mount
  React.useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setEntries(savedEntries);
  }, []);

  const handleAddEntry = (entry) => {
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    localStorage.setItem('timeEntries', JSON.stringify(newEntries));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="page-heading">{t('time_entry.title')}</h1>
      
      {/* Custom Shift Manager */}
      <CustomShiftManager />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <TimeEntryForm onAddEntry={handleAddEntry} />
        </div>
        <div>
          <h2 className="section-heading">{t('time_entry.recent_entries')}</h2>
          {entries.length === 0 ? (
            <p className="text-gray-500">{t('time_entry.no_entries')}</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {[...entries].reverse().slice(0, 5).map((entry, index) => (
                  <li key={index} className="p-4">
                    <div className="flex justify-between">
                      <span className="font-medium">{entry.date}</span>
                      <span className="text-indigo-600">{entry.duration} {t('time_entry.duration')}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {entry.startTime} - {entry.endTime}
                    </div>
                    {entry.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        {entry.notes}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeEntryPage;