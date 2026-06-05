@echo off
cd /d C:\Users\Dell\Desktop\zibendao
echo Checking auth-debug endpoint...
powershell -Command "Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/auth-debug' -UseBasicParsing | Select-Object -ExpandProperty Content" > auth-debug-result.txt 2>&1
echo.
echo === Result saved to auth-debug-result.txt ===
type auth-debug-result.txt
echo.
echo === Done. Press any key... ===
pause
