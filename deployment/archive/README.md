# Application Metrics Dashboard - AKS Deployment

This directory contains all the necessary files to deploy the Application Metrics Dashboard to Azure Kubernetes Service (AKS).

## 📁 Files Overview

### Docker Files
- `Dockerfile.backend` - Multi-stage Docker build for Node.js backend
- `Dockerfile.frontend` - Multi-stage Docker build for React frontend with Nginx
- `nginx.conf` - Nginx configuration for frontend with API proxy
- `docker-compose.yml` - Local development with Docker Compose

### Kubernetes Manifests
- `k8s-namespace.yaml` - Kubernetes namespace
- `k8s-configmap.yaml` - Configuration and secrets
- `k8s-backend-deployment.yaml` - Backend deployment and service
- `k8s-frontend-deployment.yaml` - Frontend deployment and service
- `k8s-ingress.yaml` - Ingress configuration with SSL
- `k8s-hpa.yaml` - Horizontal Pod Autoscaler

### Scripts
- `build-and-push.sh` - Build and push Docker images
- `deploy.sh` - Deploy to AKS cluster

## 🚀 Quick Start

### Prerequisites
- Docker installed
- kubectl configured for your AKS cluster
- Azure Container Registry (ACR) access

### 1. Build and Push Images

```bash
# Make scripts executable
chmod +x build-and-push.sh deploy.sh

# Build and push to your registry
./build-and-push.sh your-registry.azurecr.io v1.0.0
```

### 2. Configure Environment

Edit `k8s-configmap.yaml` to update:
- Database connection details
- CORS origins
- Other environment-specific settings

Update the base64 encoded database password:
```bash
echo -n 'your-actual-password' | base64
```

### 3. Deploy to AKS

```bash
# Deploy to AKS
./deploy.sh prod your-registry.azurecr.io v1.0.0
```

### 4. Access the Dashboard

```bash
# Port forward for local access
kubectl port-forward service/kafka-dashboard-frontend 8080:80 -n kafka-dashboard

# Open in browser
open http://localhost:8080
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database hostname | - |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | kafka_metrics |
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `NODE_ENV` | Node environment | production |
| `PORT` | Backend port | 5000 |
| `CORS_ORIGIN` | Allowed CORS origins | - |

### Resource Limits

#### Backend
- **Requests**: 256Mi memory, 250m CPU
- **Limits**: 512Mi memory, 500m CPU
- **Replicas**: 2-10 (auto-scaling)

#### Frontend
- **Requests**: 128Mi memory, 100m CPU
- **Limits**: 256Mi memory, 200m CPU
- **Replicas**: 2-5 (auto-scaling)

## 🔒 Security Features

- Non-root containers
- Security headers in Nginx
- Resource limits and requests
- Health checks and probes
- Network policies ready
- SSL/TLS termination at ingress

## 📊 Monitoring

### Health Checks
- **Backend**: `GET /health`
- **Frontend**: `GET /health`

### Metrics
- CPU and memory utilization
- Request rate limiting
- Auto-scaling based on resource usage

## 🛠️ Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n kafka-dashboard
kubectl describe pod <pod-name> -n kafka-dashboard
```

### View Logs
```bash
kubectl logs -f deployment/kafka-dashboard-backend -n kafka-dashboard
kubectl logs -f deployment/kafka-dashboard-frontend -n kafka-dashboard
```

### Debug Network Issues
```bash
kubectl exec -it <backend-pod> -n kafka-dashboard -- wget -qO- http://localhost:5000/health
```

### Scale Manually
```bash
kubectl scale deployment kafka-dashboard-backend --replicas=3 -n kafka-dashboard
```

## 🔄 Updates

### Rolling Update
```bash
# Update image and deploy
./build-and-push.sh your-registry.azurecr.io v1.1.0
./deploy.sh prod your-registry.azurecr.io v1.1.0
```

### Rollback
```bash
kubectl rollout undo deployment/kafka-dashboard-backend -n kafka-dashboard
kubectl rollout undo deployment/kafka-dashboard-frontend -n kafka-dashboard
```

## 🧹 Cleanup

```bash
# Delete all resources
kubectl delete namespace kafka-dashboard
```

## 📝 Notes

- Update `kafka-dashboard.yourdomain.com` in ingress to your actual domain
- Configure cert-manager for automatic SSL certificates
- Adjust resource limits based on your workload
- Consider using Azure Key Vault for secrets management
- Enable Azure Monitor for comprehensive monitoring