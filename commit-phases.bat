@echo off
cd /d "%~dp0"
echo Removing git lock files...
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock" del /f ".git\HEAD.lock"
echo.
echo Staging files...
git add auth.config.ts middleware.ts package.json src/app/courses/page.tsx src/app/login/LoginClient.tsx src/app/login/otp/page.tsx src/app/register/page.tsx src/app/tools/guide/page.tsx src/components/home/HomeClient.tsx src/components/tools/ToolShell.tsx src/lib/email.ts
if %errorlevel% neq 0 ( echo ERROR: git add failed & pause & exit /b 1 )
echo.
echo Committing...
git commit -m "feat: Phase 1-4 pre-login page updates — tools link, courses cleanup, auth gate, email SMTP, remember-me"
if %errorlevel% neq 0 ( echo ERROR: git commit failed & pause & exit /b 1 )
echo.
echo Pushing...
powershell -ExecutionPolicy Bypass -File push.ps1
echo.
pause
