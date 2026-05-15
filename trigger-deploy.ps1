Set-Location "C:\Users\Dell\Desktop\zibendao"
git commit --allow-empty -m "trigger vercel deploy"
$token = Read-Host "Enter GitHub token"
$b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("jeffryyew:$token"))
git -c "http.extraHeader=Authorization: Basic $b64" push origin main
Write-Host "Deployed!" -ForegroundColor Green
Read-Host "Press Enter to close"
