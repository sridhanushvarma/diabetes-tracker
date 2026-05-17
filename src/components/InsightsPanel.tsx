import { GlucoseRecord } from '@/utils/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import {
  timeInRange,
  estimatedA1C,
  glucoseManagementIndicator,
  coefficientOfVariation,
  loggingStreak,
  generateInsights,
} from '@/utils/glucoseAnalytics';
import AnimatedCounter from './AnimatedCounter';

interface InsightsPanelProps {
  records: GlucoseRecord[];
}

/** Animated time-in-range ring + clinical metric tiles + generated insights. */
export default function InsightsPanel({ records }: InsightsPanelProps) {
  const { theme } = useTheme();
  const { targetRange } = usePreferences();
  const isDark = theme === 'dark';

  const tir = timeInRange(records, targetRange);
  const a1c = estimatedA1C(records);
  const gmi = glucoseManagementIndicator(records);
  const cv = coefficientOfVariation(records);
  const streak = loggingStreak(records);
  const insights = generateInsights(records, targetRange);

  const R = 52;
  const C = 2 * Math.PI * R;

  // Build the concentric arc segments for the ring (very-low → high).
  const segments = [
    { pct: tir.veryLow, color: isDark ? '#fb7185' : '#e11d48' },
    { pct: tir.low, color: isDark ? '#fbbf24' : '#d97706' },
    { pct: tir.inRange, color: isDark ? '#34d399' : '#059669' },
    { pct: tir.elevated, color: isDark ? '#fb923c' : '#ea580c' },
    { pct: tir.high, color: isDark ? '#f87171' : '#dc2626' },
  ];

  let offsetAcc = 0;

  const metrics = [
    { label: 'Est. A1C', value: a1c, suffix: '%', decimals: 1, accent: 'text-primary-500' },
    { label: 'GMI', value: gmi, suffix: '%', decimals: 1, accent: 'text-accent-500' },
    { label: 'Variability', value: cv, suffix: '%', decimals: 1, accent: 'text-tertiary-500' },
    { label: 'Day Streak', value: streak, suffix: '', decimals: 0, accent: 'text-amber-500' },
  ];

  return (
    <div
      className={`card-aurora hover-lift overflow-hidden ${
        isDark ? '' : ''
      }`}
    >
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg mr-3 shadow-sm animate-pulse-glow">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold gradient-text-animated">Health Intelligence</h2>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>
            Target band {targetRange.low}–{targetRange.high} mg/dL · informational only
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <p className={`text-sm py-8 text-center ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>
          Log readings to unlock time-in-range, estimated A1C and trend insights.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Time-in-range ring */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke={isDark ? '#374151' : '#f1f5f9'}
                  strokeWidth="12"
                />
                {segments.map((seg, i) => {
                  const len = (seg.pct / 100) * C;
                  const dasharray = `${len} ${C - len}`;
                  const dashoffset = -offsetAcc;
                  offsetAcc += len;
                  if (seg.pct <= 0) return null;
                  return (
                    <circle
                      key={i}
                      cx="60"
                      cy="60"
                      r={R}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={dasharray}
                      strokeDashoffset={dashoffset}
                      strokeLinecap="butt"
                      style={{
                        transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)',
                      }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  <AnimatedCounter value={tir.inRangePct} decimals={1} suffix="%" />
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>
                  Time in Range
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px]">
              {[
                { l: 'In range', v: tir.inRangePct, c: isDark ? 'bg-emerald-400' : 'bg-emerald-600' },
                { l: 'Below', v: Math.round((tir.veryLow + tir.low) * 10) / 10, c: isDark ? 'bg-amber-400' : 'bg-amber-600' },
                { l: 'Above', v: Math.round((tir.elevated + tir.high) * 10) / 10, c: isDark ? 'bg-red-400' : 'bg-red-600' },
              ].map((x) => (
                <span
                  key={x.l}
                  className={`inline-flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-neutral-600'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${x.c}`} />
                  {x.l} {x.v}%
                </span>
              ))}
            </div>
          </div>

          {/* Metric tiles */}
          <div className="grid grid-cols-2 gap-3 stagger">
            {metrics.map((m) => (
              <div
                key={m.label}
                className={`rounded-xl p-4 border text-center sheen transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? 'bg-gray-800/60 border-gray-700'
                    : 'bg-white border-neutral-100'
                }`}
              >
                <p className={`text-2xl font-bold ${m.accent}`}>
                  <AnimatedCounter value={m.value} decimals={m.decimals} suffix={m.suffix} />
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <div className="mt-6 space-y-2 stagger">
          {insights.map((ins) => {
            const tone =
              ins.tone === 'positive'
                ? isDark
                  ? 'border-emerald-800 bg-emerald-900/20 text-emerald-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : ins.tone === 'caution'
                ? isDark
                  ? 'border-amber-800 bg-amber-900/20 text-amber-300'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
                : isDark
                ? 'border-gray-700 bg-gray-800/40 text-gray-300'
                : 'border-neutral-200 bg-neutral-50 text-neutral-700';
            return (
              <div
                key={ins.id}
                className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${tone}`}
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {ins.tone === 'positive' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : ins.tone === 'caution' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <div>
                  <p className="font-semibold leading-tight">{ins.title}</p>
                  <p className="opacity-80 text-xs mt-0.5">{ins.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
