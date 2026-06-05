@echo off
echo Checking Vercel CLI... > C:\Users\Dell\Desktop\vercel-info.txt
where vercel >> C:\Users\Dell\Desktop\vercel-info.txt 2>&1
echo. >> C:\Users\Dell\Desktop\vercel-info.txt
echo Vercel auth config: >> C:\Users\Dell\Desktop\vercel-info.txt
type "%APPDATA%\vercel\auth.json" >> C:\Users\Dell\Desktop\vercel-info.txt 2>&1
echo. >> C:\Users\Dell\Desktop\vercel-info.txt
echo Node path: >> C:\Users\Dell\Desktop\vercel-info.txt
where node >> C:\Users\Dell\Desktop\vercel-info.txt 2>&1
echo. >> C:\Users\Dell\Desktop\vercel-info.txt
echo Vercel global packages: >> C:\Users\Dell\Desktop\vercel-info.txt
npm list -g vercel 2>&1 >> C:\Users\Dell\Desktop\vercel-info.txt
echo Done! >> C:\Users\Dell\Desktop\vercel-info.txt
