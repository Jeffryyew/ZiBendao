@echo off
cd /d "%~dp0"
echo Generating Prisma client...
npx prisma generate
echo.
echo Pushing schema to database...
npx prisma db push
echo.
echo Running seed for online course modules...
npx tsx prisma/seed-online.ts
echo.
pause
