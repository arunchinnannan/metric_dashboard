#!/bin/bash
# Quick deployment script for AKS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Metric Dashboard - AKS Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Not connected to Kubernetes cluster${NC}"
    exit 1
fi

echo -e "${GREEN}✓ kubectl is configured${NC}"
echo ""

# Get current context
CONTEXT=$(kubectl config current-context)
echo -e "${YELLOW}Current context: ${CONTEXT}${NC}"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo -e "${GREEN}Deploying to AKS...${NC}"
echo ""

# Deploy manifests
# echo "1. Creating namespace..."
# kubectl apply -f 01-namespace.yaml

echo "2. Creating ConfigMap and Secrets..."
kubectl apply -f 02-configmap-secret.yaml

echo "3. Deploying backend..."
kubectl apply -f 03-backend-deployment.yaml

echo "4. Deploying frontend..."
kubectl apply -f 04-frontend-deployment.yaml

echo "5. Creating ingress..."
kubectl apply -f 05-ingress.yaml

# echo "6. Configuring auto-scaling..."
# kubectl apply -f 06-hpa.yaml

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Wait for pods
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=app-metrics-dashboard -n monitoring --timeout=300s

echo ""
echo -e "${GREEN}✓ All pods are ready${NC}"
echo ""

# Show status
echo "Deployment Status:"
echo ""
kubectl get pods -n monitoring
echo ""
kubectl get svc -n monitoring
echo ""
kubectl get ingress -n monitoring
echo ""

# Get access information
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Access Information${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

INGRESS_IP=$(kubectl get ingress app-metrics-dashboard-ingress -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending...")
# LB_IP=$(kubectl get svc app-metrics-dashboard-loadbalancer -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Not configured")

echo "Ingress IP: ${INGRESS_IP}"
# echo "LoadBalancer IP: ${LB_IP}"
echo ""

if [ "$INGRESS_IP" != "Pending..." ]; then
    echo -e "${GREEN}Application is accessible at: http://${INGRESS_IP}${NC}"
fi

echo ""
echo "To view logs:"
echo "  kubectl logs -n monitoring -l component=backend --tail=50"
echo "  kubectl logs -n monitoring -l component=frontend --tail=50"
echo ""
echo "To port-forward (for testing):"
echo "  kubectl port-forward -n monitoring svc/frontend 8080:80"
echo ""
