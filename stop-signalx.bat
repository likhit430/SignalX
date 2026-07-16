@echo off
title SIGNALX Stopper

echo Stopping processes on port 5000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a
)

echo Stopping processes on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /f /pid %%a
)

echo Port 5000 and 5173 cleanups complete.
timeout /t 3 /nobreak >nul
exit
