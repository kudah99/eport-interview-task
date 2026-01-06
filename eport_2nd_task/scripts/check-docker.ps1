# PowerShell script to check Docker Desktop status on Windows
# Usage: .\scripts\check-docker.ps1

Write-Host "Checking Docker Desktop status..." -ForegroundColor Cyan

# Check if Docker Desktop process is running
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue

if ($dockerProcess) {
    Write-Host "✓ Docker Desktop process is running" -ForegroundColor Green
    
    # Try to ping Docker daemon
    try {
        docker ps 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Docker daemon is responding" -ForegroundColor Green
            Write-Host "`nYou can now run: docker compose up -d" -ForegroundColor Yellow
        } else {
            Write-Host "⚠ Docker Desktop is running but daemon is not ready yet" -ForegroundColor Yellow
            Write-Host "Please wait a few moments and try again" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Docker Desktop is running but daemon is not responding" -ForegroundColor Yellow
        Write-Host "Please wait a few moments for Docker to fully start" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Docker Desktop is not running" -ForegroundColor Red
    Write-Host "`nTo start Docker Desktop:" -ForegroundColor Yellow
    Write-Host "1. Open Docker Desktop from Start Menu" -ForegroundColor White
    Write-Host "2. Or run: Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'" -ForegroundColor White
    Write-Host "3. Wait for Docker Desktop to fully start (whale icon in system tray)" -ForegroundColor White
    Write-Host "4. Then run this script again or try: docker compose up -d" -ForegroundColor White
}

Write-Host "`nDocker version info:" -ForegroundColor Cyan
docker --version 2>&1

