@echo off
setlocal enabledelayedexpansion
title NeuroVisionAI - Demonstration Launcher

echo ======================================================================
echo          NEUROVISION AI - FACULTY DEMONSTRATION LAUNCHER
echo ======================================================================
echo.

set "PROJECT_ROOT=%~dp0"
set "PYTHON_EXE=%PROJECT_ROOT%.venv\Scripts\python.exe"

:: 1. Validate Python Virtual Environment
if not exist "%PYTHON_EXE%" (
    echo [ERROR] Python virtual environment was not found at:
    echo         %PYTHON_EXE%
    echo Please ensure the .venv folder is present in the project directory.
    echo.
    pause
    exit /b 1
)

:: 2. Validate Trained Model Checkpoints
set "RESNET_PTH=%PROJECT_ROOT%models\resnet50_finetuned_best.pth"
set "VGG_PTH=%PROJECT_ROOT%models\vgg16_best.pth"

if not exist "%RESNET_PTH%" (
    echo [WARNING] ResNet-50 checkpoint missing at %RESNET_PTH%
)
if not exist "%VGG_PTH%" (
    echo [WARNING] VGG-16 checkpoint missing at %VGG_PTH%
)

:: 3. Determine Frontend Port (use 3000 if free, otherwise 3001)
set "FRONTEND_PORT=3001"
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" >nul 2>&1
if %errorlevel% equ 0 (
    set "FRONTEND_PORT=3000"
) else (
    set "FRONTEND_PORT=3001"
)

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "NeuroVisionAI - Backend Engine (Port 8000)" cmd /k "title NeuroVisionAI Backend (Port 8000) && cd /d "%PROJECT_ROOT%" && "%PYTHON_EXE%" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

:: Wait 3 seconds for model loading
timeout /t 3 /nobreak >nul

echo [2/3] Starting Next.js Workstation on http://localhost:!FRONTEND_PORT! ...
start "NeuroVisionAI - Frontend Workstation (Port !FRONTEND_PORT!)" cmd /k "title NeuroVisionAI Frontend (Port !FRONTEND_PORT!) && cd /d "%PROJECT_ROOT%frontend" && npm run dev -- -p !FRONTEND_PORT!"

:: Wait 4 seconds for Next.js dev server
timeout /t 4 /nobreak >nul

echo [3/3] Opening Demonstration in your default browser...
start http://localhost:!FRONTEND_PORT!

echo.
echo ======================================================================
echo   NEUROVISION AI IS NOW RUNNING FOR YOUR FACULTY DEMONSTRATION
echo ======================================================================
echo   Backend Engine API:  http://127.0.0.1:8000
echo   Frontend Workstation: http://localhost:!FRONTEND_PORT!
echo   API Documentation:    http://127.0.0.1:8000/docs
echo ======================================================================
echo.
echo DEMONSTRATION SEQUENCE FOR FACULTY:
echo   1. The browser should open automatically at http://localhost:!FRONTEND_PORT!
echo   2. Click any of the 4 benchmark scans (e.g. "Meningioma", "Glioma")
echo      or upload a local MRI scan (PNG / JPG).
echo   3. Leave model selection on "Both Models" for consensus comparison.
echo   4. Click "Run Deep Learning Analysis".
echo   5. Walk through the predictions, probabilities, and Grad-CAM maps.
echo   6. Click "Download PDF Analysis Report" to show the exported report.
echo.
echo To shut down both servers cleanly, double-click STOP_NEUROVISIONAI.bat
echo or close the two spawned terminal windows.
echo ======================================================================
echo.
pause
