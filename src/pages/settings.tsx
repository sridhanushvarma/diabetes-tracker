import { useEffect, useState } from 'react';
import ThemeLayout from '@/components/ThemeLayout';
import Reveal from '@/components/Reveal';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { DEFAULT_TARGET_RANGE } from '@/utils/glucoseAnalytics';

function SettingsContent() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { theme } = useTheme();
  const toast = useToast();
  const { targetRange, setTargetRange, resetTargetRange } = usePreferences();
  const [low, setLow] = useState(targetRange.low);
  const [high, setHigh] = useState(targetRange.high);
  const isDark = theme === 'dark';

  useEffect(() => { setLow(targetRange.low); setHigh(targetRange.high); }, [targetRange]);

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
      (_event, session) => setUser(session?.user || null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user === null) { router.push('/auth'); return; }
    if (user === undefined) return;

    async function fetchUserProfile() {
      try {
        const { data, error } = await supabase.from('profiles').select('name').eq('id', user.id).single();
        if (error && error.code !== 'PGRST116') { console.error(error); return; }
        if (data) setName(data.name || '');
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
    fetchUserProfile();
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, name, updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error('Update failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRange = () => {
    setTargetRange({ low, high });
    toast.success('Target range saved', `${low}–${high} mg/dL applied across the app.`);
  };

  const handleExportAllData = async (format: 'csv' | 'json') => {
    if (!user) return;
    setExportLoading(true);
    try {
      const { data, error } = await supabase
        .from('glucose_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) { toast.error('No data to export'); return; }

      let content: string;
      let mime: string;
      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mime = 'application/json';
      } else {
        const headers = ['Date', 'Time of Day', 'Glucose Level (mg/dL)', 'Food Description', 'Created At'];
        const rows = [headers.join(',')];
        data.forEach((r) =>
          rows.push([r.date, r.time_of_day, r.glucose_level, `"${r.food_description.replace(/"/g, '""')}"`, r.created_at].join(','))
        );
        content = rows.join('\n');
        mime = 'text/csv;charset=utf-8;';
      }

      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diabetes-data-full-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} exported`, `${data.length} records downloaded.`);
    } catch (error: any) {
      toast.error('Export failed', error.message);
    } finally {
      setExportLoading(false);
    }
  };

  if (user === undefined || user === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  const card = `card-aurora hover-lift`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 gradient-text-animated animate-fade-in-down">Account Settings</h1>

      <div className="space-y-6">
        <Reveal>
          <div className={card}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Profile Information</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">Email</label>
                <input id="email" type="email" value={user.email} disabled className={`input-field ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`} />
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your email cannot be changed</p>
              </div>
              <div className="mb-6">
                <label htmlFor="name" className="form-label">Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your name" />
              </div>
              <button type="submit" className="btn-glow" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className={card}>
            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Target Glucose Range</h2>
            <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Used for status colour-coding, the chart band, time-in-range and insights across the app.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="low" className="form-label">Lower bound (mg/dL)</label>
                <input id="low" type="number" min={40} max={high - 1} value={low}
                  onChange={(e) => setLow(parseInt(e.target.value || '0', 10))} className="input-field" />
              </div>
              <div>
                <label htmlFor="high" className="form-label">Upper bound (mg/dL)</label>
                <input id="high" type="number" min={low + 1} max={400} value={high}
                  onChange={(e) => setHigh(parseInt(e.target.value || '0', 10))} className="input-field" />
              </div>
            </div>
            <div className="mt-4 h-3 rounded-full overflow-hidden flex bg-gradient-to-r from-amber-400 via-emerald-400 to-red-400 opacity-80" />
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-neutral-500'}`}>
              Below {low} = low · {low}–{high} = in range · above {high} = high
            </p>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSaveRange} className="btn-glow">Save Range</button>
              <button
                onClick={() => { resetTargetRange(); toast.info('Reset to default', `${DEFAULT_TARGET_RANGE.low}–${DEFAULT_TARGET_RANGE.high} mg/dL`); }}
                className="btn-secondary"
              >
                Reset to default
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className={card}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Data Management</h2>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Export Your Data</h3>
            <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Download all your glucose records for backup or to share with your healthcare provider.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => handleExportAllData('csv')} className="btn-glow" disabled={exportLoading}>
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>
              <button onClick={() => handleExportAllData('json')} className="btn-secondary" disabled={exportLoading}>
                Export JSON
              </button>
            </div>

            <div className={`pt-5 mt-5 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Danger Zone</h3>
              <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Permanently delete your account and all associated data. Type <span className="font-mono font-semibold">DELETE</span> to enable.
              </p>
              <input
                type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="input-field mb-3 max-w-xs"
              />
              <div>
                <button
                  disabled={confirmText !== 'DELETE'}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200"
                  onClick={() => toast.error('Account deletion', 'This action would be processed by the backend.')}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <ThemeLayout title="Settings">
      <SettingsContent />
    </ThemeLayout>
  );
}
