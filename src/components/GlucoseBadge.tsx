import { useTheme } from '@/contexts/ThemeContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { classifyGlucose, statusMeta } from '@/utils/glucoseAnalytics';

interface GlucoseBadgeProps {
  value: number;
  /** Show the numeric value alongside the status label. */
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/** Clinically colour-coded glucose status pill with a pulsing status dot. */
export default function GlucoseBadge({
  value,
  showValue = true,
  size = 'md',
  className = '',
}: GlucoseBadgeProps) {
  const { theme } = useTheme();
  const { targetRange } = usePreferences();
  const isDark = theme === 'dark';

  const status = classifyGlucose(value, targetRange);
  const meta = statusMeta(status);
  const palette = isDark ? meta.dark : meta.light;
  const alarming = status === 'very-low' || status === 'high';

  const sizing =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ${palette.bg} ${palette.text} ${palette.ring} ${sizing} transition-all duration-300 ${className}`}
      title={`${value} mg/dL — ${meta.label} (target ${targetRange.low}–${targetRange.high})`}
    >
      <span className="relative flex h-2 w-2">
        {alarming && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${palette.dot}`}
            style={{ animation: 'pulseGlow 1.8s ease-in-out infinite' }}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${palette.dot}`} />
      </span>
      {showValue && <span>{value} mg/dL</span>}
      <span className={showValue ? 'opacity-80' : ''}>{meta.label}</span>
    </span>
  );
}
