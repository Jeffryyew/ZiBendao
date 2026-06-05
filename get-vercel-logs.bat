@echo off
cd /d C:\Users\Dell\Desktop\zibendao
echo Fetching Vercel deployment logs...
set TOKEN=REDACTED_TOKEN
powershell -Command "Invoke-WebRequest -Uri 'https://api.vercel.com/v6/deployments?projectId=prj_zibendao&limit=3' -Headers @{Authorization='Bearer %TOKEN%'} -UseBasicParsing | Select-Object -ExpandProperty Content" > vercel-logs.txt 2>&1
echo.
echo === Result: ===
type vercel-logs.txt
echo.
pause
