import { useEffect, useState, useCallback } from 'react';
import ThemeLayout from '@/components/ThemeLayout';
import GlucoseChart from '@/components/GlucoseChart';
import StatsSummary from '@/components/StatsSummary';
import RecordForm from '@/components/RecordForm';
import InsightsPanel from '@/components/InsightsPanel';
import GlucoseBadge from '@/components/GlucoseBadge';
import Reveal from '@/components/Reveal';
import AnimatedCounter from '@/components/AnimatedCounter';
import { CardSkeleton, ChartSkeleton } from '@/components/Skeleton';
import { GlucoseRecord, supabase, deleteGlucoseRecord } from '@/utils/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { loggingStreak, meanGlucose, trendDirection } from '@/utils/glucoseAnalytics';

export default function Dashboard() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayRecords, setTodayRecords] = useState<GlucoseRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRecords = useCallback(async (uid: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('glucose_records')
        .select('*')
        .eq('user_id', uid)
        .order('date', { ascending: false });

      if (error) throw error;

      setRecords(data || []);
      const today = new Date().toISOString().split('T')[0];
      setTodayRecords(data?.filter((r) => r.date === today) || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Could not load records', 'Please check your connection and retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user === null) {
      router.push('/auth');
      return;
    }
    if (user === undefined) return;
    fetchRecords(user.id);
  }, [user, router, fetchRecords]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this reading? This cannot be undone.')) return;
    const ok = await deleteGlucoseRecord(id);
    if (ok) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setTodayRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success('Reading deleted');
    } else {
      toast.error('Delete failed', 'The reading could not be removed.');
    }
  };

  if (user === undefined || user === null) {
    return (
      <ThemeLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin" />
            <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-accent-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
        </div>
      </ThemeLayout>
    );
  }

  const latest = records[0];
  const streak = loggingStreak(records);
  const avg = meanGlucose(records);
  const trend = trendDirection(records.slice(0, 14));

  const kpis = [
    {
      label: "Today's Readings",
      value: todayRecords.length,
      suffix: ` / 3`,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      tint: isDark ? 'from-blue-900/40 to-blue-800/10 text-blue-300' : 'from-blue-100 to-blue-50 text-blue-700',
    },
    {
      label: 'Overall Average',
      value: avg,
      suffix: ' mg/dL',
      decimals: 1,
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      tint: isDark ? 'from-purple-900/40 to-purple-800/10 text-purple-300' : 'from-purple-100 to-purple-50 text-purple-700',
    },
    {
      label: 'Logging Streak',
      value: streak,
      suffix: streak === 1 ? ' day' : ' days',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      tint: isDark ? 'from-amber-900/40 to-amber-800/10 text-amber-300' : 'from-amber-100 to-amber-50 text-amber-700',
    },
    {
      label: 'Recent Trend',
      value: 0,
      text: trend === 'rising' ? 'Rising' : trend === 'falling' ? 'Falling' : 'Steady',
      icon: trend === 'rising'
        ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
        : trend === 'falling'
        ? 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
        : 'M5 12h14',
      tint: isDark ? 'from-emerald-900/40 to-emerald-800/10 text-emerald-300' : 'from-emerald-100 to-emerald-50 text-emerald-700',
    },
  ];

  return (
    <ThemeLayout title="Dashboard">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text-animated">Welcome to Your Dashboard</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>
            Track your glucose levels and manage your diabetes journey
          </p>
          <div className="flex space-x-2 mt-4">
            <div className="h-1 w-20 bg-primary-500 rounded-full animate-pulse-glow" />
            <div className="h-1 w-10 bg-accent-500 rounded-full" />
            <div className="h-1 w-5 bg-tertiary-500 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-neutral-400'}`}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => user && fetchRecords(user.id, true)}
            disabled={refreshing}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200'
            }`}
            aria-label="Refresh data"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        {kpis.map((k) => (
          <div key={k.label} className={`card-aurora hover-lift sheen bg-gradient-to-br ${k.tint}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl md:text-3xl font-bold">
                  {k.text ? k.text : <AnimatedCounter value={k.value} decimals={k.decimals || 0} suffix={k.suffix} />}
                </p>
                <p className="text-xs mt-1 opacity-80">{k.label}</p>
              </div>
              <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={k.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Reveal>
            <div className={`card-aurora hover-lift ${isDark ? '' : ''}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold flex items-center ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>
                  <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-blue-900/50' : 'bg-primary-100'}`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <span>Glucose Trends</span>
                </h2>
                <Link href="/reports" className={`link-underline px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${
                  isDark ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-300' : 'bg-primary-50 hover:bg-primary-100 text-primary-600'
                }`}>
                  <span>View Reports</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              {loading ? <ChartSkeleton /> : (
                <GlucoseChart records={records.slice(0, 14)} title="Last 14 Days Glucose Levels" />
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            {loading ? (
              <div className="card-aurora"><CardSkeleton rows={2} /></div>
            ) : (
              <StatsSummary records={records} />
            )}
          </Reveal>

          <Reveal delay={120}>
            {loading ? (
              <div className="card-aurora"><CardSkeleton rows={3} /></div>
            ) : (
              <InsightsPanel records={records} />
            )}
          </Reveal>

          <Reveal delay={160}>
            <div className="card-aurora hover-lift">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold flex items-center ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>
                  <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-purple-900/50' : 'bg-accent-100'}`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-accent-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span>Today&apos;s Readings</span>
                </h2>
                <Link href="/records/add" className={`link-underline px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${
                  isDark ? 'bg-purple-900/50 hover:bg-purple-900/70 text-purple-300' : 'bg-accent-50 hover:bg-accent-100 text-accent-600'
                }`}>
                  <span>Add Reading</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Link>
              </div>

              {loading ? (
                <CardSkeleton rows={3} />
              ) : todayRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table-minimal">
                    <thead>
                      <tr>
                        <th>Time of Day</th>
                        <th>Glucose Level</th>
                        <th>Food Description</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="stagger">
                      {todayRecords.map((record) => (
                        <tr key={record.id} className={`transition-colors duration-150 ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-accent-50/30'}`}>
                          <td>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-accent-100 text-accent-800'
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
              ) : (
                <div className={`text-center py-10 px-4 rounded-lg border ${
                  isDark ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600' : 'bg-gradient-to-br from-accent-50 to-white border-accent-100'
                }`}>
                  <div className={`p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-sm animate-bounce-subtle ${isDark ? 'bg-gray-600/80' : 'bg-white/80'}`}>
                    <svg className={`w-10 h-10 ${isDark ? 'text-purple-400' : 'text-accent-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>No Readings Today</h3>
                  <p className={`mb-6 max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>Track your glucose levels by adding your first reading for today</p>
                  <Link href="/records/add" className="btn-glow inline-flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Your First Reading
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <div className="space-y-8">
          <Reveal delay={60}>
            <div className="card-aurora hover-lift">
              <h2 className={`text-xl font-semibold mb-6 flex items-center ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-emerald-900/50' : 'bg-tertiary-100'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-tertiary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Quick Add</span>
              </h2>
              <RecordForm onSaved={() => user && fetchRecords(user.id, true)} />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card-aurora hover-lift">
              <h2 className={`text-xl font-semibold mb-6 flex items-center ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>
                <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-blue-900/50' : 'bg-primary-100'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Recent Activity</span>
              </h2>
              {loading ? (
                <CardSkeleton rows={4} />
              ) : records.length > 0 ? (
                <div className="space-y-4 stagger">
                  {records.slice(0, 5).map((record) => (
                    <div key={record.id} className={`p-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 ${
                      isDark ? 'border border-gray-600 hover:bg-gray-700/50' : 'border border-primary-50 hover:bg-primary-50/50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium flex items-center ${isDark ? 'text-blue-300' : 'text-primary-700'}`}>
                          <svg className={`w-3.5 h-3.5 mr-1 ${isDark ? 'text-blue-400' : 'text-primary-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {record.date}
                        </span>
                        <GlucoseBadge value={record.glucose_level} size="sm" showValue />
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
                    <Link href="/records/history" className={`link-underline px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center transition-all duration-200 ${
                      isDark ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-300' : 'bg-primary-50 hover:bg-primary-100 text-primary-600'
                    }`}>
                      <span>View All Records</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-8 px-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-primary-50/50 border-primary-100'}`}>
                  <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm animate-bounce-subtle ${isDark ? 'bg-gray-600/80' : 'bg-white/80'}`}>
                    <svg className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-primary-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className={isDark ? 'text-gray-300' : 'text-neutral-500'}>No records found</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-neutral-400'}`}>Add records to see your history</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </ThemeLayout>
  );
}
