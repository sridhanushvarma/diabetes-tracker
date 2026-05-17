import { GlucoseRecord } from './supabase';
import { parseISO, differenceInCalendarDays } from 'date-fns';

/**
 * Clinical analytics for glucose data.
 *
 * Reference ranges follow widely published ADA / international CGM consensus
 * targets. These are informational classifications for visualisation only and
 * are not a substitute for professional medical advice.
 */

export type GlucoseStatus =
  | 'very-low'
  | 'low'
  | 'in-range'
  | 'elevated'
  | 'high';

export interface TargetRange {
  low: number;
  high: number;
}

export const DEFAULT_TARGET_RANGE: TargetRange = { low: 70, high: 180 };

export interface StatusMeta {
  status: GlucoseStatus;
  label: string;
  /** Tailwind utility groups for light theme */
  light: { bg: string; text: string; ring: string; dot: string };
  /** Tailwind utility groups for dark theme */
  dark: { bg: string; text: string; ring: string; dot: string };
}

export function classifyGlucose(
  value: number,
  range: TargetRange = DEFAULT_TARGET_RANGE
): GlucoseStatus {
  if (value < 54) return 'very-low';
  if (value < range.low) return 'low';
  if (value <= range.high) return 'in-range';
  if (value <= 250) return 'elevated';
  return 'high';
}

