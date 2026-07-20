@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title HS Battlegrounds Quick Pull

set "TASKNAME=HS_QuickPull"

:: ============================================
:: ONE CLICK - AUTO ELEVATED (via scheduled task)
:: ============================================
:: First double-click: one UAC prompt to create the task.
:: After that: pure one-click, no UAC, no "Run as admin", no cmd window hassle.
::
:: Usage:
::   Just double-click this file.
::
:: Cleanup (if game won't connect):
::   Quick_Pull.bat cleanup     (from normal cmd)
:: ============================================

:: Already elevated? (task or manual admin)
whoami /groups | find "S-1-16-12288" >nul 2>&1 && goto :elevated

:: Not elevated
if /i "%~1"=="cleanup" (
    powershell -Command "Start-Process -Verb RunAs -FilePath '%~f0' -ArgumentList 'cleanup' -Wait"
    exit /b
)

:: Try to run via scheduled task (no UAC)
schtasks /run /tn "%TASKNAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo Quick Pull started via elevated task...
    exit /b
)

:: Task does not exist yet -> create it (one-time UAC)
echo First-time setup: creating elevated scheduled task...
powershell -Command "Start-Process -Verb RunAs -FilePath '%~f0' -ArgumentList 'create_task' -Wait"
exit /b

:create_task
schtasks /create /tn "%TASKNAME%" /tr "\"%~f0\" run" /sc ondemand /ru "%USERNAME%" /rl highest /f >nul 2>&1
echo Scheduled task created.
echo From now on you can just double-click this file with no prompts.
schtasks /run /tn "%TASKNAME%" >nul 2>&1
exit /b

:run
goto :elevated

:elevated
:: We are now running with admin rights
if /i "%~1"=="cleanup" goto :do_cleanup

echo Starting quick pull (block 4s)...

:: Try to find Hearthstone.exe (prefer modern Battle.net path)
set "HS="
for /f "delims=" %%i in ('powershell -NoProfile -Command "(Get-Process Hearthstone -EA SilentlyContinue | Select -First 1).Path" 2^>nul') do set "HS=%%i"

if not defined HS set "HS=C:\Program Files (x86)\Battle.net\Games\Hearthstone\Hearthstone.exe"
if not exist "!HS!" set "HS=C:\Program Files (x86)\Hearthstone\Hearthstone.exe"

if not exist "!HS!" (
    echo Hearthstone.exe not found at !HS!
    pause
    exit /b
)

echo Found: !HS!

set "RULE=HS_BG_Pull_Temp"

netsh advfirewall firewall delete rule name="%RULE%" >nul 2>&1
netsh advfirewall firewall add rule name="%RULE%" dir=out program="!HS!" action=block >nul 2>&1

for /l %%s in (4,-1,1) do (
    echo Blocking %%s...
    timeout /t 1 >nul
)

netsh advfirewall firewall delete rule name="%RULE%" >nul 2>&1

echo Pull complete! Game reconnecting...
pause
exit /b

:do_cleanup
echo Running cleanup...
netsh advfirewall firewall delete rule name="HS_BG_Pull_Temp" >nul 2>&1
netsh advfirewall firewall delete rule name="HS_BG_Pull_Temp_IN" >nul 2>&1
netsh advfirewall firewall delete rule name="HS_BG_Pull_Temp" >nul 2>&1
netsh advfirewall firewall delete rule name="HS_BG_Pull_Temp_IN" >nul 2>&1

for %%P in (
    "%ProgramFiles(x86)%\Battle.net\Games\Hearthstone\Hearthstone.exe"
    "%ProgramFiles(x86)%\Hearthstone\Hearthstone.exe"
) do (
    if exist "%%~P" netsh advfirewall firewall delete rule program="%%~P" >nul 2>&1
)

echo Cleanup done. Restart Battle.net if the game still won't connect.
pause
exit /b