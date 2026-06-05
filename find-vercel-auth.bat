@echo off
echo Searching for Vercel auth...
if exist "%LOCALAPPDATA%\com.vercel.cli\auth.json" (
    echo Found at LOCALAPPDATA\com.vercel.cli:
    type "%LOCALAPPDATA%\com.vercel.cli\auth.json"
) else (
    echo Not at LOCALAPPDATA\com.vercel.cli
)
if exist "%LOCALAPPDATA%\vercel\auth.json" (
    echo Found at LOCALAPPDATA\vercel:
    type "%LOCALAPPDATA%\vercel\auth.json"
) else (
    echo Not at LOCALAPPDATA\vercel
)
echo.
echo Running vercel whoami to see token state:
vercel whoami 2>&1
pause
