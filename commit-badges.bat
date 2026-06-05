@echo off
cd /d "%~dp0"

echo =============================================
echo  Committing badge system + fixes
echo =============================================

git add src/lib/badges.ts
git add src/context/BadgeContext.tsx
git add src/components/badges/BadgeIcon.tsx
git add src/components/badges/BadgeUnlockModal.tsx
git add src/app/online/achievements/page.tsx
git add src/app/online/layout.tsx
git add src/app/online/learn/page.tsx
git add "src/app/online/learn/[moduleSlug]/[lessonSlug]/page.tsx"
git add src/app/student/dashboard/DashboardClient.tsx
git add src/app/student/learn/page.tsx
git add migrate-online.bat

echo.
echo Staged files:
git diff --cached --name-only
echo.

git commit -m "feat: add achievement badge system (12 online + 3 offline + ultimate)"

if %errorlevel% neq 0 (
  echo ERROR: commit failed
  pause
  exit /b 1
)

echo.
echo Pushing to GitHub...
git push origin main

if %errorlevel% neq 0 (
  echo ERROR: push failed
  pause
  exit /b 1
)

echo.
echo =============================================
echo  Done! Vercel will auto-deploy.
echo =============================================
pause
