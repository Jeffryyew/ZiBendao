$token = "REDACTED_TOKEN"
$projectId = "prj_3eMvlwfUGlgD5tYam91n9nuE2UZS"
$teamId = "team_ei2oEAanKpGuN9I4T5JJXYrP"
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "=== Deleting AUTH_URL from Vercel project env vars ===" -ForegroundColor Cyan
$envList = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$projectId/env?teamId=$teamId" -Headers $headers
$envList.envs | ForEach-Object { Write-Host "$($_.key) [$($_.target -join ',')] id=$($_.id)" }

$toDelete = $envList.envs | Where-Object { $_.key -eq "AUTH_URL" }
if ($toDelete) {
    foreach ($env in $toDelete) {
        Write-Host "Deleting AUTH_URL (id=$($env.id))..." -ForegroundColor Yellow
        Invoke-RestMethod -Method Delete `
            -Uri "https://api.vercel.com/v9/projects/$projectId/env/$($env.id)?teamId=$teamId" `
            -Headers $headers | Out-Null
        Write-Host "Deleted!" -ForegroundColor Green
    }
} else {
    Write-Host "AUTH_URL not found in project env vars." -ForegroundColor Gray
}

Write-Host "`nDone. Now deploy manually with deploy-with-token.bat" -ForegroundColor Cyan
Write-Host "Press any key..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
