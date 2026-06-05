@echo off
echo === Checking env-check endpoint content ===
powershell -Command "
try {
  $r = Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/env-check' -UseBasicParsing -TimeoutSec 15
  $r.Content | ConvertFrom-Json | Format-List
} catch {
  Write-Host 'Error:' $_.Exception.Message
}
"
echo.
pause
