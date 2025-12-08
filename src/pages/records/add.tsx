import { useEffect, useState } from 'react';
import ThemeLayout from '@/components/ThemeLayout';
import RecordForm from '@/components/RecordForm';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import { useTheme } from '@/contexts/ThemeContext';

function AddRecordContent() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();
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
    }
  }, [user, router]);

  if (user === undefined || user === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Add New Glucose Reading</h1>
      <div className={`rounded-xl shadow-sm p-6 border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <RecordForm />
      </div>
    </div>
  );
}

export default function AddRecord() {
  return (
    <ThemeLayout title="Add Record">
      <AddRecordContent />
    </ThemeLayout>
  );
}
