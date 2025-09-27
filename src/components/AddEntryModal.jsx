import React from 'react';
import Modal from './Modal';
import TimeEntryForm from './TimeEntryForm';
import { useTranslation } from 'react-i18next';

const AddEntryModal = ({ isOpen, onClose, onAddEntry, customShifts, onCustomShiftsChange }) => {
  const { t } = useTranslation();

  const handleSubmit = (entry) => {
    onAddEntry(entry);
    onClose(); // Close the modal after adding
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="sm"
      title={t('time_entry.add_entry')}
      footer={
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            form="timeEntryForm"
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          >
            {t('common.add')}
          </button>
        </div>
      }
    >
      <TimeEntryForm 
        onAddEntry={handleSubmit} 
        onCancel={handleCancel}
        customShifts={customShifts}
        onCustomShiftsChange={onCustomShiftsChange}
      />
    </Modal>
  );
};

export default AddEntryModal;