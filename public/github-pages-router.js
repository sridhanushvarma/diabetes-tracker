/**
 * GitHub Pages Router Script
 * This script handles client-side routing for GitHub Pages
 * It ensures that all routes work correctly with the repository name prefix
 */
(function() {
  // Configuration
  var repoName = 'Diabetes-Checker';
  var basePath = '/' + repoName;
  
  // Only run in production and on GitHub Pages
  if (window.location.hostname.indexOf('github.io') === -1) {
    return;
  }
  
  // Function to handle hash-based routing
  function handleHashRouting() {
    var hash = window.location.hash;
    
    // If we have a hash route (e.g., /#/auth)
    if (hash && hash.startsWith('#/')) {
      // Get the path without the hash
      var path = hash.substring(1);
      
      // Update the URL to include the base path
      var newUrl = basePath + path;
      
      // Use history API to update the URL without a page reload
      try {
        window.history.replaceState(null, null, newUrl);
      } catch (e) {
        console.error('Failed to update URL:', e);
      }
    }
  }
  
  // Function to handle direct access to routes
  function handleDirectAccess() {
    var pathname = window.location.pathname;
    
    // If we're accessing a route directly without the base path
    if (!pathname.startsWith(basePath) && pathname !== '/' && !pathname.includes('/_next/')) {
      // Redirect to the correct URL with the base path
      window.location.href = basePath + pathname + window.location.search + window.location.hash;
    }
  }
  
  // Function to fix asset paths
  function fixAssetPaths() {
    // Fix script src attributes
    document.querySelectorAll('script[src]').forEach(function(script) {
      var src = script.getAttribute('src');
      if (src && src.startsWith('/') && !src.startsWith(basePath) && !src.startsWith('//')) {
        script.setAttribute('src', basePath + src);
      }
    });
    
    // Fix link href attributes
    document.querySelectorAll('link[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith(basePath) && !href.startsWith('//')) {
        link.setAttribute('href', basePath + href);
      }
    });
    
    // Fix image src attributes
    document.querySelectorAll('img[src]').forEach(function(img) {
      var src = img.getAttribute('src');
      if (src && src.startsWith('/') && !src.startsWith(basePath) && !src.startsWith('//')) {
        img.setAttribute('src', basePath + src);
      }
    });
  }
  
  // Run on page load
  document.addEventListener('DOMContentLoaded', function() {
    handleHashRouting();
    handleDirectAccess();
    fixAssetPaths();
  });
  
  // Run on hash change
  window.addEventListener('hashchange', handleHashRouting);
})();
