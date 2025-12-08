import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { GlucoseRecord } from '@/utils/supabase';
import { prepareChartData, prepareChartDataDarkMode } from '@/utils/statsCalculator';
import { useTheme } from '@/contexts/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type GlucoseChartProps = {
  records: GlucoseRecord[];
  title?: string;
};

export default function GlucoseChart({ records, title = 'Glucose Levels Over Time' }: GlucoseChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (records.length > 0) {
      setChartData(isDark ? prepareChartDataDarkMode(records) : prepareChartData(records));
    }
  }, [records, isDark]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: isDark ? '#d1d5db' : '#374151',
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f3f4f6' : '#1f2937',
        bodyColor: isDark ? '#d1d5db' : '#4b5563',
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `Glucose: ${context.parsed.y} mg/dL`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.5)',
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: isDark ? '#9ca3af' : '#6b7280',
          padding: 8,
        },
        title: {
          display: true,
          text: 'Glucose Level (mg/dL)',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 500,
          },
          color: isDark ? '#9ca3af' : '#4b5563',
          padding: {
            bottom: 10,
          }
        },
      },
      x: {
        grid: {
          display: false,
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          color: isDark ? '#9ca3af' : '#6b7280',
          padding: 8,
        },
      }
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 2,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: isDark ? '#1f2937' : 'white',
      }
    },
  };

  if (!chartData || records.length === 0) {
    return (
      <div className={`h-64 flex flex-col items-center justify-center rounded-lg p-6 border ${
        isDark
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
          : 'bg-gradient-to-br from-primary-50 to-accent-50/30 border-primary-100'
      }`}>
        <div className={`p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-sm ${
          isDark ? 'bg-gray-700/80' : 'bg-white/80'
        }`}>
          <svg className={`w-10 h-10 ${isDark ? 'text-primary-400' : 'text-primary-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-neutral-800'}`}>No Chart Data</h3>
        <p className={`text-center ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>No data available to display chart</p>
        <p className={`text-sm text-center mt-1 ${isDark ? 'text-gray-500' : 'text-neutral-400'}`}>Add glucose readings to see your trends over time</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold gradient-text">{title}</h3>
        <div className={`flex items-center text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>
          <svg className="w-4 h-4 mr-1 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>Track your glucose levels over time</span>
        </div>
      </div>
      <div className={`h-72 md:h-80 p-4 rounded-lg shadow-sm ${
        isDark
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-neutral-100'
      }`}>
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}
