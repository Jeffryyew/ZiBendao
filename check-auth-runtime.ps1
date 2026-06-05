Write-Host "=== Checking runtime auth config on zibendao.vercel.app ===" -ForegroundColor Cyan

try {
    $envCheck = Invoke-RestMethod -Uri "https://zibendao.vercel.app/api/env-check" -Method Get
    Write-Host "`n--- /api/env-check ---" -ForegroundColor Yellow
    $envCheck | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "env-check error: $_" -ForegroundColor Red
}

try {
    $authDebug = Invoke-RestMethod -Uri "https://zibendao.vercel.app/api/auth-debug" -Method Get
    Write-Host "`n--- /api/auth-debug ---" -ForegroundColor Yellow
    $authDebug | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "auth-debug error: $_" -ForegroundColor Red
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "Press any key..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
