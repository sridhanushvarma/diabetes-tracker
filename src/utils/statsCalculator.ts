import { GlucoseRecord } from './supabase';
import { parseISO, isWithinInterval } from 'date-fns';
import { getCurrentWeekRange, getCurrentMonthRange, getCurrentYearRange } from './dateUtils';

export function calculateAverage(records: GlucoseRecord[]): number {
  if (records.length === 0) return 0;

  const sum = records.reduce((total, record) => total + record.glucose_level, 0);
  return Math.round((sum / records.length) * 10) / 10; // Round to 1 decimal place
}

export function calculateWeeklyAverage(records: GlucoseRecord[]): number {
  const weekRange = getCurrentWeekRange();

  const weekRecords = records.filter(record => {
    const recordDate = parseISO(record.date);
    return isWithinInterval(recordDate, { start: weekRange.start, end: weekRange.end });
  });

  return calculateAverage(weekRecords);
}

export function calculateMonthlyAverage(records: GlucoseRecord[]): number {
  const monthRange = getCurrentMonthRange();

  const monthRecords = records.filter(record => {
    const recordDate = parseISO(record.date);
    return isWithinInterval(recordDate, { start: monthRange.start, end: monthRange.end });
  });

  return calculateAverage(monthRecords);
}

export function calculateYearlyAverage(records: GlucoseRecord[]): number {
  const yearRange = getCurrentYearRange();

  const yearRecords = records.filter(record => {
    const recordDate = parseISO(record.date);
    return isWithinInterval(recordDate, { start: yearRange.start, end: yearRange.end });
  });

  return calculateAverage(yearRecords);
}

export function getHighestValue(records: GlucoseRecord[]): number {
  if (records.length === 0) return 0;

  return Math.max(...records.map(record => record.glucose_level));
}

export function getLowestValue(records: GlucoseRecord[]): number {
  if (records.length === 0) return 0;

  return Math.min(...records.map(record => record.glucose_level));
}

export function prepareChartData(records: GlucoseRecord[]) {
  // Sort records by date
  const sortedRecords = [...records].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by date and time of day
  const groupedData: Record<string, Record<string, number>> = {};

  sortedRecords.forEach(record => {
    if (!groupedData[record.date]) {
      groupedData[record.date] = {};
    }
    groupedData[record.date][record.time_of_day] = record.glucose_level;
  });

  // Convert to chart format
  const labels = Object.keys(groupedData);
  const breakfastData = labels.map(date => groupedData[date]['Breakfast'] || null);
  const lunchData = labels.map(date => groupedData[date]['Lunch'] || null);
  const dinnerData = labels.map(date => groupedData[date]['Dinner'] || null);

  return {
    labels,
    datasets: [
      {
        label: 'Breakfast',
        data: breakfastData,
        borderColor: '#0ea5e9', // primary-500
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#ffffff',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Lunch',
        data: lunchData,
        borderColor: '#d946ef', // accent-500
        backgroundColor: 'rgba(217, 70, 239, 0.1)',
        pointBackgroundColor: '#d946ef',
        pointBorderColor: '#ffffff',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Dinner',
        data: dinnerData,
        borderColor: '#14b8a6', // tertiary-500
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        pointBackgroundColor: '#14b8a6',
        pointBorderColor: '#ffffff',
        fill: false,
        tension: 0.3,
      },
    ],
  };
}

// Dark mode chart colors - more vibrant and visible on dark backgrounds
export function prepareChartDataDarkMode(records: GlucoseRecord[]) {
  // Sort records by date
  const sortedRecords = [...records].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by date and time of day
  const groupedData: Record<string, Record<string, number>> = {};

  sortedRecords.forEach(record => {
    if (!groupedData[record.date]) {
      groupedData[record.date] = {};
    }
    groupedData[record.date][record.time_of_day] = record.glucose_level;
  });

  // Convert to chart format
  const labels = Object.keys(groupedData);
  const breakfastData = labels.map(date => groupedData[date]['Breakfast'] || null);
  const lunchData = labels.map(date => groupedData[date]['Lunch'] || null);
  const dinnerData = labels.map(date => groupedData[date]['Dinner'] || null);

  return {
    labels,
    datasets: [
      {
        label: 'Breakfast',
        data: breakfastData,
        borderColor: '#60a5fa', // blue-400 - brighter for dark mode
        backgroundColor: 'rgba(96, 165, 250, 0.15)',
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#1f2937',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Lunch',
        data: lunchData,
        borderColor: '#c084fc', // purple-400 - brighter for dark mode
        backgroundColor: 'rgba(192, 132, 252, 0.15)',
        pointBackgroundColor: '#c084fc',
        pointBorderColor: '#1f2937',
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Dinner',
        data: dinnerData,
        borderColor: '#34d399', // emerald-400 - brighter for dark mode
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        pointBackgroundColor: '#34d399',
        pointBorderColor: '#1f2937',
        fill: false,
        tension: 0.3,
      },
    ],
  };
}
