$token = "REDACTED_TOKEN"
$projectId = "prj_3eMvlwfUGlgD5tYam91n9nuE2UZS"
$teamId = "team_ei2oEAanKpGuN9I4T5JJXYrP"
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# 1. Check existing env vars
Write-Host "=== Current env vars ===" -ForegroundColor Cyan
$envList = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$projectId/env?teamId=$teamId" -Headers $headers
$envList.envs | ForEach-Object { Write-Host "$($_.key) = $($_.value) [$($_.target -join ',')]" }

# 2. Delete existing AUTH_URL and NEXTAUTH_URL from production if present
$envList.envs | Where-Object { $_.key -in @("AUTH_URL","NEXTAUTH_URL") -and "production" -in $_.target } | ForEach-Object {
    Write-Host "Deleting $($_.key) (id=$($_.id))..." -ForegroundColor Yellow
    Invoke-RestMethod -Method Delete `
        -Uri "https://api.vercel.com/v9/projects/$projectId/env/$($_.id)?teamId=$teamId" `
        -Headers $headers | Out-Null
    Write-Host "Deleted." -ForegroundColor Green
}

# 3. Set AUTH_URL=https://zibendao.vercel.app for production
Write-Host "Setting AUTH_URL=https://zibendao.vercel.app for production..." -ForegroundColor Cyan
$body = @{
    key    = "AUTH_URL"
    value  = "https://zibendao.vercel.app"
    type   = "plain"
    target = @("production")
} | ConvertTo-Json
$result = Invoke-RestMethod -Method Post `
    -Uri "https://api.vercel.com/v10/projects/$projectId/env?teamId=$teamId" `
    -Headers $headers -Body $body
Write-Host "Done: $($result.key) = $($result.value)" -ForegroundColor Green

# 4. Redeploy
Write-Host "`nRedeploying..." -ForegroundColor Cyan
Set-Location "C:\Users\Dell\Desktop\zibendao"
& vercel --prod --yes --token $token > C:\Users\Dell\Desktop\zibendao\deploy-result.txt 2>&1
Write-Host "EXIT=$LASTEXITCODE"
Add-Content C:\Users\Dell\Desktop\zibendao\deploy-result.txt "EXIT=$LASTEXITCODE"
Write-Host "=== Deploy result ===" -ForegroundColor Cyan
Get-Content C:\Users\Dell\Desktop\zibendao\deploy-result.txt

Write-Host "`nDone! Press any key..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
