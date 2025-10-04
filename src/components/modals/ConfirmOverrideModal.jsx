import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ConfirmOverrideModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title,
  message
}) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);

  // Apply entrance animation when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Trigger reflow to ensure the animation plays
      modalRef.current.offsetHeight;
      // Apply the visible state
      modalRef.current.classList.remove('opacity-0', 'translate-y-4');
      modalRef.current.classList.add('opacity-100', 'translate-y-0');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out opacity-0 translate-y-4"
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{title || t('data.import_modal.title')}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-all duration-200"
              aria-label={t('common.close')}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-700 text-base">{message || t('data.import_modal.message')}</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOverrideModal;