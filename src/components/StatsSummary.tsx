import { GlucoseRecord } from '@/utils/supabase';
import {
  calculateWeeklyAverage,
  calculateMonthlyAverage,
  calculateYearlyAverage,
  getHighestValue,
  getLowestValue
} from '@/utils/statsCalculator';
import { useTheme } from '@/contexts/ThemeContext';

type StatsSummaryProps = {
  records: GlucoseRecord[];
};

export default function StatsSummary({ records }: StatsSummaryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const weeklyAvg = calculateWeeklyAverage(records);
  const monthlyAvg = calculateMonthlyAverage(records);
  const yearlyAvg = calculateYearlyAverage(records);
  const highestValue = getHighestValue(records);
  const lowestValue = getLowestValue(records);

  const stats = [
    { name: 'Weekly Average', value: `${weeklyAvg} mg/dL` },
    { name: 'Monthly Average', value: `${monthlyAvg} mg/dL` },
    { name: 'Yearly Average', value: `${yearlyAvg} mg/dL` },
    { name: 'Highest Reading', value: `${highestValue} mg/dL` },
    { name: 'Lowest Reading', value: `${lowestValue} mg/dL` },
    { name: 'Total Readings', value: records.length },
  ];

  return (
    <div className={`rounded-xl shadow-sm p-6 border transition-all duration-300 hover:shadow-lg overflow-hidden relative ${
      isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-neutral-100'
    }`}>
      {/* Background decoration */}
      <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full opacity-20 ${
        isDark
          ? 'bg-gradient-to-br from-blue-900 to-purple-900'
          : 'bg-gradient-to-br from-primary-100 to-accent-100'
      }`}></div>
      <div className={`absolute -left-16 -bottom-16 w-32 h-32 rounded-full opacity-20 ${
        isDark
          ? 'bg-gradient-to-tr from-emerald-900 to-blue-900'
          : 'bg-gradient-to-tr from-tertiary-100 to-primary-100'
      }`}></div>

      <div className="relative">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg mr-3 shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold gradient-text">Statistics Summary</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            // Determine color based on stat type - with dark mode variants
            let bgGradient = isDark ? "from-blue-900/40 to-blue-800/20" : "from-primary-50 to-primary-100/50";
            let textColor = isDark ? "text-blue-300" : "text-primary-700";
            let iconColor = isDark ? "text-blue-400" : "text-primary-500";
            let iconBg = isDark ? "bg-gray-700/80" : "bg-white/80";
            let borderColor = isDark ? "border-gray-600" : "border-white";
            let labelColor = isDark ? "text-gray-300" : "text-neutral-600";
            let iconPath = "";

            if (stat.name.includes("Average")) {
              bgGradient = isDark ? "from-blue-900/40 to-blue-800/20" : "from-primary-50 to-primary-100/50";
              textColor = isDark ? "text-blue-300" : "text-primary-700";
              iconColor = isDark ? "text-blue-400" : "text-primary-500";
              iconPath = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z";
            } else if (stat.name.includes("Highest")) {
              bgGradient = isDark ? "from-rose-900/40 to-rose-800/20" : "from-rose-50 to-rose-100/50";
              textColor = isDark ? "text-rose-300" : "text-rose-700";
              iconColor = isDark ? "text-rose-400" : "text-rose-500";
              iconPath = "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6";
            } else if (stat.name.includes("Lowest")) {
              bgGradient = isDark ? "from-emerald-900/40 to-emerald-800/20" : "from-tertiary-50 to-tertiary-100/50";
              textColor = isDark ? "text-emerald-300" : "text-tertiary-700";
              iconColor = isDark ? "text-emerald-400" : "text-tertiary-500";
              iconPath = "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6";
            } else if (stat.name.includes("Total")) {
              bgGradient = isDark ? "from-purple-900/40 to-purple-800/20" : "from-accent-50 to-accent-100/50";
              textColor = isDark ? "text-purple-300" : "text-accent-700";
              iconColor = isDark ? "text-purple-400" : "text-accent-500";
              iconPath = "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z";
            }

            return (
              <div
                key={stat.name}
                className={`bg-gradient-to-br ${bgGradient} p-4 rounded-xl border ${borderColor} shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1`}
              >
                <div className="flex items-center mb-2">
                  <div className={`${iconBg} p-1.5 rounded-md shadow-sm mr-2`}>
                    <svg className={`w-3.5 h-3.5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                  </div>
                  <p className={`text-xs font-medium ${labelColor}`}>{stat.name}</p>
                </div>
                <p className={`text-xl font-bold ${textColor} mt-1`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
