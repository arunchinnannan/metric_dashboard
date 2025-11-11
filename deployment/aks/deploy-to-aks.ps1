# Quick deployment script for AKS (PowerShell)

Write-Host "========================================" -ForegroundColor Green
Write-Host "Metric Dashboard - AKS Deployment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if kubectl is available
try {
    kubectl version --client | Out-Null
    Write-Host "✓ kubectl is configured" -ForegroundColor Green
} catch {
    Write-Host "Error: kubectl is not installed" -ForegroundColor Red
    exit 1
}

# Check if connected to cluster
try {
    kubectl cluster-info | Out-Null
    Write-Host "✓ Connected to Kubernetes cluster" -ForegroundColor Green
} catch {
    Write-Host "Error: Not connected to Kubernetes cluster" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Get current context
$context = kubectl config current-context
Write-Host "Current context: $context" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Continue with deployment? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Deployment cancelled"
    exit 0
}

Write-Host ""
Write-Host "Deploying to AKS..." -ForegroundColor Green
Write-Host ""

# Deploy manifests
Write-Host "1. Creating namespace..."
kubectl apply -f 01-namespace.yaml

Write-Host "2. Creating ConfigMap and Secrets..."
kubectl apply -f 02-configmap-secret.yaml

Write-Host "3. Deploying backend..."
kubectl apply -f 03-backend-deployment.yaml

Write-Host "4. Deploying frontend..."
kubectl apply -f 04-frontend-deployment.yaml

Write-Host "5. Creating ingress..."
kubectl apply -f 05-ingress.yaml

Write-Host "6. Configuring auto-scaling..."
kubectl apply -f 06-hpa.yaml

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Wait for pods
Write-Host "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=app-metrics-dashboard -n monitoring --timeout=300s

Write-Host ""
Write-Host "✓ All pods are ready" -ForegroundColor Green
Write-Host ""

# Show status
Write-Host "Deployment Status:" -ForegroundColor Cyan
Write-Host ""
kubectl get pods -n monitoring
Write-Host ""
kubectl get svc -n monitoring
Write-Host ""
kubectl get ingress -n monitoring
Write-Host ""

# Get access information
Write-Host "========================================" -ForegroundColor Green
Write-Host "Access Information" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ingressIp = kubectl get ingress app-metrics-dashboard-ingress -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
if ([string]::IsNullOrEmpty($ingressIp)) {
    $ingressIp = "Pending..."
}

$lbIp = kubectl get svc app-metrics-dashboard-loadbalancer -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
if ([string]::IsNullOrEmpty($lbIp)) {
    $lbIp = "Not configured"
}

Write-Host "Ingress IP: $ingressIp"
Write-Host "LoadBalancer IP: $lbIp"
Write-Host ""

if ($ingressIp -ne "Pending...") {
    Write-Host "Application is accessible at: http://$ingressIp" -ForegroundColor Green
}

Write-Host ""
Write-Host "To view logs:"
Write-Host "  kubectl logs -n monitoring -l component=backend --tail=50"
Write-Host "  kubectl logs -n monitoring -l component=frontend --tail=50"
Write-Host ""
Write-Host "To port-forward (for testing):"
Write-Host "  kubectl port-forward -n monitoring svc/frontend 8080:80"
Write-Host ""
