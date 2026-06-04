@echo off
cd /d "%~dp0"
echo Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 ( echo ERROR: prisma generate failed & pause & exit /b 1 )
echo.
echo Pushing schema to database...
npx prisma db push
if %errorlevel% neq 0 ( echo ERROR: prisma db push failed & pause & exit /b 1 )
echo.
echo ✅ Migration complete! Schema pushed to Supabase.
echo    Tables: OnlineModule, OnlineLesson, OnlineLessonProgress
echo    Fields: xp, capitalLevel, streak, lastActiveAt, badges
echo.
pause
