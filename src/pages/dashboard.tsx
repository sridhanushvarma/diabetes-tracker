import { useEffect, useState } from 'react';
import ThemeLayout from '@/components/ThemeLayout';
import GlucoseChart from '@/components/GlucoseChart';
import StatsSummary from '@/components/StatsSummary';
import RecordForm from '@/components/RecordForm';
import { GlucoseRecord, supabase } from '@/utils/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function Dashboard() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayRecords, setTodayRecords] = useState<GlucoseRecord[]>([]);
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
        // Get all records for the user
        const { data, error } = await supabase
          .from('glucose_records')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        setRecords(data || []);

        // Filter today's records
        const today = new Date().toISOString().split('T')[0];
        setTodayRecords(data?.filter(record => record.date === today) || []);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, [user, router]);

  if (user === undefined || user === null) {
    return (
      <ThemeLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </ThemeLayout>
    );
  }

  return (
    <ThemeLayout title="Dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Welcome to Your Dashboard</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>Track your glucose levels and manage your diabetes journey</p>
        <div className="flex space-x-2 mt-4">
          <div className="h-1 w-20 bg-primary-500 rounded-full"></div>
          <div className="h-1 w-10 bg-accent-500 rounded-full"></div>
          <div className="h-1 w-5 bg-tertiary-500 rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={`rounded-xl shadow-sm p-6 border transition-all duration-300 hover:shadow-lg ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gradient-to-br from-white to-primary-50/30 border-primary-100'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold flex items-center ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-blue-900/50' : 'bg-primary-100'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <span>Glucose Trends</span>
              </h2>
              <Link href="/reports" className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${
                isDark
                  ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-300'
                  : 'bg-primary-50 hover:bg-primary-100 text-primary-600'
              }`}>
                <span>View Reports</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-accent-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>Loading chart data...</p>
                </div>
              </div>
            ) : (
              <GlucoseChart
                records={records.slice(0, 14)}
                title="Last 14 Days Glucose Levels"
              />
            )}
          </div>

          <StatsSummary records={records} />

          <div className={`rounded-xl shadow-sm p-6 border transition-all duration-300 hover:shadow-lg ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gradient-to-br from-white to-accent-50/30 border-accent-100'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold flex items-center ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-purple-900/50' : 'bg-accent-100'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-accent-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span>Today's Readings</span>
              </h2>
              <Link href="/records/add" className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${
                isDark
                  ? 'bg-purple-900/50 hover:bg-purple-900/70 text-purple-300'
                  : 'bg-accent-50 hover:bg-accent-100 text-accent-600'
              }`}>
                <span>Add Reading</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-accent-500 animate-spin"></div>
                  <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
              </div>
            ) : todayRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-minimal">
                  <thead>
                    <tr>
                      <th>Time of Day</th>
                      <th>Glucose Level</th>
                      <th>Food Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayRecords.map((record) => (
                      <tr key={record.id} className={`transition-colors duration-150 ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-accent-50/30'}`}>
                        <td>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-accent-100 text-accent-800'
                          }`}>
                            {record.time_of_day}
                          </span>
                        </td>
                        <td className="font-medium">
                          <span className={`px-2 py-1 rounded ${
                            isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-primary-50 text-primary-700'
                          }`}>
                            {record.glucose_level} mg/dL
                          </span>
                        </td>
                        <td className={`max-w-xs truncate ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>
                          {record.food_description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`text-center py-10 px-4 rounded-lg border ${
                isDark
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
                  : 'bg-gradient-to-br from-accent-50 to-white border-accent-100'
              }`}>
                <div className={`p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-sm ${
                  isDark ? 'bg-gray-600/80' : 'bg-white/80'
                }`}>
                  <svg className={`w-10 h-10 ${isDark ? 'text-purple-400' : 'text-accent-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>No Readings Today</h3>
                <p className={`mb-6 max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>Track your glucose levels by adding your first reading for today</p>
                <Link href="/records/add" className="bg-gradient-to-r from-accent-600 to-primary-600 hover:from-accent-500 hover:to-primary-500 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-opacity-50 inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Reading
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className={`rounded-xl shadow-sm p-6 border transition-all duration-300 hover:shadow-lg ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gradient-to-br from-tertiary-50 to-white border-tertiary-100'
          }`}>
            <h2 className={`text-xl font-semibold mb-6 flex items-center ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>
              <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-emerald-900/50' : 'bg-tertiary-100'}`}>
                <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-tertiary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Quick Add</span>
            </h2>
            <RecordForm />
          </div>

          <div className={`rounded-xl shadow-sm p-6 border transition-all duration-300 hover:shadow-lg ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gradient-to-br from-primary-50 to-white border-primary-100'
          }`}>
            <h2 className={`text-xl font-semibold mb-6 flex items-center ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>
              <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-blue-900/50' : 'bg-primary-100'}`}>
                <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Recent Activity</span>
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
                  <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-tertiary-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
              </div>
            ) : records.length > 0 ? (
              <div className="space-y-4">
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className={`p-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow ${
                    isDark
                      ? 'border border-gray-600 hover:bg-gray-700/50'
                      : 'border border-primary-50 hover:bg-primary-50/50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium flex items-center ${isDark ? 'text-blue-300' : 'text-primary-700'}`}>
                        <svg className={`w-3.5 h-3.5 mr-1 ${isDark ? 'text-blue-400' : 'text-primary-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {record.date}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-primary-100 text-primary-800'
                      }`}>
                        {record.glucose_level} mg/dL
                      </span>
                    </div>
                    <div className="flex items-center mt-1.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${
                        isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-accent-50 text-accent-800'
                      }`}>
                        {record.time_of_day}
                      </span>
                      <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-neutral-600'}`}>{record.food_description}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 text-center">
                  <Link href="/records/history" className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center transition-all duration-200 ${
                    isDark
                      ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-300'
                      : 'bg-primary-50 hover:bg-primary-100 text-primary-600'
                  }`}>
                    <span>View All Records</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 px-4 rounded-lg border ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600'
                  : 'bg-primary-50/50 border-primary-100'
              }`}>
                <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm ${
                  isDark ? 'bg-gray-600/80' : 'bg-white/80'
                }`}>
                  <svg className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-primary-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className={isDark ? 'text-gray-300' : 'text-neutral-500'}>No records found</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-neutral-400'}`}>Add records to see your history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeLayout>
  );
}
