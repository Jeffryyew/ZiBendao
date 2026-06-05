@echo off
cd /d C:\Users\Dell\Desktop\zibendao
echo Starting Vercel login via GitHub (browser will open)...
vercel login --github
echo.
echo Login result: %ERRORLEVEL%
echo.
echo Checking who is logged in...
vercel whoami
echo.
echo Deploying to production...
vercel --prod --yes
echo.
echo DEPLOY_EXIT=%ERRORLEVEL%
pause
