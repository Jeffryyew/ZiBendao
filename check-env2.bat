@echo off
echo Checking env-check...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/env-check' -UseBasicParsing -TimeoutSec 20; $r.Content } catch { 'Error: ' + $_.Exception.Message }" > C:\Users\Dell\Desktop\env-check-result.txt 2>&1
type C:\Users\Dell\Desktop\env-check-result.txt
pause
