@echo off
cd /d C:\Users\Dell\Desktop\zibendao
echo Checking vercel CLI...
where vercel 2>nul
vercel --version 2>nul
echo.
echo Checking npm globals...
npm list -g vercel 2>nul | findstr vercel
echo.
echo Checking latest deployment status via API...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://api.vercel.com/v6/deployments?projectId=prj_3eMvlwfUGlgD5tYam91n9nuE2UZS&limit=3' -UseBasicParsing -ErrorAction Stop; Write-Host 'API: ' + $r.StatusCode; Write-Host $r.Content.Substring(0,500) } catch { Write-Host 'API error: ' + $_.Exception.Message }"
echo.
pause
