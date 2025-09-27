import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import TimeEntryForm from './TimeEntryForm';

const AddEntryModal = ({ isOpen, onClose, onAddEntry }) => {
  const { t } = useTranslation();

  const handleSubmit = (newEntry) => {
    onAddEntry(newEntry);
    onClose(); // Close the modal after adding entry
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('time_entry.add_entry')}
    >
      <TimeEntryForm onAddEntry={handleSubmit} onCancel={onClose} />
    </Modal>
  );
};

export default AddEntryModal;