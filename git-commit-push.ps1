Set-Location "C:\Users\Dell\Desktop\zibendao"

# Step 1: Remove stale lock
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
Write-Host "Lock cleared" -ForegroundColor Green

# Step 2: Stage all new files
git add src/app/dashboard/capital `
  src/app/tools/startup-expense src/app/tools/sales-forecast `
  src/app/tools/cash-flow src/app/tools/income-statement `
  src/app/tools/breakeven-analysis src/app/tools/balance-sheet `
  src/app/tools/capital-roadmap src/app/tools/data-room `
  src/app/tools/deal-flow src/app/tools/due-diligence `
  src/app/tools/fundraising-system src/app/tools/investor-relations `
  src/app/tools/capital-structure src/app/tools/equity-structure `
  src/app/tools/investment-committee src/app/tools/portfolio-management `
  src/app/tools/risk-control src/app/tools/spv-structure `
  src/lib/capitalModules.ts src/lib/featureFlags.ts `
  src/components/tools `
  .gitignore

Write-Host "Files staged" -ForegroundColor Green

# Step 3: Commit
git commit -m "feat: Capital Operating System - 22-module enterprise tool system"
Write-Host "Committed" -ForegroundColor Green

# Step 4: Push with token
$token = Read-Host "Enter GitHub token"
$b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("jeffryyew:$token"))
git -c "http.extraHeader=Authorization: Basic $b64" push origin main
Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to close"
