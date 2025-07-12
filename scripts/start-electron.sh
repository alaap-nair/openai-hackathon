#!/bin/bash

# Math Study Copilot - Electron Startup Script
echo "🚀 Starting Math Study Copilot Desktop App..."

# Kill any existing Vite processes
echo "🧹 Cleaning up existing processes..."
pkill -f "vite" 2>/dev/null || true
pkill -f "electron" 2>/dev/null || true

# Wait a moment for processes to clean up
sleep 2

# Check if port 5175 is available
if lsof -Pi :5175 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5175 is still in use. Trying to free it..."
    lsof -ti:5175 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start the Electron app
echo "🎯 Starting Electron development server..."
npm run electron-dev

echo "✅ Math Study Copilot is ready!" 