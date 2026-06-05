@echo off
echo === Pushing new commits to GitHub ===
cd /d C:\Users\Dell\Desktop\zibendao
git push origin main
echo.
echo Done! Vercel will auto-deploy in ~2 minutes.
echo Then visit: https://zibendao.vercel.app/api/env-check
echo Press any key to continue . . .
pause > nul