export function statusMeta(status: GlucoseStatus): StatusMeta {
  switch (status) {
    case 'very-low':
      return {
        status,
        label: 'Very Low',
        light: { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-300', dot: 'bg-rose-500' },
        dark: { bg: 'bg-rose-900/40', text: 'text-rose-300', ring: 'ring-rose-700', dot: 'bg-rose-400' },
      };
    case 'low':
      return {
        status,
        label: 'Low',
        light: { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-300', dot: 'bg-amber-500' },
        dark: { bg: 'bg-amber-900/40', text: 'text-amber-300', ring: 'ring-amber-700', dot: 'bg-amber-400' },
      };
    case 'in-range':
      return {
        status,
        label: 'In Range',
        light: { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-300', dot: 'bg-emerald-500' },
        dark: { bg: 'bg-emerald-900/40', text: 'text-emerald-300', ring: 'ring-emerald-700', dot: 'bg-emerald-400' },
      };
    case 'elevated':
      return {
        status,
        label: 'Elevated',
        light: { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-300', dot: 'bg-orange-500' },
        dark: { bg: 'bg-orange-900/40', text: 'text-orange-300', ring: 'ring-orange-700', dot: 'bg-orange-400' },
      };
    case 'high':
    default:
      return {
        status: 'high',
        label: 'High',
        light: { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-300', dot: 'bg-red-600' },
        dark: { bg: 'bg-red-900/40', text: 'text-red-300', ring: 'ring-red-700', dot: 'bg-red-400' },
      };
  }
}

export interface TimeInRange {
  veryLow: number;
  low: number;
  inRange: number;
  elevated: number;
  high: number;
  /** percentage of readings inside the target band (0-100) */
  inRangePct: number;
}

export function timeInRange(
  records: GlucoseRecord[],
  range: TargetRange = DEFAULT_TARGET_RANGE
): TimeInRange {
  const total = records.length || 1;
  const buckets = { veryLow: 0, low: 0, inRange: 0, elevated: 0, high: 0 };

  records.forEach((r) => {
    switch (classifyGlucose(r.glucose_level, range)) {
      case 'very-low': buckets.veryLow++; break;
      case 'low': buckets.low++; break;
      case 'in-range': buckets.inRange++; break;
      case 'elevated': buckets.elevated++; break;
      case 'high': buckets.high++; break;
    }
  });

  const pct = (n: number) => Math.round((n / total) * 1000) / 10;

  return {
    veryLow: pct(buckets.veryLow),
    low: pct(buckets.low),
    inRange: pct(buckets.inRange),
    elevated: pct(buckets.elevated),
    high: pct(buckets.high),
    inRangePct: records.length ? pct(buckets.inRange) : 0,
  };
}

export function meanGlucose(records: GlucoseRecord[]): number {
  if (records.length === 0) return 0;
  const sum = records.reduce((t, r) => t + r.glucose_level, 0);
  return Math.round((sum / records.length) * 10) / 10;
}

/** Standard deviation of glucose readings (mg/dL). */
export function standardDeviation(records: GlucoseRecord[]): number {
  if (records.length < 2) return 0;
  const mean = meanGlucose(records);
  const variance =
    records.reduce((t, r) => t + Math.pow(r.glucose_level - mean, 2), 0) /
    (records.length - 1);
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

/** Coefficient of variation (%). Glycemic stability target is < 36%. */
export function coefficientOfVariation(records: GlucoseRecord[]): number {
  const mean = meanGlucose(records);
  if (mean === 0) return 0;
  return Math.round((standardDeviation(records) / mean) * 1000) / 10;
}

/**
 * Estimated A1C (%) from mean glucose using the ADAG study regression:
 * A1C = (mean glucose + 46.7) / 28.7
 */
export function estimatedA1C(records: GlucoseRecord[]): number {
  const mean = meanGlucose(records);
  if (mean === 0) return 0;
  return Math.round(((mean + 46.7) / 28.7) * 10) / 10;
}

/**
 * Glucose Management Indicator (%) — Bergenstal et al. 2018:
 * GMI = 3.31 + (0.02392 x mean glucose mg/dL)
 */
export function glucoseManagementIndicator(records: GlucoseRecord[]): number {
  const mean = meanGlucose(records);
  if (mean === 0) return 0;
  return Math.round((3.31 + 0.02392 * mean) * 10) / 10;
}

/** Consecutive days (ending today) with at least one logged reading. */
export function loggingStreak(records: GlucoseRecord[]): number {
  if (records.length === 0) return 0;
  const days = new Set(records.map((r) => r.date));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to start from today or yesterday so a not-yet-logged
  // "today" does not immediately break an active streak.
  if (!days.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(toISODate(cursor))) return 0;
  }
  while (days.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export interface Insight {
  id: string;
  tone: 'positive' | 'caution' | 'info';
  title: string;
  detail: string;
}

/**
 * Generates neutral, informational insights from the dataset.
 * Purely descriptive — not medical guidance.
 */
export function generateInsights(
  records: GlucoseRecord[],
  range: TargetRange = DEFAULT_TARGET_RANGE
): Insight[] {
  const insights: Insight[] = [];
  if (records.length === 0) return insights;

  const tir = timeInRange(records, range);
  const mean = meanGlucose(records);
  const cv = coefficientOfVariation(records);
  const streak = loggingStreak(records);

  if (tir.inRangePct >= 70) {
    insights.push({
      id: 'tir-strong',
      tone: 'positive',
      title: `${tir.inRangePct}% time in range`,
      detail: `Most readings fall within your ${range.low}–${range.high} mg/dL target band.`,
    });
  } else if (records.length >= 3) {
    insights.push({
      id: 'tir-low',
      tone: 'caution',
      title: `${tir.inRangePct}% time in range`,
      detail: `A larger share of readings sits outside your ${range.low}–${range.high} mg/dL band.`,
    });
  }

  if (cv > 0) {
    insights.push({
      id: 'variability',
      tone: cv <= 36 ? 'positive' : 'caution',
      title: `${cv}% glucose variability`,
      detail:
        cv <= 36
          ? 'Variability is within the commonly cited stability target (< 36%).'
          : 'Variability is above the commonly cited stability target (< 36%).',
    });
  }

  if (tir.veryLow + tir.low > 0) {
    insights.push({
      id: 'lows',
      tone: 'caution',
      title: `${(tir.veryLow + tir.low).toFixed(1)}% of readings below target`,
      detail: 'Some readings fell under the lower target threshold.',
    });
  }

  if (streak >= 3) {
    insights.push({
      id: 'streak',
      tone: 'positive',
      title: `${streak}-day logging streak`,
      detail: 'Consistent logging produces far more reliable trend analytics.',
    });
  }

  insights.push({
    id: 'mean',
    tone: 'info',
    title: `Average ${mean} mg/dL`,
    detail: `Estimated A1C ≈ ${estimatedA1C(records)}% · GMI ≈ ${glucoseManagementIndicator(
      records
    )}% over ${records.length} reading${records.length === 1 ? '' : 's'}.`,
  });

  return insights;
}

/** Simple linear-regression trend over chronologically sorted records. */
export function trendDirection(
  records: GlucoseRecord[]
): 'rising' | 'falling' | 'steady' {
  if (records.length < 2) return 'steady';
  const sorted = [...records].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  const n = sorted.length;
  const xs = sorted.map((_, i) => i);
  const ys = sorted.map((r) => r.glucose_level);
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
  const sxx = xs.reduce((a, b) => a + b * b, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1);
  if (slope > 0.6) return 'rising';
  if (slope < -0.6) return 'falling';
  return 'steady';
}

export { differenceInCalendarDays };
