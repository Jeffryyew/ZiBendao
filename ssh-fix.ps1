Write-Host "=== SSH Fix Script ===" -ForegroundColor Cyan

# Check current sshd status
$svc = Get-Service sshd -ErrorAction SilentlyContinue
if ($svc) {
    Write-Host "sshd status: $($svc.Status)" -ForegroundColor Yellow
} else {
    Write-Host "sshd service not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Check if port 22 is actually listening
Write-Host "`nChecking if port 22 is listening..." -ForegroundColor Cyan
$listener = netstat -an | Select-String ":22 "
if ($listener) {
    Write-Host "Port 22 listeners:" -ForegroundColor Green
    $listener | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "Port 22 is NOT listening - trying to start sshd..." -ForegroundColor Red
    Start-Service sshd
    Start-Sleep 2
}

# Check/add Windows Firewall rule for SSH
Write-Host "`nChecking firewall rules for port 22..." -ForegroundColor Cyan
$rule = Get-NetFirewallRule -DisplayName "OpenSSH*" -ErrorAction SilentlyContinue
if ($rule) {
    Write-Host "Found existing firewall rule(s):" -ForegroundColor Green
    $rule | Select-Object DisplayName, Enabled, Direction | Format-Table
} else {
    Write-Host "No OpenSSH firewall rule found. Adding one..." -ForegroundColor Yellow
    New-NetFirewallRule -Name "OpenSSH-Server-In-TCP" `
        -DisplayName "OpenSSH Server (sshd)" `
        -Enabled True `
        -Direction Inbound `
        -Protocol TCP `
        -Action Allow `
        -LocalPort 22
    Write-Host "Firewall rule added!" -ForegroundColor Green
}

# Also ensure sshd is set to auto-start
Set-Service -Name sshd -StartupType Automatic
Write-Host "`nsshd set to Automatic startup." -ForegroundColor Green

# Restart sshd to apply changes
Write-Host "Restarting sshd..." -ForegroundColor Cyan
Restart-Service sshd
Start-Sleep 2
$svc = Get-Service sshd
Write-Host "sshd status after restart: $($svc.Status)" -ForegroundColor Green

# Final port check
Write-Host "`nFinal port 22 check:" -ForegroundColor Cyan
netstat -an | Select-String ":22 "

Write-Host "`n=== Done! Try connecting from your iPad now ===" -ForegroundColor Green
Read-Host "Press Enter to close"
