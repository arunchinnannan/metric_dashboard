#!/bin/bash

# Deployment script for Application Metrics Dashboard on AKS
# Usage: ./deploy.sh <environment> <registry-url> <tag>

set -e

# Configuration
ENVIRONMENT=${1:-"dev"}
REGISTRY_URL=${2:-"your-registry.azurecr.io"}
TAG=${3:-"latest"}
PROJECT_NAME="kafka-dashboard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Application Metrics Dashboard to AKS${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Registry: ${REGISTRY_URL}${NC}"
echo -e "${YELLOW}Tag: ${TAG}${NC}"

# Navigate to deployment directory
cd "$(dirname "$0")"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if we're connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Not connected to a Kubernetes cluster${NC}"
    exit 1
fi

echo -e "\n${BLUE}📋 Current cluster context:${NC}"
kubectl config current-context

# Create namespace
echo -e "\n${GREEN}📁 Creating namespace...${NC}"
kubectl apply -f k8s-namespace.yaml

# Apply ConfigMap and Secrets
echo -e "\n${GREEN}⚙️  Applying configuration...${NC}"
kubectl apply -f k8s-configmap.yaml

# Update image references in deployment files
echo -e "\n${GREEN}🔄 Updating image references...${NC}"
sed -i.bak "s|your-registry/kafka-dashboard-backend:latest|${REGISTRY_URL}/${PROJECT_NAME}-backend:${TAG}|g" k8s-backend-deployment.yaml
sed -i.bak "s|your-registry/kafka-dashboard-frontend:latest|${REGISTRY_URL}/${PROJECT_NAME}-frontend:${TAG}|g" k8s-frontend-deployment.yaml

# Deploy backend
echo -e "\n${GREEN}🔧 Deploying backend...${NC}"
kubectl apply -f k8s-backend-deployment.yaml

# Deploy frontend
echo -e "\n${GREEN}🎨 Deploying frontend...${NC}"
kubectl apply -f k8s-frontend-deployment.yaml

# Deploy HPA
echo -e "\n${GREEN}📈 Deploying auto-scaling...${NC}"
kubectl apply -f k8s-hpa.yaml

# Deploy ingress (optional)
read -p "Do you want to deploy the ingress? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${GREEN}🌐 Deploying ingress...${NC}"
    kubectl apply -f k8s-ingress.yaml
fi

# Restore original deployment files
mv k8s-backend-deployment.yaml.bak k8s-backend-deployment.yaml
mv k8s-frontend-deployment.yaml.bak k8s-frontend-deployment.yaml

# Wait for deployments to be ready
echo -e "\n${GREEN}⏳ Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/kafka-dashboard-backend -n kafka-dashboard
kubectl wait --for=condition=available --timeout=300s deployment/kafka-dashboard-frontend -n kafka-dashboard

# Show deployment status
echo -e "\n${GREEN}📊 Deployment status:${NC}"
kubectl get pods -n kafka-dashboard
kubectl get services -n kafka-dashboard

# Show access information
echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "\n${BLUE}🔗 Access information:${NC}"
echo -e "${YELLOW}Frontend Service:${NC}"
kubectl get service kafka-dashboard-frontend -n kafka-dashboard

echo -e "\n${YELLOW}Backend Service:${NC}"
kubectl get service kafka-dashboard-backend -n kafka-dashboard

if kubectl get ingress kafka-dashboard-ingress -n kafka-dashboard &> /dev/null; then
    echo -e "\n${YELLOW}Ingress:${NC}"
    kubectl get ingress kafka-dashboard-ingress -n kafka-dashboard
fi

echo -e "\n${BLUE}💡 To access the dashboard locally, run:${NC}"
echo -e "${YELLOW}kubectl port-forward service/kafka-dashboard-frontend 8080:80 -n kafka-dashboard${NC}"
echo -e "${YELLOW}Then open: http://localhost:8080${NC}"