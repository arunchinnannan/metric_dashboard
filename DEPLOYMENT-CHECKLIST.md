# Deployment Checklist - Client Environment

## Essential Files Only

### Step 1: Prepare on Windows (with internet)
Run this command:
```powershell
cd metric_dashboard
powershell -ExecutionPolicy Bypass -File deployment/prepare-with-wsl.ps1
```

This creates:
- `frontend/node_modules-linux.tar.gz` (19 MB)
- `backend/node_modules-linux.tar.gz` (800 KB)

### Step 2: Files to Transfer to Ubuntu

Transfer ONLY these folders/files:

```
metric_dashboard/
├── frontend/
│   ├── src/                          ← Entire folder
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── node_modules-linux.tar.gz     ← Created by prepare script
│
├── backend/
│   ├── controllers/                  ← Entire folder
│   ├── migrations/                   ← Entire folder
│   ├── server.js
│   ├── database.js
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules-linux.tar.gz     ← Created by prepare script
│
├── deployment/
│   ├── Dockerfile.frontend           ← Build instructions
│   ├── Dockerfile.backend            ← Build instructions
│   ├── nginx.conf                    ← Web server config
│   ├── docker-compose.yml            ← Container orchestration
│   └── prepare-with-wsl.ps1          ← For future updates
│
├── .dockerignore                     ← Tells Docker what to ignore
└── DEPLOYMENT-CHECKLIST.md           ← This file
```

**Total size:** ~20 MB (mostly the tarballs)

### Step 3: On Ubuntu (no internet required)

```bash
cd metric_dashboard

# Build images
docker build -f deployment/Dockerfile.frontend -t metric-dashboard-frontend:latest .
docker build -f deployment/Dockerfile.backend -t metric-dashboard-backend:latest .

# Update database credentials in docker-compose.yml
nano deployment/docker-compose.yml
# Change DB_HOST, DB_NAME, DB_USER, DB_PASSWORD

# Start application
docker-compose -f deployment/docker-compose.yml up -d

# Verify
docker ps
docker logs metric-dashboard-backend
docker logs metric-dashboard-frontend
```

### Step 4: Access Application

- Frontend: http://your-server-ip:8080
- Backend API: http://your-server-ip:5000

## Quick Commands

```bash
# Stop containers
docker-compose -f deployment/docker-compose.yml down

# View logs
docker logs -f metric-dashboard-backend
docker logs -f metric-dashboard-frontend

# Restart
docker-compose -f deployment/docker-compose.yml restart

# Remove everything
docker-compose -f deployment/docker-compose.yml down
docker rmi metric-dashboard-frontend:latest metric-dashboard-backend:latest
```

## Documentation Files (Optional - for reference)

These are in `deployment/` folder but not required for deployment:
- `QUICK-START.md` - Quick reference guide
- `README-DEPLOYMENT.md` - Detailed documentation
- `DEPLOYMENT-SUCCESS.md` - Test results

## Archive Folder

Non-essential files have been moved to `deployment/archive/`:
- Test scripts
- Alternative build methods
- Database setup scripts (you already have DB)

You can delete the `archive` folder if you want.
