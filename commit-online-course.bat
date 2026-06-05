@echo off
cd /d "%~dp0"
echo Removing git lock files...
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock" del /f ".git\HEAD.lock"
echo.
echo Staging files...
git add prisma/schema.prisma src/lib/capitalLaunchCourse.ts src/app/online src/components/online src/app/student/dashboard/DashboardClient.tsx migrate-online.bat
if %errorlevel% neq 0 ( echo ERROR: git add failed & pause & exit /b 1 )
echo.
echo Committing...
git commit -m "feat: 《资本启航》AI immersive online course — 11 modules, gamification schema, story/quiz/simulation player, pricing & valuation simulators"
if %errorlevel% neq 0 ( echo ERROR: git commit failed & pause & exit /b 1 )
echo.
echo Pushing...
git push origin main
echo.
pause
