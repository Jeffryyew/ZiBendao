$token = "REDACTED_TOKEN"
$projectId = "prj_3eMvlwfUGlgD5tYam91n9nuE2UZS"
$teamId = "team_ei2oEAanKpGuN9I4T5JJXYrP"
$headers = @{ Authorization = "Bearer $token" }

Write-Host "=== Getting latest deployment ===" -ForegroundColor Cyan
$deploys = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?teamId=$teamId&projectId=$projectId&limit=1" -Headers $headers
$latest = $deploys.deployments[0]
Write-Host "Latest deployment: $($latest.uid)" -ForegroundColor Green
Write-Host "URL: $($latest.url)"
Write-Host "State: $($latest.state)"

Write-Host "`n=== Getting runtime logs ===" -ForegroundColor Cyan
try {
    # Get function logs from the latest deployment
    $logs = Invoke-RestMethod -Uri "https://api.vercel.com/v2/deployments/$($latest.uid)/events?teamId=$teamId&limit=50&direction=backward" -Headers $headers

    $logs | ForEach-Object {
        if ($_.type -eq "stderr" -or ($_.payload -and $_.payload.text -match "auth|error|Error|callback|google|Google")) {
            $text = if ($_.payload) { $_.payload.text } else { $_ | ConvertTo-Json }
            Write-Host "[$(($_.date | Get-Date -Format 'HH:mm:ss'))] $text" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Log fetch error: $_" -ForegroundColor Red
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "Press any key..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
