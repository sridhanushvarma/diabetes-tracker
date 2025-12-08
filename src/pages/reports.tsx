import { useEffect, useState } from 'react';
import ThemeLayout from '@/components/ThemeLayout';
import GlucoseChart from '@/components/GlucoseChart';
import StatsSummary from '@/components/StatsSummary';
import { GlucoseRecord, supabase } from '@/utils/supabase';
import { useRouter } from 'next/router';
import { groupRecordsByMonth } from '@/utils/dateUtils';
import { calculateAverage } from '@/utils/statsCalculator';
import { useTheme } from '@/contexts/ThemeContext';

function ReportsContent() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [monthlyAverages, setMonthlyAverages] = useState<{month: string; average: number}[]>([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Check if user is null after the auth state has been checked
    if (user === null) {
      router.push('/auth');
      return;
    }

    // If user is still undefined, we're still loading the auth state
    if (user === undefined) {
      return;
    }

    async function fetchRecords() {
      setLoading(true);

      try {
        // Calculate date range filter
        let dateFilter = '';
        const today = new Date();

        switch (dateRange) {
          case '1m':
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);
            dateFilter = oneMonthAgo.toISOString().split('T')[0];
            break;
          case '3m':
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            dateFilter = threeMonthsAgo.toISOString().split('T')[0];
            break;
          case '6m':
            const sixMonthsAgo = new Date(today);
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            dateFilter = sixMonthsAgo.toISOString().split('T')[0];
            break;
          case '1y':
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            dateFilter = oneYearAgo.toISOString().split('T')[0];
            break;
        }

        const { data, error } = await supabase
          .from('glucose_records')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', dateFilter)
          .order('date', { ascending: true });

        if (error) throw error;

        setRecords(data || []);

        // Calculate monthly averages
        const groupedByMonth = groupRecordsByMonth(data || []);
        const monthlyData = Object.entries(groupedByMonth).map(([month, monthRecords]) => ({
          month,
          average: calculateAverage(monthRecords)
        }));

        setMonthlyAverages(monthlyData);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, [user, router, dateRange]);

  const handleExportCSV = () => {
    if (records.length === 0) return;

    // Create CSV content
    const headers = ['Date', 'Time of Day', 'Glucose Level (mg/dL)', 'Food Description'];
    const csvRows = [headers.join(',')];

    records.forEach(record => {
      const row = [
        record.date,
        record.time_of_day,
        record.glucose_level,
        `"${record.food_description.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `diabetes-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (user === undefined || user === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-primary-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Glucose Reports & Analytics</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Analyze your glucose trends and patterns over time</p>
      </div>

      <div className={`rounded-xl shadow-sm p-6 border mb-8 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className={`text-lg font-medium flex items-center ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              <svg className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Report Settings
            </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Customize your report view and export data</p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="w-full sm:w-auto">
                <label htmlFor="dateRange" className="form-label">Date Range</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <select
                    id="dateRange"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as '1m' | '3m' | '6m' | '1y')}
                    className="input-field pl-10 appearance-none pr-8"
                  >
                    <option value="1m">Last Month</option>
                    <option value="3m">Last 3 Months</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-end w-full sm:w-auto">
                <button
                  onClick={handleExportCSV}
                  disabled={records.length === 0 || loading}
                  className="btn-secondary w-full sm:w-auto flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-primary-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading reports...</p>
            </div>
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-8">
            <StatsSummary records={records} />

            <div className={`rounded-xl shadow-sm p-6 border hover:shadow-lg transition-all duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <GlucoseChart records={records} title={`Glucose Levels - ${dateRange === '1m' ? 'Last Month' : dateRange === '3m' ? 'Last 3 Months' : dateRange === '6m' ? 'Last 6 Months' : 'Last Year'}`} />
            </div>

            <div className={`rounded-xl shadow-sm p-6 border hover:shadow-lg transition-all duration-300 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center mb-6">
                <svg className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Monthly Averages</h2>
              </div>

              {monthlyAverages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className={`w-full ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <thead>
                      <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Month</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Average Glucose Level</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyAverages.map((item, index) => {
                        const prevAvg = index > 0 ? monthlyAverages[index - 1].average : null;
                        const trend = prevAvg !== null
                          ? item.average > prevAvg
                            ? 'up'
                            : item.average < prevAvg
                              ? 'down'
                              : 'same'
                          : 'same';

                        return (
                          <tr key={item.month} className={isDark ? 'hover:bg-gray-700/50 border-b border-gray-700' : 'hover:bg-gray-50 border-b border-gray-100'}>
                            <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {item.month}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.average} mg/dL
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {trend === 'up' && (
                                <span className={`flex items-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">Increased</span>
                                </span>
                              )}
                              {trend === 'down' && (
                                <span className={`flex items-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">Decreased</span>
                                </span>
                              )}
                              {trend === 'same' && (
                                <span className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">No Change</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-8 px-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Not enough data to show monthly averages</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Add more readings across different months to see trends</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`text-center py-12 px-4 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100'}`}>
            <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>No Records Found</h3>
            <p className={`mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No glucose records found for the selected time period. Try selecting a different date range or add new readings.</p>
            <button
              onClick={() => router.push('/records/add')}
              className="btn-primary inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Your First Reading
            </button>
          </div>
        )}
      </div>
  );
}

// Wrapper component to provide theme context
export default function Reports() {
  return (
    <ThemeLayout title="Reports">
      <ReportsContent />
    </ThemeLayout>
  );
}
