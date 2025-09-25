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
      
      // Create data object
      const data = {
        timeEntries,
        schedules,
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
      setImportStatus(t('data.clear_success'));
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="page-heading">{t('data.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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