@echo off
title ShopEasy E-Commerce Store Server
color 0b
echo ========================================================
echo   Starting ShopEasy Full-Stack E-Commerce Server...
echo ========================================================
echo.
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found in PATH!
    echo Checking portable Node location...
    if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    ) else if exist "C:\Users\Dell\AppData\Roaming\Antigravity\bin\node.cmd" (
        set "PATH=C:\Users\Dell\AppData\Roaming\Antigravity\bin;%PATH%"
    ) else (
        echo Please ensure Node.js is installed.
        pause
        exit /b 1
    )
)

echo Node.js version:
node -v
echo.
echo Starting Express server at http://localhost:3000 ...
echo (Press Ctrl+C to stop the server anytime)
echo.
node backend/server.js
pause
