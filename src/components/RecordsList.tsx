import { useState, useEffect, useMemo } from 'react';
import { GlucoseRecord, deleteGlucoseRecord } from '@/utils/supabase';
import { formatDisplayDate, groupRecordsByDate, groupRecordsByWeek, groupRecordsByMonth } from '@/utils/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import GlucoseBadge from './GlucoseBadge';

type RecordsListProps = {
  records: GlucoseRecord[];
  groupBy: 'day' | 'week' | 'month';
};

export default function RecordsList({ records, groupBy = 'day' }: RecordsListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<GlucoseRecord[]>(records);
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { theme } = useTheme();
  const toast = useToast();
  const isDark = theme === 'dark';

  useEffect(() => setItems(records), [records]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this reading? This cannot be undone.')) return;
    setDeletingId(id);
    const ok = await deleteGlucoseRecord(id);
    if (ok) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast.success('Reading deleted');
    } else {
      toast.error('Delete failed', 'The reading could not be removed.');
    }
    setDeletingId(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        r.food_description?.toLowerCase().includes(q) ||
        r.time_of_day.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        String(r.glucose_level).includes(q)
    );
  }, [items, query]);

  const groupedRecords = useMemo(() => {
    switch (groupBy) {
      case 'week': return groupRecordsByWeek(filtered);
      case 'month': return groupRecordsByMonth(filtered);
      default: return groupRecordsByDate(filtered);
    }
  }, [filtered, groupBy]);

  return (
    <div className="space-y-6">
      <div className="relative animate-fade-in-down">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by food, date, time or value..."
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className={`text-center py-12 px-4 rounded-xl border animate-scale-in ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <svg className={`w-12 h-12 mx-auto mb-3 animate-bounce-subtle ${isDark ? 'text-gray-500' : 'text-neutral-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-neutral-500'}`}>
            {query ? 'No records match your search' : 'No records found'}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-neutral-400'}`}>
            {query ? 'Try a different keyword' : 'Add glucose readings to see your history'}
          </p>
        </div>
      ) : (
        <div className="stagger space-y-6">
          {Object.entries(groupedRecords).map(([groupKey, groupRecords]) => {
            const open = !!expandedGroups[groupKey];
            return (
              <div key={groupKey} className="card-aurora hover-lift !p-0 overflow-hidden">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer select-none"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <div className="flex items-center">
                    <svg className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-primary-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className={`p-1 rounded-full transition-colors duration-300 ${
                      open ? (isDark ? 'bg-blue-900/50' : 'bg-primary-100') : (isDark ? 'bg-gray-700' : 'bg-neutral-100')
                    }`}>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${
                          open ? `rotate-180 ${isDark ? 'text-blue-400' : 'text-primary-600'}` : (isDark ? 'text-gray-400' : 'text-neutral-500')
                        }`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div
                  className="grid transition-all duration-500 ease-in-out"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-neutral-100'}`}>
                      <div className="overflow-x-auto">
                        <table className="table-minimal">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Time of Day</th>
                              <th>Glucose Level</th>
                              <th>Food Description</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupRecords.map((record) => (
                              <tr key={record.id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-neutral-50'} ${deletingId === record.id ? 'opacity-40' : ''}`}>
                                <td>{formatDisplayDate(record.date)}</td>
                                <td>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-primary-100 text-primary-800'
                                  }`}>
                                    {record.time_of_day}
                                  </span>
                                </td>
                                <td><GlucoseBadge value={record.glucose_level} size="sm" /></td>
                                <td className={`max-w-xs truncate ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
                                  {record.food_description}
                                </td>
                                <td>
                                  <button
                                    onClick={() => handleDelete(record.id)}
                                    disabled={deletingId === record.id}
                                    className="p-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors"
                                    aria-label="Delete reading"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
