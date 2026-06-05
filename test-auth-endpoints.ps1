Write-Host "=== Testing NextAuth endpoints ===" -ForegroundColor Cyan

# Test 1: providers list (NextAuth built-in)
Write-Host "`n1. /api/auth/providers" -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "https://zibendao.vercel.app/api/auth/providers" -Method Get -UseBasicParsing -TimeoutSec 15
    Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
    Write-Host $r.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "HTTP Status: $([int]$_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 2: session check
Write-Host "`n2. /api/auth/session" -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "https://zibendao.vercel.app/api/auth/session" -Method Get -UseBasicParsing -TimeoutSec 15
    Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
    Write-Host $r.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: CSRF token
Write-Host "`n3. /api/auth/csrf" -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "https://zibendao.vercel.app/api/auth/csrf" -Method Get -UseBasicParsing -TimeoutSec 15
    Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
    Write-Host $r.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: db-test
Write-Host "`n4. /api/db-test" -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "https://zibendao.vercel.app/api/db-test" -Method Get -UseBasicParsing -TimeoutSec 15
    Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
    Write-Host $r.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "Press any key..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
