import { GlucoseRecord } from '@/utils/supabase';
import {
  calculateWeeklyAverage,
  calculateMonthlyAverage,
  calculateYearlyAverage,
  getHighestValue,
  getLowestValue,
} from '@/utils/statsCalculator';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedCounter from './AnimatedCounter';

type StatsSummaryProps = {
  records: GlucoseRecord[];
};

export default function StatsSummary({ records }: StatsSummaryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = [
    { name: 'Weekly Average', value: calculateWeeklyAverage(records), suffix: ' mg/dL', decimals: 1, kind: 'avg' },
    { name: 'Monthly Average', value: calculateMonthlyAverage(records), suffix: ' mg/dL', decimals: 1, kind: 'avg' },
    { name: 'Yearly Average', value: calculateYearlyAverage(records), suffix: ' mg/dL', decimals: 1, kind: 'avg' },
    { name: 'Highest Reading', value: getHighestValue(records), suffix: ' mg/dL', decimals: 0, kind: 'high' },
    { name: 'Lowest Reading', value: getLowestValue(records), suffix: ' mg/dL', decimals: 0, kind: 'low' },
    { name: 'Total Readings', value: records.length, suffix: '', decimals: 0, kind: 'total' },
  ];

  const palette: Record<string, { bg: string; text: string; icon: string; border: string; path: string }> = {
    avg: {
      bg: isDark ? 'from-blue-900/40 to-blue-800/10' : 'from-blue-100 to-blue-50',
      text: isDark ? 'text-blue-300' : 'text-blue-800',
      icon: isDark ? 'text-blue-400' : 'text-blue-600',
      border: isDark ? 'border-gray-600' : 'border-blue-200',
      path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    high: {
      bg: isDark ? 'from-rose-900/40 to-rose-800/10' : 'from-rose-100 to-rose-50',
      text: isDark ? 'text-rose-300' : 'text-rose-800',
      icon: isDark ? 'text-rose-400' : 'text-rose-600',
      border: isDark ? 'border-gray-600' : 'border-rose-200',
      path: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    },
    low: {
      bg: isDark ? 'from-emerald-900/40 to-emerald-800/10' : 'from-emerald-100 to-emerald-50',
      text: isDark ? 'text-emerald-300' : 'text-emerald-800',
      icon: isDark ? 'text-emerald-400' : 'text-emerald-600',
      border: isDark ? 'border-gray-600' : 'border-emerald-200',
      path: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
    },
    total: {
      bg: isDark ? 'from-purple-900/40 to-purple-800/10' : 'from-purple-100 to-purple-50',
      text: isDark ? 'text-purple-300' : 'text-purple-800',
      icon: isDark ? 'text-purple-400' : 'text-purple-600',
      border: isDark ? 'border-gray-600' : 'border-purple-200',
      path: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
    },
  };

  return (
    <div className="card-aurora hover-lift overflow-hidden relative">
      <div className={`blob w-32 h-32 -right-10 -top-10 ${isDark ? 'bg-blue-700/20' : 'bg-primary-200/40'}`} />
      <div className={`blob w-32 h-32 -left-10 -bottom-10 ${isDark ? 'bg-emerald-700/20' : 'bg-tertiary-200/40'}`} style={{ animationDelay: '3s' }} />

      <div className="relative">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg mr-3 shadow-sm animate-pulse-glow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold gradient-text-animated">Statistics Summary</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger">
          {stats.map((stat) => {
            const p = palette[stat.kind];
            return (
              <div
                key={stat.name}
                className={`bg-gradient-to-br ${p.bg} p-4 rounded-xl border ${p.border} shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1.5 sheen`}
              >
                <div className="flex items-center mb-2">
                  <div className={`${isDark ? 'bg-gray-700/80' : 'bg-white'} p-1.5 rounded-md shadow-sm mr-2`}>
                    <svg className={`w-3.5 h-3.5 ${p.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.path} />
                    </svg>
                  </div>
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{stat.name}</p>
                </div>
                <p className={`text-xl font-bold ${p.text} mt-1`}>
                  <AnimatedCounter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
