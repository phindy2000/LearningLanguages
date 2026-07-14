@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay Node.js. Hay cai Node.js 18 tro len.
  pause
  exit /b 1
)
set TRANSLATION_PROVIDER=google-cloud
set /p GOOGLE_TRANSLATE_API_KEY=Nhap Google Cloud Translation API key: 
if "%GOOGLE_TRANSLATE_API_KEY%"=="" (
  echo API key khong duoc de trong.
  pause
  exit /b 1
)
echo Mo trinh duyet tai: http://127.0.0.1:8080
node server.mjs
pause
