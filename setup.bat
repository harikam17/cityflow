@echo off
setlocal
cd /d "%~dp0"

echo === CityFlow setup ===
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found. Install the LTS version from https://nodejs.org and run this again.
    pause
    exit /b 1
)

for /f "tokens=1 delims=v." %%v in ('node -v') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 18 (
    echo Node.js 18 or newer is required. Found:
    node -v
    echo Install the LTS version from https://nodejs.org and run this again.
    pause
    exit /b 1
)

echo Using Node.js
node -v
echo.

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo npm install failed. See the errors above.
    pause
    exit /b 1
)

echo.
echo Checking the simulation engine...
call npm run validate
if errorlevel 1 (
    echo.
    echo Engine checks failed. See the errors above.
    pause
    exit /b 1
)

echo.
echo Setup complete. Double-click run.bat to start CityFlow.
pause
