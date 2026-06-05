@echo off
cd /d "%~dp0"
echo Starting dev server...
start "" cmd /k "npm run dev"
timeout /t 5 /nobreak
start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:3000/login"
