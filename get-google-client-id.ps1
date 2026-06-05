$token = "REDACTED_TOKEN"
$projectId = "prj_3eMvlwfUGlgD5tYam91n9nuE2UZS"
$teamId = "team_ei2oEAanKpGuN9I4T5JJXYrP"
$headers = @{ Authorization = "Bearer $token" }

$envList = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$projectId/env?teamId=$teamId&decrypt=true" -Headers $headers

$clientId = $envList.envs | Where-Object { $_.key -eq "GOOGLE_CLIENT_ID" }
if ($clientId) {
    Write-Host "GOOGLE_CLIENT_ID: $($clientId.value)" -ForegroundColor Green
    # Extract project number from client ID (format: <number>-<hash>.apps.googleusercontent.com)
    $parts = $clientId.value -split "-"
    if ($parts.Length -gt 0) {
        Write-Host "Google Cloud Project Number: $($parts[0])" -ForegroundColor Cyan
    }
    # Open the direct credentials URL
    $url = "https://console.cloud.google.com/apis/credentials"
    Write-Host "Opening: $url" -ForegroundColor Yellow
    Start-Process chrome $url
} else {
    Write-Host "GOOGLE_CLIENT_ID not found" -ForegroundColor Red
    # Show all env keys for reference
    $envList.envs | ForEach-Object { Write-Host $_.key }
}

Write-Host "`nPress any key..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
