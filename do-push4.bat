@echo off
cd /d C:\Users\Dell\Desktop\zibendao
git push origin main
echo PUSH_EXIT=%ERRORLEVEL% > C:\Users\Dell\Desktop\push4-result.txt
pause
