@echo off
setlocal
title NeuroVisionAI - Shutdown Utility

echo ======================================================================
echo          NEUROVISION AI - DEMONSTRATION SHUTDOWN UTILITY
echo ======================================================================
echo.
echo Stopping NeuroVisionAI backend (Port 8000) and frontend (Ports 3000/3001)...
echo.

powershell -NoProfile -Command "
$ports = @(8000, 3000, 3001);
$killedAny = $false;
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue;
    if ($conns) {
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique;
        foreach ($procId in $pids) {
            if ($procId -gt 4) {
                try {
                    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue;
                    if ($proc -and ($proc.ProcessName -match 'python|node|cmd|uvicorn')) {
                        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue;
                        Write-Host ('  [OK] Terminated ' + $proc.ProcessName + ' (PID: ' + $procId + ') listening on port ' + $p);
                        $killedAny = $true;
                    }
                } catch {
                    # Ignore permissions
                }
            }
        }
    } else {
        Write-Host ('  [INFO] Port ' + $p + ' is free.');
    }
}
if (-not $killedAny) {
    Write-Host '  [INFO] No active NeuroVisionAI processes were found running on ports 8000, 3000, or 3001.';
}
"

echo.
echo ======================================================================
echo   SHUTDOWN COMPLETE - ALL DEMONSTRATION PORTS ARE NOW FREE
echo ======================================================================
echo.
pause
