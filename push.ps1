Set-Location "C:\Users\Dell\Desktop\zibendao"
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
git add src/lib/capitalLevels.ts src/lib/achievements.ts src/lib/i18n.ts src/components/AchievementBadge.tsx src/components/SharedNav.tsx src/components/NotificationBanner.tsx src/app/dashboard/capital/page.tsx
git commit -m "feat: Capitalist identity system — 7-level XP, achievements, dashboard rewrite"
$token = Read-Host "Enter GitHub token"
$b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("jeffryyew:$token"))
git -c "http.extraHeader=Authorization: Basic $b64" push origin main
Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to close"
