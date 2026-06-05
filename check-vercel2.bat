@echo off
echo === Checking Vercel CLI and deployments ===
where vercel 2>nul && (
  echo Vercel CLI found
  vercel ls --yes 2>&1 | head -20
) || (
  echo Vercel CLI not found, trying npx
  cd /d C:\Users\Dell\Desktop\zibendao
  npx vercel@latest deployments --yes 2>&1 | head -30
)
echo.
echo === Checking Vercel auth config ===
type "%APPDATA%\vercel\auth.json" 2>nul || echo "(no vercel auth config found)"
echo.
pause
