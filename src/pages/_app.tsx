import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ScrollProgress from '@/components/ScrollProgress';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getBasePath } from '@/utils/path';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const basePath = getBasePath();

  // Handle GitHub Pages routing and base path issues
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Function to handle GitHub Pages routing
    const handleGitHubPagesRouting = () => {
      const { pathname, hash, search } = window.location;

      // Handle hash-based routing (e.g., /#/auth)
      if (hash && hash.startsWith('#/')) {
        const path = hash.substring(1); // Remove '#'
        const fullPath = `${basePath}${path}${search}`;

        // Only push if we're not already on this path
        if (router.asPath !== path) {
          router.push(path, fullPath, { shallow: true });
        }
        return;
      }

      // Handle direct access to pages without the base path
      // This is for when users access pages directly like /auth instead of /Diabetes-Checker/auth
      if (process.env.NODE_ENV === 'production' &&
          !pathname.startsWith(basePath) &&
          pathname !== '/' &&
          !pathname.includes('/_next/')) {

        // Redirect to the correct path with the base path
        const correctPath = `${basePath}${pathname}${search}${hash}`;
        window.location.href = correctPath;
      }
    };

    // Run on initial load
    handleGitHubPagesRouting();

    // Add event listeners for navigation
    window.addEventListener('hashchange', handleGitHubPagesRouting);
    router.events.on('routeChangeComplete', handleGitHubPagesRouting);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleGitHubPagesRouting);
      router.events.off('routeChangeComplete', handleGitHubPagesRouting);
    };
  }, [router, basePath]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="description" content="Track and manage your diabetes data with DiabetesTracker" />

        {/* Add base path for GitHub Pages */}
        {process.env.NODE_ENV === 'production' && (
          <base href={`${basePath}/`} />
        )}
      </Head>
      <ThemeProvider>
        <PreferencesProvider>
          <ToastProvider>
            <ScrollProgress />
            <div key={router.asPath} className="animate-page-enter">
              <Component {...pageProps} />
            </div>
          </ToastProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </>
  );
}
