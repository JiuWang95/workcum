import React, { useState } from 'react';
import TimeEntryForm from '../components/TimeEntryForm';
import CustomShiftManager from '../components/CustomShiftManager';
import InstructionsModal from '../components/InstructionsModal';
import { useTranslation } from 'react-i18next';

const TimeEntryPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false); // 控制使用说明弹窗显示

  // Load entries and shifts from localStorage on component mount
  React.useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    setEntries(savedEntries);
    setShifts(savedShifts);
  }, []);

  const handleAddEntry = (entry) => {
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    localStorage.setItem('timeEntries', JSON.stringify(newEntries));
  };

  const handleDeleteEntry = (id) => {
    // 删除时间记录
    if (window.confirm(t('time_entry.delete_confirm'))) {
      const newEntries = entries.filter(entry => entry.id !== id);
      setEntries(newEntries);
      localStorage.setItem('timeEntries', JSON.stringify(newEntries));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-heading">{t('navigation.time_entry')}</h1>
        <button
          onClick={() => setShowInstructions(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium"
        >
          使用说明!
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <div className="space-y-8">
            <div>
              <CustomShiftManager />
            </div>
            <div className="bg-white rounded-lg shadow">
              <div 
                className="px-6 py-4 cursor-pointer flex justify-between items-center"
                onClick={() => setIsAddRecordOpen(!isAddRecordOpen)}
              >
                <h2 className="section-heading mb-0">{t('time_entry.add_entry')}</h2>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transform transition-transform ${isAddRecordOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              {isAddRecordOpen && (
                <div className="px-6 pb-6">
                  <TimeEntryForm onAddEntry={handleAddEntry} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
};

export default TimeEntryPage;