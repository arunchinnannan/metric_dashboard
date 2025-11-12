# Metric Dashboard - Docker Deployment Guide

## ✅ Verified Working

Both Docker images have been successfully built and tested in Ubuntu/WSL environment.

## Files Needed for Client Ubuntu Environment

Transfer these files/folders to your Ubuntu machine:

```
metric_dashboard/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   ├── postcss.config.js
│   └── tailwind.config.js
├── backend/
│   ├── controllers/
│   ├── migrations/
│   ├── server.js
│   ├── database.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
└── deployment/
    ├── Dockerfile.frontend
    ├── Dockerfile.backend
    ├── nginx.conf
    └── docker-compose.yml (if you have one)
```

## Building Images on Ubuntu (With Internet Access)

If your Ubuntu machine has internet access:

```bash
cd metric_dashboard

# Build frontend image
docker build -f deployment/Dockerfile.frontend -t metric-dashboard-frontend:latest .

# Build backend image
docker build -f deployment/Dockerfile.backend -t metric-dashboard-backend:latest .
```

## ✅ Building Images on Ubuntu (Without Internet - Air-gapped) - VERIFIED WORKING

If your Ubuntu machine does NOT have internet access, follow these steps:

### Step 1: Prepare on Windows (with WSL and internet)

```powershell
# Navigate to the project directory
cd metric_dashboard

# Run the preparation script to create Linux-compatible node_modules
powershell -ExecutionPolicy Bypass -File deployment/prepare-with-wsl.ps1
```

This creates:
- `frontend/node_modules-linux.tar.gz` (~19 MB)
- `backend/node_modules-linux.tar.gz` (~800 KB)

### Step 2: Transfer to Ubuntu

Transfer the entire `metric_dashboard` folder (including the .tar.gz files) to your Ubuntu machine.

### Step 3: Build on Ubuntu (NO internet required)

The Dockerfiles are already configured for offline mode. Simply run:

```bash
cd metric_dashboard

# Build frontend image (takes ~2-3 minutes)
docker build -f deployment/Dockerfile.frontend -t metric-dashboard-frontend:latest .

# Build backend image (takes ~1-2 minutes)
docker build -f deployment/Dockerfile.backend -t metric-dashboard-backend:latest .
```

**That's it!** The tarballs will be extracted inside the Docker build process automatically.

### How it Works (Offline Mode)

The Dockerfiles are configured to:
1. Copy the `node_modules-linux.tar.gz` file into the image
2. Extract it using `tar -xzf` 
3. Remove the tarball to save space
4. Build the application

No internet connection is required during the Docker build!

## Running the Containers

### Prerequisites:
- PostgreSQL database running and accessible
- Update backend `.env` file with database credentials

### Start Backend:
```bash
docker run -d \
  --name metric-dashboard-backend \
  -p 5000:5000 \
  -e DATABASE_HOST=your-db-host \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=your-db-name \
  -e DATABASE_USER=your-db-user \
  -e DATABASE_PASSWORD=your-db-password \
  metric-dashboard-backend:latest
```

### Start Frontend:
```bash
docker run -d \
  --name metric-dashboard-frontend \
  -p 8080:8080 \
  metric-dashboard-frontend:latest
```

## Verification

Check if containers are running:
```bash
docker ps
```

Check logs:
```bash
docker logs metric-dashboard-backend
docker logs metric-dashboard-frontend
```

Access the application:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

## Troubleshooting

### Backend fails to start:
- Check database connection settings
- Verify PostgreSQL is accessible from the container
- Check logs: `docker logs metric-dashboard-backend`

### Frontend nginx error "upstream not found":
- Make sure backend container is running
- Update nginx.conf to point to correct backend host
- If using docker-compose, containers can reference each other by service name

### Build fails with "vite: not found":
- Make sure you're using the correct Dockerfile (with npm ci enabled)
- Or ensure node_modules are properly extracted from the tarball

## Clean Up

Stop and remove containers:
```bash
docker stop metric-dashboard-frontend metric-dashboard-backend
docker rm metric-dashboard-frontend metric-dashboard-backend
```

Remove images:
```bash
docker rmi metric-dashboard-frontend:latest metric-dashboard-backend:latest
```

## Notes

- Current Dockerfiles are configured for **online mode** (npm ci enabled)
- Switch to **offline mode** by uncommenting the COPY node_modules lines
- Frontend runs on port 8080 (not 3000) as configured in nginx
- Backend runs on port 5000
- Both containers run as non-root users for security
