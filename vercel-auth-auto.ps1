# Auto-capture Vercel auth URL and open Chrome
Set-Location "C:\Users\Dell\Desktop\zibendao"

Write-Host "Starting Vercel login..." -ForegroundColor Cyan

# Start vercel as a background job to capture its output
$job = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Dell\Desktop\zibendao"
    & vercel login --github 2>&1
}

Write-Host "Waiting for device code URL..." -ForegroundColor Yellow

$url = $null
$startTime = Get-Date

while ((Get-Date) - $startTime -lt [TimeSpan]::FromSeconds(20)) {
    Start-Sleep -Milliseconds 500
    $output = Receive-Job -Job $job -Keep 2>/dev/null

    foreach ($line in $output) {
        if ($line -match "https://vercel\.com/oauth/device\?user_code=\S+") {
            $url = $Matches[0].Trim()
            break
        }
    }

    if ($url) { break }
}

if ($url) {
    Write-Host "`nDevice auth URL found: $url" -ForegroundColor Green
    Write-Host "Opening Chrome..." -ForegroundColor Green

    # Copy to clipboard
    Set-Clipboard -Value $url
    Write-Host "URL also copied to clipboard!" -ForegroundColor Green

    # Open in Chrome
    Start-Process "chrome.exe" "--new-window `"$url`""

    Write-Host "`nChrome should now show the Vercel authorization page." -ForegroundColor Cyan
    Write-Host "Please click 'Continue' or 'Authorize' in the browser." -ForegroundColor Yellow
    Write-Host "`nWaiting for you to authorize..." -ForegroundColor Yellow

    # Wait for job to complete (auth flow)
    Wait-Job -Job $job -Timeout 300
    $finalOutput = Receive-Job -Job $job
    Write-Host $finalOutput

    Write-Host "`nLogin complete! Now deploying..." -ForegroundColor Green

    # Deploy
    & vercel --prod --yes
    Write-Host "DEPLOY_EXIT=$LASTEXITCODE" -ForegroundColor Cyan
} else {
    Write-Host "Could not capture URL. Output was:" -ForegroundColor Red
    $output = Receive-Job -Job $job
    Write-Host $output
}

Remove-Job -Job $job -Force 2>/dev/null

Write-Host "`nPress any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
