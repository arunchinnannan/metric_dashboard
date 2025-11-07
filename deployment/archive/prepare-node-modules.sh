#!/bin/bash
# Script to prepare npm packages for offline installation
# This script downloads packages to a cache that can be transferred

echo "📦 Downloading npm packages to cache..."
echo ""
echo "Choose method:"
echo "1. Using Docker (recommended - gets Alpine Linux compatible binaries)"
echo "2. Using Node.js directly (downloads to npm cache)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
  echo ""
  echo "Building Alpine Linux node_modules for frontend..."
  docker run --rm -v "$(pwd)/frontend:/app" -w /app node:18-alpine sh -c "npm ci && tar -czf node_modules-alpine.tar.gz node_modules"
  
  echo "Building Alpine Linux node_modules for backend..."
  docker run --rm -v "$(pwd)/backend:/app" -w /app node:18-alpine sh -c "npm ci --only=production && tar -czf node_modules-alpine.tar.gz node_modules"
  
  echo ""
  echo "✅ Done! Transfer these files to your Ubuntu machine:"
  echo "  - frontend/node_modules-alpine.tar.gz"
  echo "  - backend/node_modules-alpine.tar.gz"
  echo ""
  echo "On Ubuntu, run: bash deployment/extract-node-modules.sh"
  
elif [ "$choice" = "2" ]; then
  echo ""
  echo "Downloading packages using Node.js..."
  node deployment/download-packages.js
  
  echo ""
  echo "✅ Done! Transfer the 'deployment/npm-cache' folder to your Ubuntu machine."
  echo ""
  echo "Then update Dockerfiles to use:"
  echo "  COPY deployment/npm-cache /tmp/npm-cache"
  echo "  RUN npm ci --offline --cache /tmp/npm-cache"
else
  echo "Invalid choice"
  exit 1
fi
