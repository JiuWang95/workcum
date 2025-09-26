import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DataPage = () => {
  const { t } = useTranslation();
  const [importStatus, setImportStatus] = useState('');
  const [exportStatus, setExportStatus] = useState('');

  // Export all data
  const handleExportAllData = () => {
    try {
      // Get all data from localStorage
      const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      const customShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
      
      // Create data object
      const data = {
        timeEntries,
        schedules,
        customShifts,
        exportDate: new Date().toISOString()
      };
      
      // Create file
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `time-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportStatus(t('data.export.success'));
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus(t('data.export.error') + error.message);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  // Import data
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data.timeEntries || !data.schedules) {
          throw new Error(t('data.import.invalid_format'));
        }
        
        // Save to localStorage
        localStorage.setItem('timeEntries', JSON.stringify(data.timeEntries));
        localStorage.setItem('schedules', JSON.stringify(data.schedules));
        // Check if customShifts exists in the imported data, if not, keep existing data
        if (data.customShifts !== undefined) {
          localStorage.setItem('customShifts', JSON.stringify(data.customShifts));
        }
        
        setImportStatus(t('data.import.success'));
        setTimeout(() => setImportStatus(''), 3000);
        
        // Reset file input
        event.target.value = '';
      } catch (error) {
        setImportStatus(t('data.import.error') + error.message);
        setTimeout(() => setImportStatus(''), 3000);
        
        // Reset file input
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm(t('data.clear_confirm'))) {
      localStorage.removeItem('timeEntries');
      localStorage.removeItem('schedules');
      localStorage.removeItem('customShifts');
      setImportStatus(t('data.clear_success'));
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="page-heading">{t('data.title')}</h1>
      
      {/* Project Information Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="section-heading">项目信息</h2>
        <p className="text-gray-600 mb-4">
          这是一个专为工作时间管理而设计的高效工具，旨在帮助用户轻松跟踪和管理工作时间。项目最初是为了给我的妻子思语小姐创建一个方便计算工时的工具，现已发展成为一个功能完整的工时跟踪系统。
        </p>
        <p className="text-gray-600 mb-4">
          主要功能包括：
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4">
          <li>直观的排班日历视图</li>
          <li>详细的时间记录功能</li>
          <li>全面的数据导出和导入支持</li>
          <li>可视化报表分析</li>
        </ul>
        <p className="text-gray-600 mb-4">
          无论您是自由职业者、项目经理还是团队领导，这个工具都能帮助您更好地管理时间，提高工作效率。
        </p>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <a 
            href="https://github.com/JiuNian090/workcum" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
                clipRule="evenodd"
              />
            </svg>
            项目仓库地址
          </a>
          <button
            onClick={() => {
              window.location.href = 'mailto:jiunian929@gmail.com';
              // Highlight effect for 5 seconds
              const contactButton = document.getElementById('contact-button');
              if (contactButton) {
                contactButton.classList.add('bg-yellow-300', 'text-yellow-900');
                setTimeout(() => {
                  contactButton.classList.remove('bg-yellow-300', 'text-yellow-900');
                  contactButton.classList.add('bg-indigo-600');
                }, 5000);
              }
            }}
            id="contact-button"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            联系乐乐
          </button>
        </div>
      </div>
      
      {/* Data Management Section */}
      <div className="mt-8">
        <h2 className="page-heading">数据管理</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="section-heading">{t('data.export.title')}</h2>
          <p className="text-gray-600 mb-4">
            {t('data.export.description')}
          </p>
          <button
            onClick={handleExportAllData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
          >
            {t('data.export.button')}
          </button>
          {exportStatus && (
            <div className="mt-4 p-2 bg-emerald-100 text-emerald-700 rounded">
              {exportStatus}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="section-heading">{t('data.import.title')}</h2>
          <p className="text-gray-600 mb-4">
            {t('data.import.description')}
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          {importStatus && (
            <div className="mt-4 p-2 bg-indigo-100 text-indigo-700 rounded">
              {importStatus}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="section-heading">{t('data.danger_zone.title')}</h2>
        <p className="text-gray-600 mb-4">
          {t('data.danger_zone.description')}
        </p>
        <button
          onClick={handleClearAllData}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          {t('data.danger_zone.button')}
        </button>
      </div>
    </div>
  );
};

export default DataPage;