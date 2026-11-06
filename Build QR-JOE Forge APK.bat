@echo off
setlocal
cd /d "%~dp0"
title Build QR-JOE Forge APK

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found.
  pause
  exit /b 1
)
if not exist "node_modules" (
  call npm.cmd install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
if not exist ".tooling\jdk\bin\java.exe" (
  echo The local Android toolchain is missing.
  pause
  exit /b 1
)
if not exist "android-forge\app\build.gradle" (
  echo The android-forge project is missing.
  pause
  exit /b 1
)

set "JAVA_HOME=%CD%\.tooling\jdk"
set "ANDROID_HOME=%CD%\.tooling\android-sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo Building QR-JOE Forge web bundle...
call npm.cmd run build:forge
if errorlevel 1 goto fail

if exist "android-forge\app\src\main\assets\public" rmdir /s /q "android-forge\app\src\main\assets\public"
robocopy "dist" "android-forge\app\src\main\assets\public" /E /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto fail

pushd android-forge
call gradlew.bat assembleDebug
if errorlevel 1 (
  popd
  goto fail
)
popd

if not exist "release" mkdir "release"
copy /y "android-forge\app\build\outputs\apk\debug\app-debug.apk" "release\QR-JOE-Forge.apk" >nul
echo.
echo Build complete.
echo APK: %CD%\release\QR-JOE-Forge.apk
pause
exit /b 0

:fail
echo Build failed. Review the messages above.
pause
exit /b 1
