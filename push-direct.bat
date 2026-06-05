@echo off
cd /d "%~dp0"
echo Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
  echo.
  echo Push failed. If prompted, try running push.ps1 with your token instead.
) else (
  echo.
  echo Push successful!
)
pause
