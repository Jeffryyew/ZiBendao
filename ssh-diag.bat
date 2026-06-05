@echo off
echo === SSH Diagnostics ===
echo.
echo Checking if port 22 is listening:
powershell -ExecutionPolicy Bypass -Command "netstat -an | Select-String ':22 '"
echo.
echo Checking sshd service:
powershell -ExecutionPolicy Bypass -Command "Get-Service sshd | Select-Object Name, Status, StartType"
echo.
echo Checking OpenSSH firewall rules:
powershell -ExecutionPolicy Bypass -Command "Get-NetFirewallRule -DisplayName 'OpenSSH*' 2>$null | Select-Object DisplayName, Enabled, Profile | Format-Table -AutoSize"
echo.
pause
