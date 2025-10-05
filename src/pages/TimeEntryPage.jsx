import React, { useState, useRef, useEffect } from 'react';
import TimeEntryForm from '../components/forms/TimeEntryForm';
import CustomShiftManager from '../components/manager/CustomShiftManager';
import InstructionsModal from '../components/modals/InstructionsModal';
import AddEntryModal from '../components/modals/AddEntryModal';
import ReplaceConfirmationModal from '../components/modals/ReplaceConfirmationModal';
import { useTranslation } from 'react-i18next';
import { isSameDay } from 'date-fns';
import { getData, setData, watchStorageChanges } from '../utils/dataManager';

const TimeEntryPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedDateForReplace, setSelectedDateForReplace] = useState(null);
  const [pendingEntry, setPendingEntry] = useState(null);
  const editSectionRef = useRef(null);

  useEffect(() => {
    // Load data from localStorage on component mount using dataManager
    setEntries(getData('timeEntries'));
    setSchedules(getData('schedules'));
    setShifts(getData('customShifts'));
    
    // Watch for storage changes from other tabs
    const unsubscribe = watchStorageChanges((key, newValue) => {
      switch (key) {
        case 'timeEntries':
          setEntries(newValue || []);
          break;
        case 'schedules':
          setSchedules(newValue || []);
          break;
        case 'customShifts':
          setShifts(newValue || []);
          break;
        default:
          break;
      }
    });

    // Cleanup listener on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Function to scroll to edit section
  const scrollToEditSection = () => {
    if (editSectionRef.current) {
      editSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.date), new Date(date))
    );
  };

  // Get time entries for a specific date
  const getTimeEntriesForDate = (date) => {
    return entries.filter(entry => 
      isSameDay(new Date(entry.date), new Date(date))
    );
  };

  // Check if there are existing schedules or entries for a date
  const hasExistingDataForDate = (date) => {
    const existingSchedules = getSchedulesForDate(date);
    const existingTimeEntries = getTimeEntriesForDate(date);
    return existingSchedules.length > 0 || existingTimeEntries.length > 0;
  };

  const handleAddEntry = (entry) => {
    // Check if there's existing data for the entry's date
    if (hasExistingDataForDate(entry.date)) {
      // Show replace confirmation modal
      setPendingEntry(entry);
      setSelectedDateForReplace(entry.date);
      setShowReplaceModal(true);
    } else {
      // No existing data, add entry directly
      const newEntries = [...entries, entry];
      setEntries(newEntries);
      setData('timeEntries', newEntries);
    }
  };

  const handleConfirmReplace = () => {
    if (pendingEntry) {
      // Remove existing data for the date
      const filteredEntries = entries.filter(entry => entry.date !== pendingEntry.date);
      const filteredSchedules = schedules.filter(schedule => schedule.date !== pendingEntry.date);
      
      // Add the new entry
      const newEntries = [...filteredEntries, pendingEntry];
      
      // Update state and localStorage
      setEntries(newEntries);
      setSchedules(filteredSchedules);
      setData('timeEntries', newEntries);
      setData('schedules', filteredSchedules);
      
      // Close modals
      setShowReplaceModal(false);
      setPendingEntry(null);
      setSelectedDateForReplace(null);
    }
  };

  const handleDeleteEntry = (id) => {
    if (window.confirm(t('time_entry.delete_confirm'))) {
      const newEntries = entries.filter(entry => entry.id !== id);
      setEntries(newEntries);
      setData('timeEntries', newEntries);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-heading">{t('navigation.time_entry')}</h1>
        <div className="flex space-x-2">
          {/* 添加记录按钮 - 在所有设备上显示一致的样式 */}
          <button
            onClick={() => setIsAddEntryModalOpen(true)}
            className="flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm whitespace-nowrap md:py-2.5 md:px-5 md:text-sm md:rounded-lg"
          >
            <svg 
              className="w-4 h-4 mr-1 md:w-4 md:h-4 md:mr-1.5" 
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
          {/* 使用说明按钮 */}
          <button
            onClick={() => setShowInstructions(true)}
            className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-medium flex items-center shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <svg 
              className="w-5 h-5" 
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
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 mt-8">
          <CustomShiftManager scrollToEditSection={scrollToEditSection} />
        </div>
      </div>
      
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
      <AddEntryModal 
        isOpen={isAddEntryModalOpen} 
        onClose={() => setIsAddEntryModalOpen(false)} 
        onAddEntry={handleAddEntry} 
      />
      <ReplaceConfirmationModal
        isOpen={showReplaceModal}
        onClose={() => {
          setShowReplaceModal(false);
          setPendingEntry(null);
          setSelectedDateForReplace(null);
        }}
        onConfirm={handleConfirmReplace}
        date={selectedDateForReplace}
      />
    </div>
  );
};

export default TimeEntryPage;