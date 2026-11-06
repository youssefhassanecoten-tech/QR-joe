@echo off
setlocal
cd /d "%~dp0"
title QR-JOE Studio

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is required but was not found.
  echo Install it from https://nodejs.org and run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing QR-JOE dependencies. This only happens once...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo QR-JOE is already running. Opening it in your browser...
  start "" "http://localhost:5173/"
  exit /b 0
)

echo Starting QR-JOE Studio...
if /I not "%~1"=="--no-browser" (
  start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:5173/'"
)
call npm.cmd run dev -- --port 5173 --strictPort
echo.
echo QR-JOE has stopped.
pause
