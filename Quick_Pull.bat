@echo off
chcp 65001 >nul
title HS Battlegrounds Quick Pull

:: Check for admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting admin...
    powershell -Command "Start-Process -Verb RunAs -FilePath '%~f0'"
    exit /b
)

echo Starting quick pull (block 4s)...

:: Try to find Hearthstone.exe
set "HS="
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-Process Hearthstone -EA SilentlyContinue | Select -First 1).Path"`) do set "HS=%%i"

if not defined HS set "HS=C:\Program Files (x86)\Hearthstone\Hearthstone.exe"

if not exist "%HS%" (
    echo Hearthstone.exe not found at %HS%
    pause
    exit /b
)

echo Found: %HS%

set "RULE=HS_BG_Pull_Temp"

netsh advfirewall firewall delete rule name="%RULE%" >nul 2>&1
netsh advfirewall firewall add rule name="%RULE%" dir=out program="%HS%" action=block >nul 2>&1

for /l %%s in (4,-1,1) do (
    echo Blocking %%s...
    timeout /t 1 >nul
)

netsh advfirewall firewall delete rule name="%RULE%" >nul 2>&1

echo Pull complete! Game reconnecting...
pause