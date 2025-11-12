#!/bin/bash
# Script to extract Alpine Linux node_modules on Ubuntu machine

echo "Extracting frontend node_modules..."
cd frontend
tar -xzf node_modules-alpine.tar.gz
rm node_modules-alpine.tar.gz
cd ..

echo "Extracting backend node_modules..."
cd backend
tar -xzf node_modules-alpine.tar.gz
rm node_modules-alpine.tar.gz
cd ..

echo "Done! You can now build Docker images using the local node_modules."
