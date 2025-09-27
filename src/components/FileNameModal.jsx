import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const FileNameModal = ({ isOpen, onClose, onConfirm, initialFileName = '' }) => {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState(initialFileName);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fileName.trim()) {
      onConfirm(fileName.trim());
      setFileName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out opacity-0 translate-y-4"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
          <h3 className="text-xl font-semibold text-gray-800">
            {initialFileName ? t('fileNameModal.editTitle') : t('fileNameModal.createTitle')}
          </h3>
          <button
            onClick={() => {
              onClose();
              setFileName(initialFileName);
            }}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fileName">
                {t('fileNameModal.fileName')}
              </label>
              <input
                id="fileName"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="shadow-md appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={t('fileNameModal.placeholder')}
              />
              <p className="text-gray-500 text-xs mt-2 italic">{t('fileNameModal.extensionNote')}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 p-5 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={() => {
                onClose();
                setFileName(initialFileName);
              }}
              className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              {t('common.confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileNameModal;