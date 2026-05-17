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
      <div className="mb-6 animate-fade-in-down">
        <h1 className="text-3xl font-bold gradient-text-animated">Add New Glucose Reading</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>
          Each reading is instantly classified against your target band
        </p>
        <div className="flex space-x-2 mt-4">
          <div className="h-1 w-20 bg-primary-500 rounded-full animate-pulse-glow" />
          <div className="h-1 w-10 bg-accent-500 rounded-full" />
          <div className="h-1 w-5 bg-tertiary-500 rounded-full" />
        </div>
      </div>
      <div className="card-aurora hover-lift animate-scale-in">
        <RecordForm onSaved={() => router.push('/dashboard')} />
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
