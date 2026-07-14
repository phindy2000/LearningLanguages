@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay Node.js. Hay cai Node.js 18 tro len.
  pause
  exit /b 1
)
echo Mo trinh duyet tai: http://127.0.0.1:8080
node server.mjs
pause
