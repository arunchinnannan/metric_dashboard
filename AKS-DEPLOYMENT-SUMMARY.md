# AKS Deployment - Summary

## ✅ Kubernetes Manifests Created

All AKS deployment files are in: `deployment/aks/`

### Manifest Files:

1. **01-namespace.yaml** - Creates `metric-dashboard` namespace
2. **02-configmap-secret.yaml** - Database config and secrets
3. **03-backend-deployment.yaml** - Backend deployment (2 replicas) + Service
4. **04-frontend-deployment.yaml** - Frontend deployment (2 replicas) + Service
5. **05-ingress.yaml** - Ingress controller + LoadBalancer option
6. **06-hpa.yaml** - Horizontal Pod Autoscaler (2-10 replicas)

### Deployment Scripts:

- **deploy-to-aks.sh** - Automated deployment (Linux/Mac)
- **deploy-to-aks.ps1** - Automated deployment (Windows)

### Documentation:

- **QUICK-START-AKS.md** - Quick 3-step deployment guide
- **README-AKS-DEPLOYMENT.md** - Comprehensive deployment guide

---

## Deployment Architecture

```
                    ┌─────────────────┐
                    │   Azure Load    │
                    │    Balancer     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Ingress     │
                    │   Controller    │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌───────▼────────┐
        │   Frontend     │       │    Backend     │
        │   Service      │       │    Service     │
        │   (Port 80)    │       │   (Port 5000)  │
        └───────┬────────┘       └───────┬────────┘
                │                         │
        ┌───────▼────────┐       ┌───────▼────────┐
        │  Frontend Pods │       │  Backend Pods  │
        │   (2-10 pods)  │       │   (2-10 pods)  │
        │   nginx:alpine │       │   node:alpine  │
        └────────────────┘       └───────┬────────┘
                                          │
                                 ┌────────▼────────┐
                                 │   PostgreSQL    │
                                 │   (Azure DB)    │
                                 └─────────────────┘
```

---

## Key Features

### High Availability
- ✅ 2 replicas minimum for both frontend and backend
- ✅ Pod anti-affinity for distribution across nodes
- ✅ Health checks (liveness & readiness probes)

### Auto-Scaling
- ✅ HPA configured for CPU (70%) and Memory (80%)
- ✅ Scales from 2 to 10 pods based on load
- ✅ Gradual scale-down to prevent flapping

### Security
- ✅ Non-root containers
- ✅ Secrets for sensitive data
- ✅ Security context with dropped capabilities
- ✅ Network policies ready

### Resource Management
- ✅ Resource requests and limits defined
- ✅ Optimized for cost and performance

---

## Quick Deployment Steps

### 1. Build & Push to ACR

```bash
ACR_NAME="your-acr"
az acr login --name $ACR_NAME

docker tag metric-dashboard-frontend:latest ${ACR_NAME}.azurecr.io/metric-dashboard-frontend:latest
docker tag metric-dashboard-backend:latest ${ACR_NAME}.azurecr.io/metric-dashboard-backend:latest

docker push ${ACR_NAME}.azurecr.io/metric-dashboard-frontend:latest
docker push ${ACR_NAME}.azurecr.io/metric-dashboard-backend:latest
```

### 2. Update Configuration

Edit `deployment/aks/02-configmap-secret.yaml`:
- Database host, name, user, password

Edit image names in:
- `deployment/aks/03-backend-deployment.yaml`
- `deployment/aks/04-frontend-deployment.yaml`

### 3. Deploy

```bash
cd deployment/aks
kubectl apply -f .
```

### 4. Verify

```bash
kubectl get pods -n metric-dashboard
kubectl get svc -n metric-dashboard
kubectl get ingress -n metric-dashboard
```

---

## Access Methods

### Production (Ingress)
```
http://metric-dashboard.yourdomain.com
```

### Testing (LoadBalancer)
```bash
kubectl get svc metric-dashboard-loadbalancer -n metric-dashboard
# Access via EXTERNAL-IP
```

### Local Testing (Port Forward)
```bash
kubectl port-forward -n metric-dashboard svc/frontend 8080:80
# Access: http://localhost:8080
```

---

## Monitoring & Troubleshooting

### View Logs
```bash
# Backend
kubectl logs -n metric-dashboard -l component=backend --tail=50 -f

# Frontend
kubectl logs -n metric-dashboard -l component=frontend --tail=50 -f
```

### Check Status
```bash
# All resources
kubectl get all -n metric-dashboard

# Events
kubectl get events -n metric-dashboard --sort-by='.lastTimestamp'

# HPA status
kubectl get hpa -n metric-dashboard
```

### Debug Pod
```bash
kubectl exec -it -n metric-dashboard <pod-name> -- sh
```

---

## Scaling

### Manual
```bash
kubectl scale deployment metric-dashboard-backend -n metric-dashboard --replicas=5
```

### Auto (Already Configured)
- Automatically scales based on CPU/Memory
- Min: 2 pods, Max: 10 pods

---

## Updates

### Rolling Update
```bash
# Update image
kubectl set image deployment/metric-dashboard-backend \
  backend=${ACR_NAME}.azurecr.io/metric-dashboard-backend:v2 \
  -n metric-dashboard

# Watch rollout
kubectl rollout status deployment/metric-dashboard-backend -n metric-dashboard
```

### Rollback
```bash
kubectl rollout undo deployment/metric-dashboard-backend -n metric-dashboard
```

---

## Cost Optimization

- Start with 2 replicas
- Let HPA scale based on actual load
- Use Azure Reserved Instances for AKS nodes
- Consider spot instances for non-critical workloads

---

## Production Checklist

- [ ] ACR images pushed
- [ ] Database credentials configured
- [ ] Ingress hostname configured
- [ ] SSL/TLS certificates configured
- [ ] Monitoring set up (Azure Monitor)
- [ ] Logging configured (Log Analytics)
- [ ] Backup strategy in place
- [ ] Network policies configured
- [ ] Resource quotas set
- [ ] DNS records created

---

## Support Files

All files are in `deployment/aks/`:
- Manifest files (01-06)
- Deployment scripts
- Documentation

For detailed instructions, see:
- `deployment/aks/QUICK-START-AKS.md`
- `deployment/aks/README-AKS-DEPLOYMENT.md`

---

**Ready to deploy to AKS!** 🚀
