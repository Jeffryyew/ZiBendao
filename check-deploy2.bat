@echo off
echo === Checking deployment status ===
echo.
echo --- Testing env-check endpoint ---
powershell -Command "(Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/env-check' -UseBasicParsing -TimeoutSec 10).StatusCode" 2>nul || echo "Request failed or 404"
echo.
echo --- Testing db-test endpoint ---
powershell -Command "(Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/db-test' -UseBasicParsing -TimeoutSec 10).Content"
echo.
echo --- Testing auth-debug endpoint ---
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/auth-debug' -UseBasicParsing -TimeoutSec 10; $r.Content } catch { $_.Exception.Message }"
echo.
echo --- Testing login page ---
powershell -Command "(Invoke-WebRequest -Uri 'https://zibendao.vercel.app/login' -UseBasicParsing -TimeoutSec 10).StatusCode"
echo.
pause
