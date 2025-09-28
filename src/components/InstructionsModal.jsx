import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const InstructionsModal = ({ isOpen, onClose }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar sm:max-h-[80vh] transform transition-all duration-300 ease-out opacity-0 translate-y-4"
      >
        <div className="p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">{t('instructions.title')}</h2>
          
          <div className="space-y-6 text-left mx-auto max-w-lg sm:max-w-md">
            {/* Convenience */}
            <div className="bg-blue-50 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">1</span>
                {t('instructions.convenience.title')}
              </h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.convenience.item1')}</p>
              </div>
              <div className="flex items-start mt-2">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.convenience.item2')}</p>
              </div>
            </div>

            {/* Planning */}
            <div className="bg-blue-50 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">2</span>
                {t('instructions.planning.title')}
              </h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.planning.item1')}</p>
              </div>
              <div className="flex items-start mt-2">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.planning.item2')}</p>
              </div>
              <div className="flex items-start mt-2">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.planning.item3')}</p>
              </div>
            </div>

            {/* Scheduling */}
            <div className="bg-blue-50 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">3</span>
                {t('instructions.scheduling.title')}
              </h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.scheduling.item1')}</p>
              </div>
              <div className="flex items-start mt-2">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.scheduling.item2')}</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-blue-50 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">4</span>
                {t('instructions.statistics.title')}
              </h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.statistics.item1')}</p>
              </div>
              <div className="flex items-start mt-2">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.statistics.item2')}</p>
              </div>
              <div className="flex items-start mt-2">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.statistics.item3')}</p>
              </div>
            </div>

            {/* My */}
            <div className="bg-blue-50 rounded-xl p-5 transition-all duration-200 hover:shadow-md">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">5</span>
                {t('instructions.my.title')}
              </h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.my.item1')}</p>
              </div>
              <div className="flex items-start mt-2">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-base">{t('instructions.my.item2')}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
            <p className="text-base text-blue-800">
              {t('instructions.tip')}
            </p>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t('instructions.acknowledge')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;