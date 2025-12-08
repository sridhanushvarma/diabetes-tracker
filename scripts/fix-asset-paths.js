const fs = require('fs');
const path = require('path');

// Configuration
const outDir = path.join(__dirname, '..', 'out');
const repoName = 'Diabetes-Checker';
const baseUrl = `https://sridhanush-varma.github.io/${repoName}`;

// Function to recursively process HTML files
function processHtmlFiles(directory) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      // Process HTML files
      let content = fs.readFileSync(filePath, 'utf8');

      // Add base tag for absolute URLs
      if (!content.includes('<base href=')) {
        content = content.replace('<head>', `<head>\n  <base href="${baseUrl}/">`);
      }

      // Add fix-asset-paths.js script
      const fixAssetPathsScript = `<script src="${baseUrl}/fix-asset-paths.js"></script>`;
      if (!content.includes(fixAssetPathsScript)) {
        content = content.replace('</head>', `  ${fixAssetPathsScript}\n</head>`);
      }

      // Replace relative paths with absolute URLs
      content = content.replace(/src="\/_next\//g, `src="${baseUrl}/_next/`);
      content = content.replace(/href="\/_next\//g, `href="${baseUrl}/_next/`);
      content = content.replace(/src="\/images\//g, `src="${baseUrl}/images/`);
      content = content.replace(/href="\/images\//g, `href="${baseUrl}/images/`);

      // Fix internal links (but not external links or anchors)
      content = content.replace(/href="\//g, `href="${baseUrl}/`);

      // Fix JSON script tags
      content = content.replace(/"\/(_next\/data\/[^"]+)"/g, `"${baseUrl}/$1"`);

      // Add special handling for index.html
      if (file === 'index.html') {
        // Replace with our custom index-gh-pages.html if it exists
        const customIndexPath = path.join(__dirname, '..', 'public', 'index-gh-pages.html');
        if (fs.existsSync(customIndexPath)) {
          content = fs.readFileSync(customIndexPath, 'utf8');
          console.log('Using custom index-gh-pages.html');
        } else {
          // Add hash routing support
          const hashRoutingScript = `
<script>
  // Handle hash-based routing for GitHub Pages
  (function() {
    // Check if we're on GitHub Pages
    if (window.location.hostname.indexOf('github.io') !== -1) {
      // Function to handle hash routes
      function handleHashRouting() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#/')) {
          // Get the path without the hash
          const path = hash.substring(1);

          // Update the URL to include the base path
          const newUrl = '${baseUrl}' + path;

          // Use history API to update the URL without a page reload
          try {
            window.history.replaceState(null, null, newUrl);
          } catch (e) {
            console.error('Failed to update URL:', e);
          }
        }
      }

      // Run on page load and hash change
      window.addEventListener('DOMContentLoaded', handleHashRouting);
      window.addEventListener('hashchange', handleHashRouting);
    }
  })();
</script>`;

          // Add the script before the closing body tag
          content = content.replace('</body>', `${hashRoutingScript}\n</body>`);
        }
      }

      // Write the modified content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Processed: ${filePath}`);
    }
  });
}

// Function to copy the GitHub Pages router script
function copyGitHubPagesRouterScript() {
  const sourcePath = path.join(__dirname, '..', 'public', 'github-pages-router.js');
  const destPath = path.join(outDir, 'github-pages-router.js');

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log('Copied GitHub Pages router script');
  } else {
    console.error('GitHub Pages router script not found!');
  }
}

// Function to copy the fix-asset-paths.js script
function copyFixAssetPathsScript() {
  const sourcePath = path.join(__dirname, '..', 'public', 'fix-asset-paths.js');
  const destPath = path.join(outDir, 'fix-asset-paths.js');

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log('Copied fix-asset-paths.js script');
  } else {
    console.error('fix-asset-paths.js script not found!');
  }
}

// Function to create the .nojekyll file
function createNojekyllFile() {
  const destPath = path.join(outDir, '.nojekyll');

  // Create an empty .nojekyll file
  fs.writeFileSync(destPath, '');
  console.log('Created .nojekyll file');
}

// Function to copy the 404.html file
function copy404File() {
  const sourcePath = path.join(__dirname, '..', 'public', '404.html');
  const destPath = path.join(outDir, '404.html');

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log('Copied 404.html file');
  } else {
    console.error('404.html file not found!');
  }
}

// Function to create redirect files for all routes
function createRedirectFiles() {
  const routes = ['auth', 'dashboard', 'import', 'records'];

  routes.forEach(route => {
    const routeDir = path.join(outDir, route);

    // Create directory if it doesn't exist
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    // Create index.html in the route directory with absolute URLs
    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to ${route}</title>
  <base href="${baseUrl}/">
  <meta http-equiv="refresh" content="0;url=${baseUrl}/#/${route}">
  <script src="${baseUrl}/fix-asset-paths.js"></script>
  <script>
    window.location.replace("${baseUrl}/#/${route}" + window.location.search);
  </script>
</head>
<body>
  <p>Redirecting to ${route} page...</p>
  <p>If you are not redirected, <a href="${baseUrl}/#/${route}">click here</a>.</p>
</body>
</html>`;

    fs.writeFileSync(path.join(routeDir, 'index.html'), content);
    console.log(`Created ${route} redirect file`);
  });
}

// Function to fix JavaScript files
function fixJavaScriptFiles() {
  const jsDir = path.join(outDir, '_next');

  if (!fs.existsSync(jsDir)) {
    console.error('_next directory not found!');
    return;
  }

  // Walk through the _next directory
  function processJsFiles(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        processJsFiles(filePath);
      } else if (file.endsWith('.js')) {
        // Process JavaScript files
        let content = fs.readFileSync(filePath, 'utf8');

        // Fix asset paths in JavaScript files
        content = content.replace(/"\/_next\//g, `"${baseUrl}/_next/`);
        content = content.replace(/"\/images\//g, `"${baseUrl}/images/`);

        // Write the modified content back to the file
        fs.writeFileSync(filePath, content);
        console.log(`Processed JS file: ${filePath}`);
      }
    });
  }

  processJsFiles(jsDir);
}

// Main function
function main() {
  console.log('Starting GitHub Pages asset path fix process...');

  // Create necessary files
  createNojekyllFile();
  copy404File();
  copyGitHubPagesRouterScript();
  copyFixAssetPathsScript();
  createRedirectFiles();

  // Process HTML files
  processHtmlFiles(outDir);

  // Fix JavaScript files
  fixJavaScriptFiles();

  console.log('GitHub Pages asset path fix process completed!');
}

// Run the main function
main();
