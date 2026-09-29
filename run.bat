@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
    echo Dependencies are not installed. Running setup first...
    call setup.bat
    if errorlevel 1 exit /b 1
)

echo Starting CityFlow at http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call npm run dev -- --open
pause
