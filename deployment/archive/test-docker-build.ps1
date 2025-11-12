# Script to test Docker builds locally before deploying to client environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Build Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Docker daemon is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not accessible!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if node_modules tarballs exist
Write-Host "Checking node_modules tarballs..." -ForegroundColor Yellow
$frontendTarball = "metric_dashboard/frontend/node_modules-linux.tar.gz"
$backendTarball = "metric_dashboard/backend/node_modules-linux.tar.gz"

if (!(Test-Path $frontendTarball)) {
    Write-Host "✗ Frontend tarball not found: $frontendTarball" -ForegroundColor Red
    Write-Host "Run prepare-with-wsl.ps1 first!" -ForegroundColor Yellow
    exit 1
}
if (!(Test-Path $backendTarball)) {
    Write-Host "✗ Backend tarball not found: $backendTarball" -ForegroundColor Red
    Write-Host "Run prepare-with-wsl.ps1 first!" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Both tarballs found" -ForegroundColor Green
Write-Host ""

# Extract node_modules using WSL (to preserve symlinks)
Write-Host "Extracting node_modules using WSL..." -ForegroundColor Yellow
$currentDir = (Get-Location).Path
$wslPath = $currentDir -replace '\\', '/' -replace '^([A-Z]):', '/mnt/$1' 
$wslPath = $wslPath.ToLower()

Write-Host "  Extracting frontend..." -ForegroundColor Gray
wsl bash -c "cd $wslPath/metric_dashboard/frontend ; tar -xzf node_modules-linux.tar.gz"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Frontend extracted" -ForegroundColor Green
} else {
    Write-Host "  ✗ Frontend extraction failed" -ForegroundColor Red
    exit 1
}

Write-Host "  Extracting backend..." -ForegroundColor Gray
wsl bash -c "cd $wslPath/metric_dashboard/backend ; tar -xzf node_modules-linux.tar.gz"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Backend extracted" -ForegroundColor Green
} else {
    Write-Host "  ✗ Backend extraction failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Build frontend image
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Frontend Docker Image" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker build -f metric_dashboard/deployment/Dockerfile.frontend -t metric-dashboard-frontend:test .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend image built successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Build backend image
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Backend Docker Image" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker build -f metric_dashboard/deployment/Dockerfile.backend -t metric-dashboard-backend:test .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend image built successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test run containers
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Containers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting backend container..." -ForegroundColor Yellow
docker run -d --name metric-backend-test -p 5000:5000 metric-dashboard-backend:test
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend container started" -ForegroundColor Green
    Start-Sleep -Seconds 3
    
    # Check if backend is responding
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Backend health check passed!" -ForegroundColor Green
        } else {
            Write-Host "⚠ Backend responded but health check returned: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Backend health check failed (this may be expected if /health endpoint doesn't exist)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Backend container failed to start" -ForegroundColor Red
}
Write-Host ""

Write-Host "Starting frontend container..." -ForegroundColor Yellow
docker run -d --name metric-frontend-test -p 8080:8080 metric-dashboard-frontend:test
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend container started" -ForegroundColor Green
    Start-Sleep -Seconds 3
    
    # Check if frontend is responding
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Frontend is accessible!" -ForegroundColor Green
        } else {
            Write-Host "⚠ Frontend responded with: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Frontend check failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Frontend container failed to start" -ForegroundColor Red
}
Write-Host ""

# Show container logs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Container Logs (last 10 lines)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend logs:" -ForegroundColor Yellow
docker logs --tail 10 metric-backend-test
Write-Host ""
Write-Host "Frontend logs:" -ForegroundColor Yellow
docker logs --tail 10 metric-frontend-test
Write-Host ""

# Cleanup prompt
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Containers are running:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "  - Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop and remove test containers, run:" -ForegroundColor Yellow
Write-Host "  docker stop metric-frontend-test metric-backend-test" -ForegroundColor Gray
Write-Host "  docker rm metric-frontend-test metric-backend-test" -ForegroundColor Gray
Write-Host ""
Write-Host "To save images for transfer:" -ForegroundColor Yellow
Write-Host "  docker save metric-dashboard-frontend:test | gzip > frontend-image.tar.gz" -ForegroundColor Gray
Write-Host "  docker save metric-dashboard-backend:test | gzip > backend-image.tar.gz" -ForegroundColor Gray
Write-Host ""
