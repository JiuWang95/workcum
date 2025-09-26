import React from 'react';
import { useTranslation } from 'react-i18next';

const InstructionsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar sm:max-h-[80vh]">
        <div className="p-4 sm:p-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4">使用说明</h2>
          
          <div className="space-y-4 text-left mx-auto max-w-lg sm:max-w-md">
            {/* 方便使用 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">方便使用</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">用设备自带浏览器或者如Safari、Edge、Chrome，华为浏览器等打开本网站，会提示安装到桌面。</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">安装后即可在桌面打开，无需每次都打开浏览器。或者点击网页菜单，点击添加到桌面。</p>
              </div>
            </div>

            {/* 计划 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">计划</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">可选择预设的自定义班次模板快速填充记录信息，</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">或者手动添加您的工作时间记录（排班表里没有的）。</p>
              </div>
            </div>

            {/* 排班 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">排班</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">使用周历添加和管理排班，点击任意日期添加新的排班任务。</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">使用月历查看整月排班。</p>
              </div>
            </div>

            {/* 统计 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">统计</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">选择日期范围生成工时统计，支持"本周"和"本月"快捷日期选择。</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">点击导出Excel，可以自定义Excel文件名。</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">导出后会生成日期范围内的工时统计。</p>
              </div>
            </div>

            {/* 我的 */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-700 mb-1">我的</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">有项目介绍，管理数据，支持导出所有数据为JSON文件进行备份，或从JSON文件导入数据恢复信息。</p>
              </div>
              <div className="flex items-start mt-1">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-1">•</div>
                <p className="ml-2 text-gray-700 text-sm md:text-base">这个方法也可以实现不同设备间的数据同步。</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 sm:p-4 bg-blue-100 rounded-lg">
            <p className="text-sm md:text-base text-blue-800">
              <span className="font-semibold">提示：</span>
              所有数据均安全存储在您的浏览器本地，不会上传到任何服务器。建议定期导出数据进行备份。
            </p>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
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