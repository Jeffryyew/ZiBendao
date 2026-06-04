Set-Location "C:\Users\Dell\Desktop\zibendao"
Write-Host "Commit already done. Pushing to GitHub..." -ForegroundColor Cyan
git log --oneline -1
$token = Read-Host "Enter GitHub token"
$b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("jeffryyew:$token"))
git -c "http.extraHeader=Authorization: Basic $b64" push origin main
Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to close"
