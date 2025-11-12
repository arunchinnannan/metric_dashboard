# PowerShell script to create Alpine-compatible node_modules using WSL

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Linux node_modules using WSL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory in WSL format
$currentDir = (Get-Location).Path
# Convert Windows path to WSL path manually (C:\path -> /mnt/c/path)
$wslPath = $currentDir -replace '\\', '/' -replace '^([A-Z]):', '/mnt/$1' 
$wslPath = $wslPath.ToLower()

Write-Host "Current directory: $currentDir" -ForegroundColor Yellow
Write-Host "WSL path: $wslPath" -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed in WSL
Write-Host "Checking Node.js in WSL..." -ForegroundColor Yellow
$nodeCheck = wsl bash -c "command -v node"

if ([string]::IsNullOrEmpty($nodeCheck)) {
    Write-Host "Node.js not found. Installing..." -ForegroundColor Yellow
    wsl bash -c "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
} else {
    Write-Host "Node.js found: $nodeCheck" -ForegroundColor Green
}
Write-Host ""

# Build frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building FRONTEND node_modules..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
wsl bash -c "cd $wslPath/metric_dashboard/frontend ; npm ci ; tar -czf node_modules-linux.tar.gz node_modules"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend done!" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Build backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building BACKEND node_modules..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
wsl bash -c "cd $wslPath/metric_dashboard/backend ; npm ci --omit=dev ; tar -czf node_modules-linux.tar.gz node_modules"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend done!" -ForegroundColor Green
} else {
    Write-Host "✗ Backend failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Created files:" -ForegroundColor Yellow
Write-Host "  - frontend/node_modules-linux.tar.gz"
Write-Host "  - backend/node_modules-linux.tar.gz"
Write-Host ""
Write-Host "Transfer these to your Ubuntu machine and extract:" -ForegroundColor Yellow
Write-Host "  tar -xzf node_modules-linux.tar.gz" -ForegroundColor Cyan
Write-Host ""
