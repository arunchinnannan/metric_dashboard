# PowerShell deployment script for Application Metrics Dashboard on AKS
# Usage: .\deploy.ps1 -Environment "dev" -RegistryUrl "your-registry.azurecr.io" -Tag "latest"

param(
    [string]$Environment = "dev",
    [string]$RegistryUrl = "your-registry.azurecr.io", 
    [string]$Tag = "latest"
)

$ProjectName = "kafka-dashboard"

Write-Host "🚀 Deploying Application Metrics Dashboard to AKS" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Registry: $RegistryUrl" -ForegroundColor Yellow
Write-Host "Tag: $Tag" -ForegroundColor Yellow

# Check if kubectl is available
try {
    kubectl version --client | Out-Null
} catch {
    Write-Host "❌ kubectl is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're connected to a cluster
try {
    kubectl cluster-info | Out-Null
} catch {
    Write-Host "❌ Not connected to a Kubernetes cluster" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Current cluster context:" -ForegroundColor Blue
kubectl config current-context

# Create namespace
Write-Host "`n📁 Creating namespace..." -ForegroundColor Green
kubectl apply -f k8s-namespace.yaml

# Apply ConfigMap and Secrets
Write-Host "`n⚙️ Applying configuration..." -ForegroundColor Green
kubectl apply -f k8s-configmap.yaml

# Update image references in deployment files
Write-Host "`n🔄 Updating image references..." -ForegroundColor Green
$backendContent = Get-Content k8s-backend-deployment.yaml
$backendContent = $backendContent -replace "your-registry/kafka-dashboard-backend:latest", "$RegistryUrl/$ProjectName-backend:$Tag"
$backendContent | Set-Content k8s-backend-deployment-temp.yaml

$frontendContent = Get-Content k8s-frontend-deployment.yaml
$frontendContent = $frontendContent -replace "your-registry/kafka-dashboard-frontend:latest", "$RegistryUrl/$ProjectName-frontend:$Tag"
$frontendContent | Set-Content k8s-frontend-deployment-temp.yaml

# Deploy backend
Write-Host "`n🔧 Deploying backend..." -ForegroundColor Green
kubectl apply -f k8s-backend-deployment-temp.yaml

# Deploy frontend
Write-Host "`n🎨 Deploying frontend..." -ForegroundColor Green
kubectl apply -f k8s-frontend-deployment-temp.yaml

# Deploy HPA
Write-Host "`n📈 Deploying auto-scaling..." -ForegroundColor Green
kubectl apply -f k8s-hpa.yaml

# Deploy ingress (optional)
$deployIngress = Read-Host "Do you want to deploy the ingress? (y/N)"
if ($deployIngress -eq "y" -or $deployIngress -eq "Y") {
    Write-Host "`n🌐 Deploying ingress..." -ForegroundColor Green
    kubectl apply -f k8s-ingress.yaml
}

# Clean up temp files
Remove-Item k8s-backend-deployment-temp.yaml -ErrorAction SilentlyContinue
Remove-Item k8s-frontend-deployment-temp.yaml -ErrorAction SilentlyContinue

# Wait for deployments to be ready
Write-Host "`n⏳ Waiting for deployments to be ready..." -ForegroundColor Green
kubectl wait --for=condition=available --timeout=300s deployment/kafka-dashboard-backend -n kafka-dashboard
kubectl wait --for=condition=available --timeout=300s deployment/kafka-dashboard-frontend -n kafka-dashboard

# Show deployment status
Write-Host "`n📊 Deployment status:" -ForegroundColor Green
kubectl get pods -n kafka-dashboard
kubectl get services -n kafka-dashboard

# Show access information
Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "`n🔗 Access information:" -ForegroundColor Blue
Write-Host "Frontend Service:" -ForegroundColor Yellow
kubectl get service kafka-dashboard-frontend -n kafka-dashboard

Write-Host "`nBackend Service:" -ForegroundColor Yellow
kubectl get service kafka-dashboard-backend -n kafka-dashboard

try {
    kubectl get ingress kafka-dashboard-ingress -n kafka-dashboard | Out-Null
    Write-Host "`nIngress:" -ForegroundColor Yellow
    kubectl get ingress kafka-dashboard-ingress -n kafka-dashboard
} catch {
    # Ingress not deployed
}

Write-Host "`n💡 To access the dashboard locally, run:" -ForegroundColor Blue
Write-Host "kubectl port-forward service/kafka-dashboard-frontend 8080:80 -n kafka-dashboard" -ForegroundColor Yellow
Write-Host "Then open: http://localhost:8080" -ForegroundColor Yellow