import React from 'react';
import { ImportResult } from '@/utils/importUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface ImportResultsProps {
  result: ImportResult;
  onClose: () => void;
}

const ImportResults: React.FC<ImportResultsProps> = ({ result, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl shadow-lg p-6 border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center mb-6">
        {result.success ? (
          <div className="bg-gradient-to-r from-tertiary-500 to-primary-500 p-3 rounded-full mr-4 shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-rose-500 to-primary-500 p-3 rounded-full mr-4 shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {result.success ? 'Import Completed' : 'Import Failed'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl border shadow-sm ${
          isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
        }`}>
          <div className="flex items-center mb-2">
            <div className={`p-1.5 rounded-md shadow-sm mr-2 ${isDark ? 'bg-blue-800' : 'bg-white/80'}`}>
              <svg className={`w-3.5 h-3.5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Records</p>
          </div>
          <p className={`text-xl font-bold mt-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{result.totalRecords}</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm ${
          isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200'
        }`}>
          <div className="flex items-center mb-2">
            <div className={`p-1.5 rounded-md shadow-sm mr-2 ${isDark ? 'bg-emerald-800' : 'bg-white/80'}`}>
              <svg className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>New Records</p>
          </div>
          <p className={`text-xl font-bold mt-1 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{result.importedRecords}</p>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm ${
          isDark ? 'bg-purple-900/30 border-purple-800' : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200'
        }`}>
          <div className="flex items-center mb-2">
            <div className={`p-1.5 rounded-md shadow-sm mr-2 ${isDark ? 'bg-purple-800' : 'bg-white/80'}`}>
              <svg className={`w-3.5 h-3.5 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Updated Records</p>
          </div>
          <p className={`text-xl font-bold mt-1 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{result.updatedRecords}</p>
        </div>
      </div>

      {result.errors.length > 0 && (
        <div className="mb-6">
          <h3 className={`text-md font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Errors ({result.errors.length}):</h3>
          <div className={`rounded-lg border p-4 max-h-60 overflow-y-auto ${
            isDark ? 'bg-red-900/30 border-red-800' : 'bg-rose-50 border-rose-200'
          }`}>
            <ul className={`list-disc pl-5 space-y-1 text-sm ${isDark ? 'text-red-300' : 'text-rose-700'}`}>
              {result.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className={`font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 inline-flex items-center justify-center border ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 focus:ring-gray-500'
              : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200 focus:ring-gray-200'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ImportResults;
