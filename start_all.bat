@echo off
title Polarise Telecom Technology Launcher
echo ========================================================
echo   POLARISE TELECOM TECHNOLOGY - POLARIS EDUCATIONAL
echo ========================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Polarise Telecom Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo Starting Vite Frontend on http://127.0.0.1:5173 ...
start "Polarise Telecom Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers initiated! Access the platform at:
echo http://127.0.0.1:5173
echo ========================================================
pause
