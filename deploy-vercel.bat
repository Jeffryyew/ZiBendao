@echo off
cd /d C:\Users\Dell\Desktop\zibendao
echo Checking vercel CLI...
where vercel 2>nul && (
    echo Found vercel CLI, deploying...
    vercel --prod --yes
) || (
    echo Vercel CLI not found in PATH, trying npx...
    npx vercel --prod --yes 2>&1
)
echo EXIT=%ERRORLEVEL%
pause
