import React from 'react';
import Modal from './Modal';
import TimeEntryForm from '../forms/TimeEntryForm';
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
      size="md"
      title={t('time_entry.add_entry')}
      footer={
        <div className="flex flex-row justify-between items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="w-auto px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-base sm:text-sm"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              // 触发表单提交
              const form = document.getElementById('timeEntryForm');
              if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
            className="w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow transition-all duration-200 text-base sm:text-sm"
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