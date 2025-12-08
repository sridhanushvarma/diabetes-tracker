@echo off
echo ===================================
echo GitHub Pages Deployment Script
echo ===================================

echo Step 1: Cleaning previous build...
if exist "out" (
  echo Removing previous build...
  rmdir /s /q out
)

echo Step 2: Ensuring fix-asset-paths.js exists...
if not exist "public\fix-asset-paths.js" (
  echo Error: fix-asset-paths.js not found in public directory!
  exit /b 1
)

echo Step 3: Building for GitHub Pages...
set NODE_ENV=production
call npm run build

echo Step 4: Running post-build asset path fixes...
node scripts\fix-asset-paths.js

echo Step 5: Verifying output directory...
if not exist "out" (
  echo Error: Build failed! Output directory not found.
  exit /b 1
)

echo Step 6: Verifying critical files...
if not exist "out\.nojekyll" (
  echo Creating .nojekyll file...
  type nul > out\.nojekyll
)

if not exist "out\404.html" (
  echo Error: 404.html file not found!
  echo Copying 404.html to out directory...
  copy public\404.html out\404.html
)

if not exist "out\fix-asset-paths.js" (
  echo Error: fix-asset-paths.js not found!
  echo Copying fix-asset-paths.js to out directory...
  copy public\fix-asset-paths.js out\fix-asset-paths.js
)

echo Step 7: Creating route redirect files with absolute URLs...
echo Creating auth redirect...
if not exist "out\auth" mkdir out\auth
echo ^<!DOCTYPE html^>^<html^>^<head^>^<meta charset="utf-8"^>^<title^>Redirecting...^</title^>^<base href="https://sridhanush-varma.github.io/Diabetes-Checker/"^>^<meta http-equiv="refresh" content="0;url=https://sridhanush-varma.github.io/Diabetes-Checker/#/auth"^>^<script src="https://sridhanush-varma.github.io/Diabetes-Checker/fix-asset-paths.js"^>^</script^>^<script^>window.location.replace("https://sridhanush-varma.github.io/Diabetes-Checker/#/auth");^</script^>^</head^>^<body^>^<p^>Redirecting...^</p^>^</body^>^</html^> > out\auth\index.html

echo Creating dashboard redirect...
if not exist "out\dashboard" mkdir out\dashboard
echo ^<!DOCTYPE html^>^<html^>^<head^>^<meta charset="utf-8"^>^<title^>Redirecting...^</title^>^<base href="https://sridhanush-varma.github.io/Diabetes-Checker/"^>^<meta http-equiv="refresh" content="0;url=https://sridhanush-varma.github.io/Diabetes-Checker/#/dashboard"^>^<script src="https://sridhanush-varma.github.io/Diabetes-Checker/fix-asset-paths.js"^>^</script^>^<script^>window.location.replace("https://sridhanush-varma.github.io/Diabetes-Checker/#/dashboard");^</script^>^</head^>^<body^>^<p^>Redirecting...^</p^>^</body^>^</html^> > out\dashboard\index.html

echo Creating import redirect...
if not exist "out\import" mkdir out\import
echo ^<!DOCTYPE html^>^<html^>^<head^>^<meta charset="utf-8"^>^<title^>Redirecting...^</title^>^<base href="https://sridhanush-varma.github.io/Diabetes-Checker/"^>^<meta http-equiv="refresh" content="0;url=https://sridhanush-varma.github.io/Diabetes-Checker/#/import"^>^<script src="https://sridhanush-varma.github.io/Diabetes-Checker/fix-asset-paths.js"^>^</script^>^<script^>window.location.replace("https://sridhanush-varma.github.io/Diabetes-Checker/#/import");^</script^>^</head^>^<body^>^<p^>Redirecting...^</p^>^</body^>^</html^> > out\import\index.html

echo Creating records redirect...
if not exist "out\records" mkdir out\records
echo ^<!DOCTYPE html^>^<html^>^<head^>^<meta charset="utf-8"^>^<title^>Redirecting...^</title^>^<base href="https://sridhanush-varma.github.io/Diabetes-Checker/"^>^<meta http-equiv="refresh" content="0;url=https://sridhanush-varma.github.io/Diabetes-Checker/#/records"^>^<script src="https://sridhanush-varma.github.io/Diabetes-Checker/fix-asset-paths.js"^>^</script^>^<script^>window.location.replace("https://sridhanush-varma.github.io/Diabetes-Checker/#/records");^</script^>^</head^>^<body^>^<p^>Redirecting...^</p^>^</body^>^</html^> > out\records\index.html

echo Step 8: Deploying to GitHub Pages...
call npm run deploy

echo ===================================
echo Deployment complete!
echo Your site should be available at:
echo https://sridhanush-varma.github.io/Diabetes-Checker/
echo ===================================

echo ===================================
echo IMPORTANT: After Deployment
echo ===================================
echo 1. Clear your browser cache completely (Ctrl+Shift+Delete)
echo 2. Try accessing the site with hash routes first:
echo    https://sridhanush-varma.github.io/Diabetes-Checker/#/auth
echo 3. If you still see 404 errors, check the browser console (F12)
echo    and look for specific resource loading errors
echo ===================================

pause
