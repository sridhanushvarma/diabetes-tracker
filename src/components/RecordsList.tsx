import { useState } from 'react';
import { GlucoseRecord } from '@/utils/supabase';
import { formatDisplayDate, groupRecordsByDate, groupRecordsByWeek, groupRecordsByMonth } from '@/utils/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';

type RecordsListProps = {
  records: GlucoseRecord[];
  groupBy: 'day' | 'week' | 'month';
};

export default function RecordsList({ records, groupBy = 'day' }: RecordsListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  let groupedRecords: Record<string, GlucoseRecord[]>;

  switch (groupBy) {
    case 'week':
      groupedRecords = groupRecordsByWeek(records);
      break;
    case 'month':
      groupedRecords = groupRecordsByMonth(records);
      break;
    case 'day':
    default:
      groupedRecords = groupRecordsByDate(records);
      break;
  }

  if (records.length === 0) {
    return (
      <div className={`text-center py-10 px-4 rounded-lg ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-neutral-50'
      }`}>
        <svg className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-neutral-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-neutral-500'}`}>No records found</p>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-neutral-400'}`}>Add glucose readings to see your history</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedRecords).map(([groupKey, groupRecords]) => (
        <div key={groupKey} className="card hover:shadow-lg transition-all duration-300">
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleGroup(groupKey)}
          >
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-primary-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>{groupKey}</h3>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-primary-100 text-primary-800'
              }`}>
                {groupRecords.length} record{groupRecords.length !== 1 ? 's' : ''}
              </span>
              <div className={`p-1 rounded-full transition-colors duration-200 ${
                expandedGroups[groupKey]
                  ? isDark ? 'bg-blue-900/50' : 'bg-primary-100'
                  : isDark ? 'bg-gray-700' : 'bg-neutral-100'
              }`}>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedGroups[groupKey]
                      ? isDark ? 'transform rotate-180 text-blue-400' : 'transform rotate-180 text-primary-600'
                      : isDark ? 'text-gray-400' : 'text-neutral-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {expandedGroups[groupKey] && (
            <div className={`border-t pt-2 ${isDark ? 'border-gray-700' : 'border-neutral-100'}`}>
              <div className="overflow-x-auto">
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
                    {groupRecords.map((record) => (
                      <tr key={record.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-neutral-50'}>
                        <td>
                          {formatDisplayDate(record.date)}
                        </td>
                        <td>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-primary-100 text-primary-800'
                          }`}>
                            {record.time_of_day}
                          </span>
                        </td>
                        <td className="font-medium">
                          {record.glucose_level} mg/dL
                        </td>
                        <td className={`max-w-xs truncate ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
                          {record.food_description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
