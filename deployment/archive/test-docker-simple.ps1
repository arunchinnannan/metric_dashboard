# Simple Docker Build Test Script

Write-Host "========================================"
Write-Host "Docker Build Test Script"
Write-Host "========================================"
Write-Host ""

# Check Docker
Write-Host "Checking Docker..."
docker version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running!"
    exit 1
}
Write-Host "OK: Docker is running"
Write-Host ""

# Extract node_modules
Write-Host "Preparing node_modules..."
$scriptDir = Split-Path -Parent $PSCommandPath
$metricDir = Split-Path -Parent $scriptDir
$wslPath = $metricDir -replace '\\', '/' -replace '^([A-Z]):', '/mnt/$1'
$wslPath = $wslPath.ToLower()

Write-Host "Metric dashboard path: $metricDir"
Write-Host "WSL path: $wslPath"

# Remove old Windows node_modules and extract Linux ones
Write-Host "Cleaning and extracting frontend..."
wsl bash -c "cd $wslPath/frontend ; rm -rf node_modules ; tar -xzf node_modules-linux.tar.gz"

Write-Host "Cleaning and extracting backend..."
wsl bash -c "cd $wslPath/backend ; rm -rf node_modules ; tar -xzf node_modules-linux.tar.gz"

Write-Host "OK: Linux node_modules extracted"
Write-Host ""

# Build images
Write-Host "========================================"
Write-Host "Building Frontend Image..."
Write-Host "========================================"
docker build -f deployment/Dockerfile.frontend -t metric-dashboard-frontend:test .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!"
    exit 1
}
Write-Host "OK: Frontend image built"
Write-Host ""

Write-Host "========================================"
Write-Host "Building Backend Image..."
Write-Host "========================================"
docker build -f deployment/Dockerfile.backend -t metric-dashboard-backend:test .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed!"
    exit 1
}
Write-Host "OK: Backend image built"
Write-Host ""

# Start containers
Write-Host "========================================"
Write-Host "Starting Containers..."
Write-Host "========================================"

Write-Host "Starting backend..."
docker run -d --name metric-backend-test -p 5000:5000 metric-dashboard-backend:test
Start-Sleep -Seconds 3

Write-Host "Starting frontend..."
docker run -d --name metric-frontend-test -p 8080:8080 metric-dashboard-frontend:test
Start-Sleep -Seconds 3
Write-Host ""

# Show status
Write-Host "========================================"
Write-Host "Container Status"
Write-Host "========================================"
docker ps --filter "name=metric-"
Write-Host ""

Write-Host "========================================"
Write-Host "Backend Logs (last 15 lines)"
Write-Host "========================================"
docker logs --tail 15 metric-backend-test
Write-Host ""

Write-Host "========================================"
Write-Host "Frontend Logs (last 15 lines)"
Write-Host "========================================"
docker logs --tail 15 metric-frontend-test
Write-Host ""

Write-Host "========================================"
Write-Host "Test Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Containers are running:"
Write-Host "  Frontend: http://localhost:8080"
Write-Host "  Backend:  http://localhost:5000"
Write-Host ""
Write-Host "To stop and remove:"
Write-Host "  docker stop metric-frontend-test metric-backend-test"
Write-Host "  docker rm metric-frontend-test metric-backend-test"
Write-Host ""
