/**
 * This script fixes asset paths at runtime for GitHub Pages
 * It runs in the browser and corrects paths to JavaScript, CSS, and other assets
 */
(function() {
  // Only run in production on GitHub Pages
  if (window.location.hostname.indexOf('github.io') === -1) {
    return;
  }

  // Configuration
  var repoName = 'Diabetes-Checker';
  var baseUrl = 'https://sridhanush-varma.github.io/' + repoName;
  
  // Function to fix script src attributes
  function fixScriptSrcs() {
    document.querySelectorAll('script[src]').forEach(function(script) {
      var src = script.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
        // Remove leading slash if present
        if (src.startsWith('/')) {
          src = src.substring(1);
        }
        
        // Set the corrected src
        script.setAttribute('src', baseUrl + '/' + src);
      }
    });
  }
  
  // Function to fix link href attributes (CSS)
  function fixLinkHrefs() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('data:')) {
        // Remove leading slash if present
        if (href.startsWith('/')) {
          href = href.substring(1);
        }
        
        // Set the corrected href
        link.setAttribute('href', baseUrl + '/' + href);
      }
    });
  }
  
  // Function to fix image src attributes
  function fixImageSrcs() {
    document.querySelectorAll('img[src]').forEach(function(img) {
      var src = img.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
        // Remove leading slash if present
        if (src.startsWith('/')) {
          src = src.substring(1);
        }
        
        // Set the corrected src
        img.setAttribute('src', baseUrl + '/' + src);
      }
    });
  }
  
  // Function to add base tag
  function addBaseTag() {
    // Check if base tag already exists
    if (!document.querySelector('base')) {
      var baseTag = document.createElement('base');
      baseTag.href = baseUrl + '/';
      document.head.insertBefore(baseTag, document.head.firstChild);
    }
  }
  
  // Function to fix fetch requests
  function monkeyPatchFetch() {
    // Save the original fetch function
    var originalFetch = window.fetch;
    
    // Override fetch to fix URLs
    window.fetch = function(input, init) {
      if (typeof input === 'string' && !input.startsWith('http') && !input.startsWith('//')) {
        // Remove leading slash if present
        if (input.startsWith('/')) {
          input = input.substring(1);
        }
        
        // Prefix with base URL
        input = baseUrl + '/' + input;
      }
      
      // Call the original fetch with the fixed URL
      return originalFetch.call(this, input, init);
    };
  }
  
  // Run all fixes
  function runAllFixes() {
    addBaseTag();
    fixScriptSrcs();
    fixLinkHrefs();
    fixImageSrcs();
    monkeyPatchFetch();
    
    console.log('GitHub Pages asset path fixes applied');
  }
  
  // Run immediately
  runAllFixes();
  
  // Also run when DOM content is loaded (for dynamically added elements)
  document.addEventListener('DOMContentLoaded', runAllFixes);
})();
