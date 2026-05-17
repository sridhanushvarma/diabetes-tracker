import { useState, useEffect } from 'react';
import { addGlucoseRecord, supabase } from '@/utils/supabase';
import { formatDate } from '@/utils/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { classifyGlucose, statusMeta } from '@/utils/glucoseAnalytics';

interface RecordFormProps {
  onSaved?: () => void;
}

export default function RecordForm({ onSaved }: RecordFormProps) {
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();
  const toast = useToast();
  const { targetRange } = usePreferences();
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

  const [date, setDate] = useState(formatDate(new Date()));
  const [timeOfDay, setTimeOfDay] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const numeric = parseFloat(glucoseLevel);
  const hasValue = glucoseLevel !== '' && !isNaN(numeric);
  const status = hasValue ? classifyGlucose(numeric, targetRange) : null;
  const meta = status ? statusMeta(status) : null;
  const palette = meta ? (isDark ? meta.dark : meta.light) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Not signed in', 'You must be logged in to add records.');
      return;
    }
    if (!hasValue || numeric <= 0 || numeric > 999) {
      setMessage({ text: 'Enter a glucose value between 1 and 999 mg/dL.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await addGlucoseRecord({
        user_id: user.id,
        date,
        time_of_day: timeOfDay,
        glucose_level: numeric,
        food_description: foodDescription,
      });

      if (result) {
        setMessage({ text: 'Record added successfully!', type: 'success' });
        toast.success('Reading saved', `${numeric} mg/dL · ${meta?.label}`);
        setGlucoseLevel('');
        setFoodDescription('');
        onSaved?.();
      } else {
        throw new Error('Failed to add record');
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'An error occurred while adding the record', type: 'error' });
      toast.error('Save failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div
          className={`p-4 rounded-lg border animate-scale-in ${
            message.type === 'error'
              ? isDark ? 'bg-red-900/30 text-red-300 border-red-800' : 'bg-red-50 text-red-700 border-red-100'
              : isDark ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-green-50 text-green-700 border-green-100'
          }`}
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'error' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              )}
            </svg>
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="date" className="form-label">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="timeOfDay" className="form-label">Time of Day</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <select
              id="timeOfDay"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as 'Breakfast' | 'Lunch' | 'Dinner')}
              className="input-field pl-10 appearance-none"
              required
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="glucoseLevel" className="form-label">Glucose Level (mg/dL)</label>
          {meta && palette && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold animate-pop-in ${palette.bg} ${palette.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${palette.dot}`} />
              {meta.label}
            </span>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <input
            id="glucoseLevel"
            type="number"
            value={glucoseLevel}
            onChange={(e) => setGlucoseLevel(e.target.value)}
            className="input-field pl-10"
            min="0"
            step="0.1"
            placeholder="Enter your glucose reading"
            required
          />
        </div>
        <div className="mt-2">
          <input
            type="range"
            min={40}
            max={400}
            step={1}
            value={hasValue ? Math.min(400, Math.max(40, numeric)) : 100}
            onChange={(e) => setGlucoseLevel(e.target.value)}
            className="w-full accent-primary-500 cursor-pointer"
            aria-label="Glucose level slider"
          />
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-neutral-400'}`}>
            Your target band is {targetRange.low}–{targetRange.high} mg/dL.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="foodDescription" className="form-label">Food Description</label>
        <div className="relative">
          <div className="absolute top-3 left-3 flex items-start pointer-events-none">
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <textarea
            id="foodDescription"
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            className="input-field pl-10 min-h-[100px]"
            placeholder="Describe what you ate..."
            required
          />
        </div>
      </div>

      <button type="submit" className="btn-glow w-full py-3 mt-2" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Record
          </span>
        )}
      </button>
    </form>
  );
}
