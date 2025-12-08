import ThemeLayout from '@/components/ThemeLayout';
import Auth from '@/components/Auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';

export default function AuthPage() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();

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
    // Only redirect if user is defined and not null
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <ThemeLayout title="Sign In">
      <div className="max-w-md mx-auto py-12">
        <Auth />
      </div>
    </ThemeLayout>
  );
}
