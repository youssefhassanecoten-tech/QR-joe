@echo off
setlocal
cd /d "%~dp0"
title Publish QR-JOE release

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found.
  pause
  exit /b 1
)

if not exist "release\QR-JOE.apk" (
  echo Build the APK first with "Build Android APK.bat".
  pause
  exit /b 1
)

set /p GITHUB_TOKEN=Paste GitHub token ^(Contents: Read and write; it stays in memory only^): 
if not defined GITHUB_TOKEN (
  echo A token is required.
  pause
  exit /b 1
)

node scripts\publish-release.mjs %*
set "EXITCODE=%ERRORLEVEL%"
set "GITHUB_TOKEN="
echo.
pause
exit /b %EXITCODE%
