import { Html, Head, Main, NextScript } from 'next/document';
import { getBasePath, getAssetPrefix } from '@/utils/path';

export default function Document() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';

  return (
    <Html lang="en">
      <Head>
        {/* Critical: Add fix-asset-paths.js script before any other scripts */}
        {process.env.NODE_ENV === 'production' && (
          <script
            src={`https://sridhanush-varma.github.io/Diabetes-Checker/fix-asset-paths.js`}
            strategy="beforeInteractive"
          />
        )}

        {/* Add base tag for GitHub Pages */}
        {process.env.NODE_ENV === 'production' && (
          <base href="https://sridhanush-varma.github.io/Diabetes-Checker/" />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Add GitHub Pages router script */}
        {process.env.NODE_ENV === 'production' && (
          <script
            src="https://sridhanush-varma.github.io/Diabetes-Checker/github-pages-router.js"
            defer
          />
        )}

        {/* Add inline script to fix any remaining issues */}
        {process.env.NODE_ENV === 'production' && (
          <script dangerouslySetInnerHTML={{
            __html: `
              // Additional fixes for GitHub Pages
              (function() {
                // Only run on GitHub Pages
                if (window.location.hostname.indexOf('github.io') === -1) return;

                // Fix for direct navigation to routes
                var routes = ['/auth', '/dashboard', '/import', '/records'];
                var path = window.location.pathname;
                var repoPath = '/Diabetes-Checker';

                // Check if we're accessing a route directly
                for (var i = 0; i < routes.length; i++) {
                  if (path === repoPath + routes[i] || path === routes[i]) {
                    // Redirect to the hash-based route
                    window.location.replace('https://sridhanush-varma.github.io/Diabetes-Checker/#' + routes[i]);
                    return;
                  }
                }

                // Fix for hash-based routing
                if (window.location.hash && window.location.hash.startsWith('#/')) {
                  var hashPath = window.location.hash.substring(1);
                  // Use history API to update the URL without a page reload
                  try {
                    window.history.replaceState(null, null, repoPath + hashPath);
                  } catch (e) {
                    console.error('Failed to update URL:', e);
                  }
                }

                // Fix for script loading errors
                window.addEventListener('error', function(e) {
                  var src = e.target && e.target.src;
                  if (src && (src.includes('_next/') || src.endsWith('.js'))) {
                    console.warn('Script loading error:', src);

                    // Try to reload with the correct path
                    var newSrc = 'https://sridhanush-varma.github.io/Diabetes-Checker/' +
                                src.split('/').pop();

                    // Create and append a new script element
                    var script = document.createElement('script');
                    script.src = newSrc;
                    document.body.appendChild(script);
                  }
                }, true);
              })();
            `
          }} />
        )}
      </body>
    </Html>
  );
}
