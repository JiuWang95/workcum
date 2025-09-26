import React from 'react';
import { useTranslation } from 'react-i18next';

const InstructionsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-800">使用说明</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-0.5 font-bold">1.</div>
              <p className="ml-2 text-gray-700">在"计划"页面，可选择预设的自定义班次模板快速填充记录信息，或者手动添加您的工作时间记录。</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-0.5 font-bold">2.</div>
              <p className="ml-2 text-gray-700">在"排班"页面使用周视图查看和管理日程安排，点击任意日期添加新的排班任务</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-0.5 font-bold">3.</div>
              <p className="ml-2 text-gray-700">在"统计"页面选择日期范围生成工时统计，支持"本周"和"本月"快捷日期选择</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-0.5 font-bold">4.</div>
              <p className="ml-2 text-gray-700">在"我的"页面管理数据，支持导出所有数据为JSON文件进行备份，或从JSON文件导入数据恢复信息</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800">
              <span className="font-semibold">提示：</span>
              所有数据均安全存储在您的浏览器本地，不会上传到任何服务器。建议定期导出数据进行备份。
            </p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;