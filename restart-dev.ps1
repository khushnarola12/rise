# Clean Restart Script for Rise Gym Management App
# This script stops the dev server, cleans the build cache, and restarts

Write-Host "🧹 Cleaning build cache..." -ForegroundColor Yellow

# Stop any running Next.js processes on port 3000
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($proc in $processes) {
        Write-Host "Stopping process $proc..." -ForegroundColor Cyan
        Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Remove .next folder
if (Test-Path ".next") {
    Write-Host "Removing .next folder..." -ForegroundColor Cyan
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev
