import React, { useState, useRef } from 'react';
import TimeEntryForm from '../components/TimeEntryForm';
import CustomShiftManager from '../components/CustomShiftManager';
import InstructionsModal from '../components/InstructionsModal';
import AddEntryModal from '../components/AddEntryModal';
import { useTranslation } from 'react-i18next';

const TimeEntryPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false); // Control instructions modal display
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false); // Control add entry modal display
  const editSectionRef = useRef(null);

  // Load entries and shifts from localStorage on component mount
  React.useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    setEntries(savedEntries);
    setShifts(savedShifts);
  }, []);

  // Function to scroll to edit section
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
        <div className="flex space-x-2">
          {/* 桌面端添加记录按钮 */}
          <button
            onClick={() => setIsAddEntryModalOpen(true)}
            className="hidden md:flex px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium items-center shadow-md transition-all duration-200"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            {t('time_entry.add_entry')}
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium flex items-center shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            {t('instructions.title')}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <CustomShiftManager scrollToEditSection={scrollToEditSection} />
        </div>
      </div>
      
      {/* 移动端添加记录按钮放在页面底部，靠近移动端导航栏 */}
      <div className="fixed md:hidden bottom-28 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={() => setIsAddEntryModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium flex items-center shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
          {t('time_entry.add_entry')}
        </button>
      </div>
      
      {/* 在页面底部添加一个占位元素，防止内容被固定按钮遮挡 */}
      <div className="md:hidden h-24"></div>
      
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
      <AddEntryModal 
        isOpen={isAddEntryModalOpen} 
        onClose={() => setIsAddEntryModalOpen(false)} 
        onAddEntry={handleAddEntry} 
      />
    </div>
  );
};

export default TimeEntryPage;