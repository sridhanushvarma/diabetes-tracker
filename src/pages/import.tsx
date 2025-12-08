import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ThemeLayout from '@/components/ThemeLayout';
import ImportForm from '@/components/ImportForm';
import ImportResults from '@/components/ImportResults';
import { supabase } from '@/utils/supabase';
import { ImportResult } from '@/utils/importUtils';
import { useTheme } from '@/contexts/ThemeContext';

export default function Import() {
  const [user, setUser] = useState<any>(undefined);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
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
      return;
    }

    // If user is still undefined, we're still loading the auth state
    if (user === undefined) {
      return;
    }
  }, [user, router]);

  const handleImportComplete = (result: ImportResult) => {
    setImportResult(result);
  };

  const handleCloseResults = () => {
    setImportResult(null);
  };

  if (user === undefined || user === null) {
    return (
      <ThemeLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-accent-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-neutral-500 mt-4">Loading...</p>
          </div>
        </div>
      </ThemeLayout>
    );
  }

  return (
    <ThemeLayout title="Import Data">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Import Data</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-neutral-500'}`}>Import your glucose records from Excel or CSV files</p>
          <div className="flex space-x-2 mt-4">
            <div className="h-1 w-20 bg-primary-500 rounded-full"></div>
            <div className="h-1 w-10 bg-accent-500 rounded-full"></div>
            <div className="h-1 w-5 bg-tertiary-500 rounded-full"></div>
          </div>
        </div>

        {importResult ? (
          <ImportResults result={importResult} onClose={handleCloseResults} />
        ) : (
          <ImportForm userId={user.id} onImportComplete={handleImportComplete} />
        )}
      </div>
    </ThemeLayout>
  );
}
