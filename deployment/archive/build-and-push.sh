#!/bin/bash

# Build and push script for Application Metrics Dashboard
# Usage: ./build-and-push.sh <registry-url> <tag>

set -e

# Configuration
REGISTRY_URL=${1:-"your-registry.azurecr.io"}
TAG=${2:-"latest"}
PROJECT_NAME="kafka-dashboard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building and pushing Application Metrics Dashboard images${NC}"
echo -e "${YELLOW}Registry: ${REGISTRY_URL}${NC}"
echo -e "${YELLOW}Tag: ${TAG}${NC}"

# Navigate to project root
cd "$(dirname "$0")/.."

# Build backend image
echo -e "\n${GREEN}📦 Building backend image...${NC}"
docker build -f deployment/Dockerfile.backend -t ${REGISTRY_URL}/${PROJECT_NAME}-backend:${TAG} .

# Build frontend image
echo -e "\n${GREEN}📦 Building frontend image...${NC}"
docker build -f deployment/Dockerfile.frontend -t ${REGISTRY_URL}/${PROJECT_NAME}-frontend:${TAG} .

# Push images
echo -e "\n${GREEN}🚀 Pushing images to registry...${NC}"
docker push ${REGISTRY_URL}/${PROJECT_NAME}-backend:${TAG}
docker push ${REGISTRY_URL}/${PROJECT_NAME}-frontend:${TAG}

# Tag as latest if not already latest
if [ "$TAG" != "latest" ]; then
    echo -e "\n${GREEN}🏷️  Tagging as latest...${NC}"
    docker tag ${REGISTRY_URL}/${PROJECT_NAME}-backend:${TAG} ${REGISTRY_URL}/${PROJECT_NAME}-backend:latest
    docker tag ${REGISTRY_URL}/${PROJECT_NAME}-frontend:${TAG} ${REGISTRY_URL}/${PROJECT_NAME}-frontend:latest
    
    docker push ${REGISTRY_URL}/${PROJECT_NAME}-backend:latest
    docker push ${REGISTRY_URL}/${PROJECT_NAME}-frontend:latest
fi

echo -e "\n${GREEN}✅ Build and push completed successfully!${NC}"
echo -e "${YELLOW}Backend image: ${REGISTRY_URL}/${PROJECT_NAME}-backend:${TAG}${NC}"
echo -e "${YELLOW}Frontend image: ${REGISTRY_URL}/${PROJECT_NAME}-frontend:${TAG}${NC}"