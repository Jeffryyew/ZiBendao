@echo off
echo === Network IP Addresses ===
echo.
powershell -ExecutionPolicy Bypass -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -ne '127.0.0.1'} | Select-Object InterfaceAlias, IPAddress | Format-Table -AutoSize"
echo.
pause
