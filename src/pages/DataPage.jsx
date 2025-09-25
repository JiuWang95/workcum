import React, { useState } from 'react';

const DataPage = () => {
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
      
      setExportStatus('Data exported successfully!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus('Error exporting data: ' + error.message);
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
          throw new Error('Invalid data format');
        }
        
        // Save to localStorage
        localStorage.setItem('timeEntries', JSON.stringify(data.timeEntries));
        localStorage.setItem('schedules', JSON.stringify(data.schedules));
        
        setImportStatus('Data imported successfully!');
        setTimeout(() => setImportStatus(''), 3000);
        
        // Reset file input
        event.target.value = '';
      } catch (error) {
        setImportStatus('Error importing data: ' + error.message);
        setTimeout(() => setImportStatus(''), 3000);
        
        // Reset file input
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('timeEntries');
      localStorage.removeItem('schedules');
      setImportStatus('All data cleared successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Data Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Export Data</h2>
          <p className="text-gray-600 mb-4">
            Export all your time entries and schedules to a JSON file for backup or transfer.
          </p>
          <button
            onClick={handleExportAllData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
          >
            Export All Data
          </button>
          {exportStatus && (
            <div className="mt-4 p-2 bg-emerald-100 text-emerald-700 rounded">
              {exportStatus}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Import Data</h2>
          <p className="text-gray-600 mb-4">
            Import data from a previously exported JSON file to restore your time entries and schedules.
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
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Clear all data from your browser's storage. This action cannot be undone.
        </p>
        <button
          onClick={handleClearAllData}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
};

export default DataPage;