@echo off
title SIGNALX Launcher

echo Starting SIGNALX backend...
start "SIGNALX Backend" cmd /k "cd /d D:\SignalX\server && npm run dev"

timeout /t 4 /nobreak >nul

echo Starting SIGNALX frontend...
start "SIGNALX Frontend" cmd /k "cd /d D:\SignalX\client && npm run dev"

timeout /t 6 /nobreak >nul

echo Opening SIGNALX...
start "" "http://localhost:5173"

exit
