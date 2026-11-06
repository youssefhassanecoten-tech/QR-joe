@echo off
setlocal
cd /d "%~dp0"
title Build QR-JOE Android APK

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
  echo Installing dependencies. This only happens once...
  call npm.cmd install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

if not exist ".tooling\jdk\bin\java.exe" (
  echo.
  echo The local Android build toolchain is missing.
  echo Expected: .tooling\jdk and .tooling\android-sdk
  echo.
  pause
  exit /b 1
)

set "JAVA_HOME=%CD%\.tooling\jdk"
set "ANDROID_HOME=%CD%\.tooling\android-sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Building the web app and syncing Capacitor...
call npm.cmd run cap:sync
if errorlevel 1 goto fail

echo.
echo Building the debug APK...
pushd android
call gradlew.bat assembleDebug
if errorlevel 1 (
  popd
  goto fail
)
popd

if not exist "release" mkdir "release"
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "release\QR-JOE.apk" >nul
if errorlevel 1 goto fail

echo.
echo Build complete.
echo APK: %CD%\release\QR-JOE.apk
echo.
pause
exit /b 0

:fail
echo.
echo Build failed. Review the messages above.
pause
exit /b 1
