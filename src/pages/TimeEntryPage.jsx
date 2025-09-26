import React, { useState, useRef } from 'react';
import TimeEntryForm from '../components/TimeEntryForm';
import CustomShiftManager from '../components/CustomShiftManager';
import InstructionsModal from '../components/InstructionsModal';
import { useTranslation } from 'react-i18next';

const TimeEntryPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false); // 控制使用说明弹窗显示
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false); // 控制添加记录模块的折叠状态（默认折叠）
  const editSectionRef = useRef(null);

  // Load entries and shifts from localStorage on component mount
  React.useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    setEntries(savedEntries);
    setShifts(savedShifts);
  }, []);

  // 滚动到编辑区域的函数
  const scrollToEditSection = () => {
    if (editSectionRef.current) {
      editSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          <CustomShiftManager scrollToEditSection={scrollToEditSection} />
          <div className="bg-white rounded-lg shadow mt-8">
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => setIsAddRecordOpen(!isAddRecordOpen)}
            >
              <h2 className="section-heading mb-0">{t('time_entry.add_entry')}</h2>
              <svg 
                className={`w-5 h-5 text-gray-500 transform transition-transform ${isAddRecordOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {isAddRecordOpen && (
              <div className="p-6 pt-0" ref={editSectionRef}>
                <TimeEntryForm onAddEntry={handleAddEntry} />
              </div>
            )}
          </div>
        </div>
      </div>
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
};

export default TimeEntryPage;