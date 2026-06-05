@echo off
echo === Checking Vercel deployment (db-test) ===
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/db-test' -UseBasicParsing; Write-Host $r.Content } catch { Write-Host ('ERROR: ' + $_.Exception.Message) }"
echo.
echo === Checking auth-debug (new endpoint) ===
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/auth-debug' -UseBasicParsing; $r.Content | Out-File '%~dp0debug-result.txt' -Encoding UTF8; Write-Host $r.Content } catch { Write-Host ('404 = still deploying or build failed: ' + $_.Exception.Message) }"
echo.
echo === Checking login page for error display ===
powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://zibendao.vercel.app/login?error=OAuthCallbackError' -UseBasicParsing; if ($r.Content -match 'Google') { Write-Host 'LOGIN PAGE OK - error display code is deployed' } else { Write-Host 'Login page loaded but content unexpected' } } catch { Write-Host ('Login page error: ' + $_.Exception.Message) }"
echo.
pause
