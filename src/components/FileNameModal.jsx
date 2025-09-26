import React, { useState } from 'react';

const FileNameModal = ({ isOpen, onClose, onConfirm, defaultFileName }) => {
  const [fileName, setFileName] = useState(defaultFileName || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fileName.trim()) {
      onConfirm(fileName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">设置JSON文件名</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filename">
                JSON文件名
              </label>
              <input
                type="text"
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="请输入文件名"
              />
              <p className="text-gray-500 text-xs mt-2">.json 扩展名将自动添加</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                确定
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileNameModal;