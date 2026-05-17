import { useEffect, useState } from 'react';
import ThemeLayout from '@/components/ThemeLayout';
import RecordsList from '@/components/RecordsList';
import { GlucoseRecord, supabase } from '@/utils/supabase';
import { useRouter } from 'next/router';
import { useTheme } from '@/contexts/ThemeContext';

function RecordsHistoryContent() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState<'all' | '1m' | '3m' | '6m' | '1y'>('1m');
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
          default:
            // All records, no date filter
            break;
        }

        let query = supabase
          .from('glucose_records')
          .select('*')
          .eq('user_id', user.id);

        if (dateFilter) {
          query = query.gte('date', dateFilter);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;

        setRecords(data || []);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, [user, router, dateRange]);

  if (user === undefined || user === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 animate-fade-in-down">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 gradient-text-animated">Your Glucose Records</h1>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div>
            <label htmlFor="groupBy" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Group By</label>
            <select
              id="groupBy"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className="input-field"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateRange" className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date Range</label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'all' | '1m' | '3m' | '6m' | '1y')}
              className="input-field"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-aurora"><div className="skeleton h-14 w-full rounded-lg" /></div>
          ))}
        </div>
      ) : (
        <RecordsList records={records} groupBy={groupBy} />
      )}
    </div>
  );
}

// Wrapper component to provide theme context
export default function RecordsHistory() {
  return (
    <ThemeLayout title="Records History">
      <RecordsHistoryContent />
    </ThemeLayout>
  );
}
