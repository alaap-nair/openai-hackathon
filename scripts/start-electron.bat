@echo off
REM Math Study Copilot - Electron Startup Script (Windows)

echo 🚀 Starting Math Study Copilot Desktop App...

REM Kill any existing processes
echo 🧹 Cleaning up existing processes...
taskkill /f /im node.exe 2>nul || echo No Node processes to kill
taskkill /f /im electron.exe 2>nul || echo No Electron processes to kill

REM Wait a moment for processes to clean up
timeout /t 2 /nobreak >nul

REM Start the Electron app
echo 🎯 Starting Electron development server...
npm run electron-dev

echo ✅ Math Study Copilot is ready! 