@echo off
title OmniRoute Gateway Daemon (Port 20128)
echo ================================================================================
echo               OMNIRUTE INFERENCE GATEWAY - PERSISTENT DAEMON
echo ================================================================================

:: Check if OmniRoute is already running on port 20128
netstat -ano | findstr /R /C:":20128 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] OmniRoute is already active and listening on port 20128.
    echo Daemon check complete. Exiting startup script.
    exit /b 0
)

:: Locate omniroute executable dynamically
set "OMNI_BIN="

where omniroute >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "delims=" %%i in ('where omniroute') do (
        if not defined OMNI_BIN set "OMNI_BIN=%%i"
    )
)

if not defined OMNI_BIN (
    if exist "%APPDATA%\npm\omniroute.cmd" set "OMNI_BIN=%APPDATA%\npm\omniroute.cmd"
)

if not defined OMNI_BIN (
    if exist "%LOCALAPPDATA%\pnpm\omniroute.cmd" set "OMNI_BIN=%LOCALAPPDATA%\pnpm\omniroute.cmd"
)

if not defined OMNI_BIN (
    echo [INFO] omniroute binary not found in standard PATH. Falling back to npx omniroute...
    set "OMNI_BIN=npx omniroute"
)

echo [INFO] Launching OmniRoute service using: %OMNI_BIN%
echo [INFO] Gateway URL: http://127.0.0.1:20128
echo [INFO] Press Ctrl+C in this console to terminate.
echo.

:loop
%OMNI_BIN% serve
echo.
echo [WARNING] OmniRoute process exited at %DATE% %TIME%.
echo [INFO] Restarting OmniRoute gateway in 3 seconds...
timeout /t 3 >nul
goto loop
