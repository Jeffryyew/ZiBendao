@echo off
echo Checking Vercel auth...
type "%APPDATA%\com.vercel.cli\auth.json" 2>nul || echo not found at com.vercel.cli
type "%APPDATA%\vercel\auth.json" 2>nul || echo not found at vercel
type "%USERPROFILE%\.vercel\auth.json" 2>nul || echo not found at .vercel
echo.
echo Checking Vercel deployments via API (no auth)...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://vercel.com/jeffryyew/zibendao' -UseBasicParsing -MaximumRedirection 5 -ErrorAction Stop; Write-Host ('STATUS=' + $r.StatusCode) } catch { Write-Host ('ERR=' + $_.Exception.Message) }"
pause
