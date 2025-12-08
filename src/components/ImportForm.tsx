import React, { useState, useRef } from 'react';
import { parseImportFile, ImportedGlucoseRecord } from '@/utils/importUtils';
import { importGlucoseRecords, generateImportTemplate } from '@/services/importService';
import * as XLSX from 'xlsx';
import { useTheme } from '@/contexts/ThemeContext';

interface ImportFormProps {
  userId: string;
  onImportComplete: (result: any) => void;
}

const ImportForm: React.FC<ImportFormProps> = ({ userId, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ImportedGlucoseRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreviewData([]);
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }
    
    // Check file type
    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileType || '')) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }
    
    setFile(selectedFile);
    
    try {
      setIsLoading(true);
      // Parse the file to get a preview
      const records = await parseImportFile(selectedFile);
      
      // Show a preview of the first 5 records
      setPreviewData(records.slice(0, 5));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !userId) {
      setError('Please select a file to import and ensure you are logged in.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Parse the file
      const records = await parseImportFile(file);
      
      if (records.length === 0) {
        setError('No valid records found in the file.');
        return;
      }
      
      // Import the records to the database
      const result = await importGlucoseRecords(userId, records);
      
      // Notify parent component of the import result
      onImportComplete(result);
      
      // Reset the form
      setFile(null);
      setPreviewData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const { headers, sampleData } = generateImportTemplate();
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert sample data to worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Glucose Records');
    
    // Generate the Excel file and trigger download
    XLSX.writeFile(wb, 'glucose_records_template.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl shadow-sm p-6 border ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-gradient-to-br from-primary-50 to-white border-primary-100'
      }`}>
        <h3 className="text-lg font-semibold mb-4 gradient-text">Import Glucose Records</h3>
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-neutral-600'}`}>
          Upload an Excel or CSV file containing your glucose records. The file should have columns for Date, Time of Day,
          Glucose Level, and Food Description.
        </p>

        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex-grow">
            <label htmlFor="file-upload" className="form-label">
              Select File
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className={`block w-full text-sm
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                hover:file:cursor-pointer
                focus:outline-none ${
                  isDark
                    ? 'text-gray-300 file:bg-blue-900/50 file:text-blue-300 hover:file:bg-blue-900/70'
                    : 'text-neutral-700 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100'
                }`}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>
              Accepted formats: .xlsx, .xls, .csv
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className={`font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center border ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-blue-300 border-gray-600'
                : 'bg-white hover:bg-neutral-50 text-primary-600 border-primary-200'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Template
          </button>
        </div>

        {error && (
          <div className={`p-4 rounded-lg border mb-4 ${
            isDark
              ? 'bg-rose-900/30 text-rose-300 border-rose-800'
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {previewData.length > 0 && (
          <div className="mb-6">
            <h4 className={`text-md font-medium mb-2 ${isDark ? 'text-gray-200' : ''}`}>Preview:</h4>
            <div className={`rounded-lg border overflow-x-auto ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-neutral-200'
            }`}>
              <table className="table-minimal">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time of Day</th>
                    <th>Glucose Level</th>
                    <th>Food Description</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-primary-100 text-primary-800'
                        }`}>
                          {record.time_of_day}
                        </span>
                      </td>
                      <td>{record.glucose_level} mg/dL</td>
                      <td className="max-w-xs truncate">{record.food_description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length < 5 ? (
                <p className={`text-xs p-2 border-t ${
                  isDark ? 'text-gray-400 border-gray-600' : 'text-neutral-500 border-neutral-100'
                }`}>
                  Showing all {previewData.length} records
                </p>
              ) : (
                <p className={`text-xs p-2 border-t ${
                  isDark ? 'text-gray-400 border-gray-600' : 'text-neutral-500 border-neutral-100'
                }`}>
                  Showing first 5 records. Import to process all records.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleImport}
            disabled={!file || isLoading}
            className={`bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 flex items-center ${
              (!file || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Records
              </>
            )}
          </button>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm p-6 border ${
        isDark
          ? 'bg-gray-800 border-gray-700'
          : 'bg-gradient-to-br from-tertiary-50 to-white border-tertiary-100'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-tertiary-700'}`}>Import Instructions</h3>
        <div className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-neutral-600'}`}>
          <p>Your spreadsheet should include the following columns:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium">Date</span> - in YYYY-MM-DD format (e.g., 2023-05-15)</li>
            <li><span className="font-medium">Time of Day</span> - must be one of: Breakfast, Lunch, or Dinner</li>
            <li><span className="font-medium">Glucose Level</span> - numeric value in mg/dL</li>
            <li><span className="font-medium">Food Description</span> - text describing what you ate</li>
          </ul>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>
            Note: If a record with the same date and time of day already exists, it will be updated with the new values.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportForm;
