@echo off
echo Clearing git lock files...
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock" del /f ".git\HEAD.lock"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Vercel will auto-deploy in ~2 minutes.
echo Then visit: https://zibendao.vercel.app/api/auth-debug
pause
