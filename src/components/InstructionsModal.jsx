import React from 'react';
import { useTranslation } from 'react-i18next';

const InstructionsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar sm:max-h-[80vh]">
        <div className="p-4 sm:p-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4">{t('instructions.title')}</h2>
          
          <div className="space-y-4 text-left mx-auto max-w-lg sm:max-w-md">
            {/* 方便使用 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">{t('instructions.convenience.title')}</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.convenience.item1')}</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.convenience.item2')}</p>
              </div>
            </div>

            {/* 计划 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">{t('instructions.planning.title')}</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.planning.item1')}</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.planning.item2')}</p>
              </div>
            </div>

            {/* 排班 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">{t('instructions.scheduling.title')}</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.scheduling.item1')}</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.scheduling.item2')}</p>
              </div>
            </div>

            {/* 统计 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">{t('instructions.statistics.title')}</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.statistics.item1')}</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.statistics.item2')}</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.statistics.item3')}</p>
              </div>
            </div>

            {/* 我的 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">{t('instructions.my.title')}</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.my.item1')}</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">{t('instructions.my.item2')}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 sm:p-4 bg-blue-100 rounded-lg">
            <p className="text-sm md:text-base text-blue-800">
              <span className="font-semibold">{t('instructions.tip').split(':')[0]}:</span>
              {t('instructions.tip').split(':')[1]}
            </p>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
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