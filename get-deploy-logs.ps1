$token = "REDACTED_TOKEN"
$projectId = "prj_3eMvlwfUGlgD5tYam91n9nuE2UZS"
$teamId = "team_ei2oEAanKpGuN9I4T5JJXYrP"
$headers = @{ Authorization = "Bearer $token" }

# Get latest deployment
$deploys = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?teamId=$teamId&projectId=$projectId&limit=1" -Headers $headers
$latest = $deploys.deployments[0]
Write-Host "Latest: $($latest.uid) state=$($latest.state)" -ForegroundColor Cyan

# Get function logs (runtime logs)
try {
    $logUri = "https://api.vercel.com/v2/deployments/$($latest.uid)/events?teamId=$teamId&limit=100&types=error,stderr,stdout"
    $events = Invoke-RestMethod -Uri $logUri -Headers $headers
    Write-Host "`n--- Runtime Events ---" -ForegroundColor Yellow
    $events | ForEach-Object {
        $text = if ($_.payload -and $_.payload.text) { $_.payload.text } elseif ($_.text) { $_.text } else { $_ | ConvertTo-Json -Compress }
        if ($text -match "error|Error|config|auth|prisma|database|secret|Configuration" -or $_.type -eq "stderr") {
            Write-Host "[$($_.type)] $text" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Event log error: $_" -ForegroundColor Red
}

# Also get env vars (unencrypted) to check DATABASE_URL situation
Write-Host "`n--- Checking DB env vars ---" -ForegroundColor Cyan
try {
    $envs = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$projectId/env?teamId=$teamId" -Headers $headers
    $dbVars = $envs.envs | Where-Object { $_.key -match "POSTGRES|DATABASE|AUTH_SECRET|AUTH_URL|NEXTAUTH" }
    $dbVars | ForEach-Object {
        $val = if ($_.value) { $_.value.Substring(0, [Math]::Min(50, $_.value.Length)) + "..." } else { "<encrypted>" }
        Write-Host "$($_.key) [$($_.target -join ',')]: $val" -ForegroundColor Green
    }
} catch {
    Write-Host "Env fetch error: $_" -ForegroundColor Red
}

Write-Host "`nPress any key..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
