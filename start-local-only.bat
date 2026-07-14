@echo off
cd /d "%~dp0"
set TRANSLATION_PROVIDER=local
node server.mjs
pause
