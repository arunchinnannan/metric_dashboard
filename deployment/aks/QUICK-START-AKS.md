# Quick Start - AKS Deployment

## Prerequisites

- ✅ Azure Container Registry (ACR)
- ✅ AKS Cluster running
- ✅ kubectl configured
- ✅ Docker images built (from offline deployment)

---

## 3-Step Deployment

### 1️⃣ Push Images to ACR

```bash
# Set variables
ACR_NAME="your-acr-name"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"

# Login
az acr login --name $ACR_NAME

# Tag and push
docker tag metric-dashboard-frontend:latest ${ACR_LOGIN_SERVER}/metric-dashboard-frontend:latest
docker tag metric-dashboard-backend:latest ${ACR_LOGIN_SERVER}/metric-dashboard-backend:latest
docker push ${ACR_LOGIN_SERVER}/metric-dashboard-frontend:latest
docker push ${ACR_LOGIN_SERVER}/metric-dashboard-backend:latest
```

### 2️⃣ Update Configuration

Edit `02-configmap-secret.yaml`:
```yaml
data:
  DB_HOST: "your-postgres.database.azure.com"
  DB_NAME: "kafka_metrics"
  DB_USER: "kafka_user"
stringData:
  DB_PASSWORD: "your-password"
```

Edit `03-backend-deployment.yaml` and `04-frontend-deployment.yaml`:
```yaml
image: your-acr-name.azurecr.io/metric-dashboard-backend:latest
image: your-acr-name.azurecr.io/metric-dashboard-frontend:latest
```

### 3️⃣ Deploy

**Option A: Using Script**
```bash
cd deployment/aks
chmod +x deploy-to-aks.sh
./deploy-to-aks.sh
```

**Option B: Manual**
```bash
cd deployment/aks
kubectl apply -f .
```

---

## Verify

```bash
# Check pods
kubectl get pods -n metric-dashboard

# Check services
kubectl get svc -n metric-dashboard

# Get access URL
kubectl get ingress -n metric-dashboard
```

---

## Access

**Via Ingress:**
```
http://<INGRESS-IP>
```

**Via Port Forward (testing):**
```bash
kubectl port-forward -n metric-dashboard svc/frontend 8080:80
# Access: http://localhost:8080
```

---

## Troubleshoot

```bash
# View logs
kubectl logs -n metric-dashboard -l component=backend --tail=50
kubectl logs -n metric-dashboard -l component=frontend --tail=50

# Describe pod
kubectl describe pod -n metric-dashboard <pod-name>

# Check events
kubectl get events -n metric-dashboard --sort-by='.lastTimestamp'
```

---

## Files Included

```
aks/
├── 01-namespace.yaml              ← Namespace
├── 02-configmap-secret.yaml       ← Configuration & secrets
├── 03-backend-deployment.yaml     ← Backend deployment & service
├── 04-frontend-deployment.yaml    ← Frontend deployment & service
├── 05-ingress.yaml                ← Ingress & LoadBalancer
├── 06-hpa.yaml                    ← Auto-scaling
├── deploy-to-aks.sh               ← Deployment script (Linux/Mac)
├── deploy-to-aks.ps1              ← Deployment script (Windows)
├── QUICK-START-AKS.md             ← This file
└── README-AKS-DEPLOYMENT.md       ← Detailed guide
```

---

## Next Steps

1. Configure DNS for your ingress IP
2. Set up SSL/TLS certificates
3. Configure monitoring and alerts
4. Set up backup strategy

See `README-AKS-DEPLOYMENT.md` for detailed instructions.
