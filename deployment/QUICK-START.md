# Quick Start - Offline Deployment

## ✅ VERIFIED: Both images build and run successfully in offline mode!

## On Windows (Preparation)

```powershell
cd metric_dashboard
powershell -ExecutionPolicy Bypass -File deployment/prepare-with-wsl.ps1
```

**Output:**
- `frontend/node_modules-linux.tar.gz` (19 MB)
- `backend/node_modules-linux.tar.gz` (800 KB)

## Transfer to Ubuntu

Copy the entire `metric_dashboard` folder to your Ubuntu client machine.

## On Ubuntu (Build - NO Internet Required)

```bash
cd metric_dashboard

# Build images
docker build -f deployment/Dockerfile.frontend -t metric-dashboard-frontend:latest .
docker build -f deployment/Dockerfile.backend -t metric-dashboard-backend:latest .

# Verify images
docker images | grep metric-dashboard
```

## Run Containers

```bash
# Start backend (update DB credentials as needed)
docker run -d \
  --name metric-dashboard-backend \
  -p 5000:5000 \
  -e DATABASE_HOST=your-db-host \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=your-db \
  -e DATABASE_USER=your-user \
  -e DATABASE_PASSWORD=your-password \
  metric-dashboard-backend:latest

# Start frontend
docker run -d \
  --name metric-dashboard-frontend \
  -p 8080:8080 \
  metric-dashboard-frontend:latest

# Check status
docker ps
docker logs metric-dashboard-backend
docker logs metric-dashboard-frontend
```

## Access

- Frontend: http://your-ubuntu-ip:8080
- Backend API: http://your-ubuntu-ip:5000

## Troubleshooting

**Build fails with "tarball not found":**
- Make sure you transferred the `.tar.gz` files
- Check they're in `frontend/` and `backend/` directories

**Backend fails to start:**
- Check database connection settings
- Verify PostgreSQL is accessible

**Frontend nginx error:**
- Update `deployment/nginx.conf` with correct backend URL
- Or use docker-compose to link containers

## Files to Transfer

Minimum required files:
```
metric_dashboard/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── node_modules-linux.tar.gz  ← IMPORTANT
├── backend/
│   ├── controllers/
│   ├── migrations/
│   ├── server.js
│   ├── database.js
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules-linux.tar.gz  ← IMPORTANT
└── deployment/
    ├── Dockerfile.frontend
    ├── Dockerfile.backend
    └── nginx.conf
```
