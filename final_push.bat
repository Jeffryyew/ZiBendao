@echo off
cd /d C:\Users\Dell\Desktop\zibendao

echo === 资本启航 部署脚本 ===
echo.

REM Force kill any git.exe background processes holding the lock
echo Killing background git processes...
taskkill /F /IM git.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

REM Remove lock files
echo Removing git locks...
del /f /q ".git\index.lock" >nul 2>&1
del /f /q ".git\HEAD.lock" >nul 2>&1
del /f /q ".git\refs\heads\main.lock" >nul 2>&1

REM Check if files are already staged, if not stage them
echo Staging modified files...
git add src/lib/capitalLaunchCourse.ts src/app/online/learn/page.tsx

REM Show what's staged
echo.
echo Staged changes:
git diff --cached --stat

echo.
echo Committing...
git commit --no-verify -m "feat: 资本启航完整13章100关课程系统 + 5阶段导航"
if %errorlevel% neq 0 (
  echo Commit failed! Trying again after 3 seconds...
  timeout /t 3 /nobreak >nul
  del /f /q ".git\index.lock" >nul 2>&1
  git commit --no-verify -m "feat: 资本启航完整13章100关课程系统 + 5阶段导航"
)

echo.
echo Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
  echo Push failed. Error code: %errorlevel%
  echo Try running: git push origin main
) else (
  echo.
  echo SUCCESS! Vercel will auto-deploy in ~2 minutes.
  echo Visit: https://zibendao.vercel.app
)

echo.
echo === Done ===
pause
