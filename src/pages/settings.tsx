import { useEffect, useState } from 'react';
import ThemeLayout from '@/components/ThemeLayout';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { useTheme } from '@/contexts/ThemeContext';

function SettingsContent() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
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

    async function fetchUserProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error);
          return;
        }

        if (data) {
          setName(data.name || '');
        }
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
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({
        text: error.message || 'An error occurred while updating your profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllData = async () => {
    if (!user) return;

    setExportLoading(true);

    try {
      const { data, error } = await supabase
        .from('glucose_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data.length === 0) {
        setMessage({ text: 'No data to export', type: 'error' });
        return;
      }

      // Create CSV content
      const headers = ['Date', 'Time of Day', 'Glucose Level (mg/dL)', 'Food Description', 'Created At'];
      const csvRows = [headers.join(',')];

      data.forEach(record => {
        const row = [
          record.date,
          record.time_of_day,
          record.glucose_level,
          `"${record.food_description.replace(/"/g, '""')}"`,
          record.created_at
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `diabetes-data-full-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ text: 'Data exported successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({
        text: error.message || 'An error occurred while exporting your data',
        type: 'error'
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (user === undefined || user === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Account Settings</h1>

      {message && (
        <div className={`p-3 rounded mb-6 ${
          message.type === 'error'
            ? isDark ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-100 text-red-700'
            : isDark ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div className={`rounded-xl shadow-sm p-6 border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Profile Information</h2>

          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className={`input-field ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              />
              <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your email cannot be changed</p>
            </div>

            <div className="mb-6">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your name"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className={`rounded-xl shadow-sm p-6 border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Data Management</h2>

          <div className="space-y-4">
            <div>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Export Your Data</h3>
              <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Download all your glucose records as a CSV file for backup or to share with your healthcare provider.
              </p>
              <button
                onClick={handleExportAllData}
                className="btn-primary"
                disabled={exportLoading}
              >
                {exportLoading ? 'Exporting...' : 'Export All Data (CSV)'}
              </button>
            </div>

            <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Danger Zone</h3>
              <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Implement account deletion logic
                    alert('Account deletion would be implemented here');
                  }
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to provide theme context
export default function Settings() {
  return (
    <ThemeLayout title="Settings">
      <SettingsContent />
    </ThemeLayout>
  );
}
