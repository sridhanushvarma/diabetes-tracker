import { useEffect, useState } from 'react';
import ThemeLayout from '@/components/ThemeLayout';
import GlucoseChart from '@/components/GlucoseChart';
import StatsSummary from '@/components/StatsSummary';
import InsightsPanel from '@/components/InsightsPanel';
import Reveal from '@/components/Reveal';
import { CardSkeleton } from '@/components/Skeleton';
import { GlucoseRecord, supabase } from '@/utils/supabase';
import { useRouter } from 'next/router';
import { groupRecordsByMonth } from '@/utils/dateUtils';
import { calculateAverage } from '@/utils/statsCalculator';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';

function ReportsContent() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [monthlyAverages, setMonthlyAverages] = useState<{ month: string; average: number }[]>([]);
  const { theme } = useTheme();
  const toast = useToast();
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
      (_event, session) => setUser(session?.user || null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user === null) {
      router.push('/auth');
      return;
    }
    if (user === undefined) return;

    async function fetchRecords() {
      setLoading(true);
      try {
        const today = new Date();
        let dateFilter = '';
        switch (dateRange) {
          case '1m': { const d = new Date(today); d.setMonth(today.getMonth() - 1); dateFilter = d.toISOString().split('T')[0]; break; }
          case '3m': { const d = new Date(today); d.setMonth(today.getMonth() - 3); dateFilter = d.toISOString().split('T')[0]; break; }
          case '6m': { const d = new Date(today); d.setMonth(today.getMonth() - 6); dateFilter = d.toISOString().split('T')[0]; break; }
          case '1y': { const d = new Date(today); d.setFullYear(today.getFullYear() - 1); dateFilter = d.toISOString().split('T')[0]; break; }
        }

        const { data, error } = await supabase
          .from('glucose_records')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', dateFilter)
          .order('date', { ascending: true });

        if (error) throw error;
        setRecords(data || []);

        const groupedByMonth = groupRecordsByMonth(data || []);
        setMonthlyAverages(
          Object.entries(groupedByMonth).map(([month, monthRecords]) => ({
            month,
            average: calculateAverage(monthRecords),
          }))
        );
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error('Could not load reports');
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [user, router, dateRange, toast]);

  const download = (content: string, type: string, ext: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diabetes-data-${new Date().toISOString().split('T')[0]}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Date', 'Time of Day', 'Glucose Level (mg/dL)', 'Food Description'];
    const rows = [headers.join(',')];
    records.forEach((r) =>
      rows.push([r.date, r.time_of_day, r.glucose_level, `"${r.food_description.replace(/"/g, '""')}"`].join(','))
    );
    download(rows.join('\n'), 'text/csv;charset=utf-8;', 'csv');
    toast.success('CSV exported', `${records.length} records downloaded.`);
  };

  const handleExportJSON = () => {
    if (records.length === 0) return;
    download(JSON.stringify(records, null, 2), 'application/json', 'json');
    toast.success('JSON exported', `${records.length} records downloaded.`);
  };

  const handlePrint = () => {
    toast.info('Preparing print view', 'Use "Save as PDF" in the print dialog.');
    setTimeout(() => window.print(), 300);
  };

  if (user === undefined || user === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  const rangeLabel =
    dateRange === '1m' ? 'Last Month' : dateRange === '3m' ? 'Last 3 Months' : dateRange === '6m' ? 'Last 6 Months' : 'Last Year';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold gradient-text-animated">Glucose Reports &amp; Analytics</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Analyze your glucose trends and patterns over time
        </p>
        <div className="flex space-x-2 mt-4">
          <div className="h-1 w-20 bg-primary-500 rounded-full animate-pulse-glow" />
          <div className="h-1 w-10 bg-accent-500 rounded-full" />
          <div className="h-1 w-5 bg-tertiary-500 rounded-full" />
        </div>
      </div>

      <Reveal>
        <div className="card-aurora mb-8 print:hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className={`text-lg font-medium flex items-center ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                <svg className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Report Settings
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Customize your report view and export data</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as '1m' | '3m' | '6m' | '1y')}
                  className="input-field pl-10 appearance-none pr-8"
                >
                  <option value="1m">Last Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>

              <button onClick={handleExportCSV} disabled={records.length === 0 || loading} className="btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              <button onClick={handleExportJSON} disabled={records.length === 0 || loading} className="btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                JSON
              </button>
              <button onClick={handlePrint} disabled={records.length === 0 || loading} className="btn-glow">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                PDF
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <div className="card-aurora"><CardSkeleton rows={4} /></div>
      ) : records.length > 0 ? (
        <div className="space-y-8">
          <Reveal><StatsSummary records={records} /></Reveal>
          <Reveal delay={80}><InsightsPanel records={records} /></Reveal>
          <Reveal delay={120}>
            <div className="card-aurora">
              <GlucoseChart records={records} title={`Glucose Levels - ${rangeLabel}`} />
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="card-aurora">
              <div className="flex items-center mb-6">
                <svg className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Monthly Averages</h2>
              </div>

              {monthlyAverages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className={`w-full ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <thead>
                      <tr className={isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                        <th className="text-left py-3 px-4 font-semibold">Month</th>
                        <th className="text-left py-3 px-4 font-semibold">Average Glucose Level</th>
                        <th className="text-left py-3 px-4 font-semibold">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="stagger">
                      {monthlyAverages.map((item, index) => {
                        const prevAvg = index > 0 ? monthlyAverages[index - 1].average : null;
                        const trend = prevAvg !== null
                          ? item.average > prevAvg ? 'up' : item.average < prevAvg ? 'down' : 'same'
                          : 'same';
                        return (
                          <tr key={item.month} className={isDark ? 'hover:bg-gray-700/50 border-b border-gray-700' : 'hover:bg-gray-50 border-b border-gray-100'}>
                            <td className="py-3 px-4 font-medium">{item.month}</td>
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
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">Increased</span>
                                </span>
                              )}
                              {trend === 'down' && (
                                <span className={`flex items-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">Decreased</span>
                                </span>
                              )}
                              {trend === 'same' && (
                                <span className={`flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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
          </Reveal>
        </div>
      ) : (
        <div className={`text-center py-12 px-4 rounded-xl card-aurora animate-scale-in`}>
          <svg className={`w-16 h-16 mx-auto mb-4 animate-bounce-subtle ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>No Records Found</h3>
          <p className={`mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No glucose records found for the selected time period. Try a different date range or add new readings.</p>
          <button onClick={() => router.push('/records/add')} className="btn-glow inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Reading
          </button>
        </div>
      )}
    </div>
  );
}

export default function Reports() {
  return (
    <ThemeLayout title="Reports">
      <ReportsContent />
    </ThemeLayout>
  );
}
