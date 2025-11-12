# Rebuild Images for AKS Deployment

## What Changed

The frontend has been updated to work with the base path `/app-metrics-dashboard/` to match your existing ingress setup.

**Updated file:**
- `frontend/vite.config.js` - Added `base: '/app-metrics-dashboard/'`

---

## Rebuild Steps

### 1. Prepare Node Modules (if not already done)

```powershell
cd metric_dashboard
powershell -ExecutionPolicy Bypass -File deployment/prepare-with-wsl.ps1
```

This creates:
- `frontend/node_modules-linux.tar.gz`
- `backend/node_modules-linux.tar.gz`

### 2. Build Docker Images

```bash
cd metric_dashboard

# Build frontend with new base path
docker build -f deployment/Dockerfile.frontend -t app-metrics-dashboard-frontend:latest .

# Build backend (no changes needed, but rebuild for consistency)
docker build -f deployment/Dockerfile.backend -t app-metrics-dashboard-backend:latest .
```

### 3. Tag for ACR

```bash
# Set your ACR name
ACR_NAME="your-acr-name"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"

# Tag images
docker tag app-metrics-dashboard-frontend:latest ${ACR_LOGIN_SERVER}/app-metrics-dashboard-frontend:latest
docker tag app-metrics-dashboard-backend:latest ${ACR_LOGIN_SERVER}/app-metrics-dashboard-backend:latest
```

### 4. Push to ACR

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Push images
docker push ${ACR_LOGIN_SERVER}/app-metrics-dashboard-frontend:latest
docker push ${ACR_LOGIN_SERVER}/app-metrics-dashboard-backend:latest
```

---

## What This Fixes

### Before (wouldn't work):
- Frontend built with base path `/`
- Ingress serves at `/app-metrics-dashboard/`
- Assets fail to load (404 errors)

### After (works correctly):
- Frontend built with base path `/app-metrics-dashboard/`
- Ingress serves at `/app-metrics-dashboard/`
- All assets load correctly ✅

---

## Access URLs After Deployment

**Frontend:**
```
https://utils-labur-prod.az.agc.att.com/app-metrics-dashboard
```

**Backend API:**
```
https://utils-labur-prod.az.agc.att.com/app-metrics-dashboard/api/filters
```

**Prometheus (existing):**
```
https://utils-labur-prod.az.agc.att.com/prometheus
```

---

## Quick Commands

```bash
# Full rebuild and push
ACR_NAME="your-acr-name"
cd metric_dashboard

# Build
docker build -f deployment/Dockerfile.frontend -t ${ACR_NAME}.azurecr.io/app-metrics-dashboard-frontend:latest .
docker build -f deployment/Dockerfile.backend -t ${ACR_NAME}.azurecr.io/app-metrics-dashboard-backend:latest .

# Push
az acr login --name $ACR_NAME
docker push ${ACR_NAME}.azurecr.io/app-metrics-dashboard-frontend:latest
docker push ${ACR_NAME}.azurecr.io/app-metrics-dashboard-backend:latest
```

---

## Deploy to AKS

After pushing images:

```bash
cd deployment/aks
kubectl apply -f .
```

Or use the deployment script:

```bash
cd deployment/aks
./deploy-to-aks.sh
```

---

## Verify Deployment

```bash
# Check pods
kubectl get pods -n app-metrics-dashboard

# Check ingress
kubectl get ingress -n app-metrics-dashboard

# View logs
kubectl logs -n app-metrics-dashboard -l component=frontend --tail=50
kubectl logs -n app-metrics-dashboard -l component=backend --tail=50
```

---

## Rollback (if needed)

If you need to rollback:

```bash
# Rollback deployment
kubectl rollout undo deployment/app-metrics-dashboard-frontend -n app-metrics-dashboard

# Or delete and redeploy
kubectl delete -f deployment/aks/
kubectl apply -f deployment/aks/
```

---

## Notes

- **Backend doesn't need changes** - It's API-only and doesn't care about base paths
- **Only frontend needs rebuild** - Due to the base path change
- **Node modules tarballs** - Can be reused if already created
- **Build time** - ~2-3 minutes per image (offline mode)
