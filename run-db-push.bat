@echo off
cd /d C:\Users\Dell\Desktop\zibendao
echo === Syncing Prisma schema to Supabase database ===
echo This creates any missing tables (Account, Session, etc.)
echo without destroying existing data.
echo.
npx prisma db push --accept-data-loss
echo.
echo === Done. Press any key... ===
pause
