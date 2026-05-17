import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import ThemeToggle from './ThemeToggle';
import MobileNav from './MobileNav';

type LayoutProps = {
  children: ReactNode;
  title?: string;
  theme?: 'light' | 'dark';
};

export default function Layout({ children, title = 'Diabetes Tracker', theme = 'light' }: LayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Get current user
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (path: string) => {
    return router.pathname === path
      ? 'bg-white/20 text-white font-semibold shadow-inner ring-1 ring-white/20 scale-[1.03]'
      : 'text-primary-100 hover:bg-white/10 hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-200';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title + " | Diabetes Tracker"}</title>
        <meta name="description" content="Track your diabetes metrics over time" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        user={user}
        handleSignOut={handleSignOut}
        theme={theme}
      />

      <header
        className={`sticky top-0 z-40 text-white transition-all duration-500 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 dark:from-primary-900 dark:via-accent-900 dark:to-primary-800 bg-[length:200%_auto] animate-gradient ${
          scrolled ? 'shadow-2xl backdrop-blur-md py-0' : 'shadow-md'
        }`}
      >
        <div className={`container mx-auto px-4 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-all duration-300 group-hover:rotate-[10deg] group-hover:scale-105">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.25 11.5L4.75 14L12 18.25L19.25 14L14.75 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-display font-semibold tracking-tight">DiabetesTracker</span>
                <div className={`text-xs text-primary-100 dark:text-primary-300 font-light overflow-hidden transition-all duration-500 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-5 opacity-100'}`}>Monitor your health</div>
              </div>
            </Link>

            {/* Mobile menu button and theme toggle */}
            <div className="flex items-center space-x-2">
              <ThemeToggle theme={theme} />

              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
                  aria-label="Open menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center">
              {user ? (
                <nav className="flex items-center space-x-1 mr-2">
                  <Link href="/dashboard" className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive('/dashboard')}`}>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  <Link href="/records/add" className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive('/records/add')}`}>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Record</span>
                    </div>
                  </Link>
                  <Link href="/records/history" className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive('/records/history')}`}>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>History</span>
                    </div>
                  </Link>
                  <Link href="/reports" className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive('/reports')}`}>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Reports</span>
                    </div>
                  </Link>
                  <Link href="/import" className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive('/import')}`}>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Import Data</span>
                    </div>
                  </Link>
                  <Link href="/settings" className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive('/settings')}`}>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="ml-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
                  >
                    <span>Sign Out</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </nav>
              ) : (
                <nav className="flex items-center space-x-4 mr-2">
                  <Link
                    href="/auth"
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1"
                  >
                    <span>Sign In</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                </nav>
              )}

              {/* Desktop theme toggle */}
              <div className="hidden md:block">
                <ThemeToggle theme={theme} />
              </div>
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-gradient bg-[length:200%_auto]" />
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8 md:py-12 lg:py-16">
        {children}
      </main>

      <footer className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 border-t border-neutral-100 dark:border-neutral-800 py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-lg shadow-sm animate-float">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.25 11.5L4.75 14L12 18.25L19.25 14L14.75 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-lg font-display font-semibold gradient-text">DiabetesTracker</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xs text-center md:text-left">
                Your personal diabetes management companion. Track, analyze, and improve your health journey.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-200 hover:scale-125 hover:-translate-y-1 focus-visible" aria-label="Privacy Policy">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="sr-only">Privacy Policy</span>
                </a>
                <a href="#" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-200 hover:scale-125 hover:-translate-y-1 focus-visible" aria-label="Help">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="sr-only">Help</span>
                </a>
                <a href="#" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-200 hover:scale-125 hover:-translate-y-1 focus-visible" aria-label="Contact">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="sr-only">Contact</span>
                </a>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">&copy; {new Date().getFullYear()} Diabetes Tracker. All rights reserved.</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Your health data, simplified.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
