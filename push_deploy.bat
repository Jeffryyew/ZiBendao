@echo off
cd /d C:\Users\Dell\Desktop\zibendao
echo Removing stale git locks...
del /f ".git\index.lock" 2>nul
del /f ".git\HEAD.lock" 2>nul
echo Staging files...
git add src/lib/capitalLaunchCourse.ts src/app/online/learn/page.tsx
echo Committing...
git commit -m "feat: 资本启航完整13章100关课程系统 + 5阶段导航"
echo Pushing to GitHub...
git push
echo.
echo Done! Vercel will auto-deploy in ~2 minutes.
pause
