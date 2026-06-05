@echo off
cd /d C:\Users\Dell\Desktop\zibendao
echo Deploying to Vercel production with token...
vercel --prod --yes --token REDACTED_TOKEN > C:\Users\Dell\Desktop\zibendao\deploy-result.txt 2>&1
echo EXIT=%ERRORLEVEL%
echo EXIT=%ERRORLEVEL% >> C:\Users\Dell\Desktop\zibendao\deploy-result.txt
echo.
echo --- Deploy output: ---
type C:\Users\Dell\Desktop\zibendao\deploy-result.txt
pause
