# 🚀 Metric Dashboard - Deployment Package

## What You Have

This is a **complete, tested, and ready-to-deploy** Kafka Metrics Dashboard application.

✅ **Tested and Working** - All components verified on November 7, 2025  
✅ **Offline Deployment** - No internet required on target Ubuntu server  
✅ **Database Connected** - Successfully connected to PostgreSQL and retrieved data  

---

## Quick Start (3 Steps)

### 1️⃣ Prepare (on Windows with internet)

```powershell
cd metric_dashboard
powershell -ExecutionPolicy Bypass -File deployment/prepare-with-wsl.ps1
```

**Output:** Creates Linux-compatible node_modules tarballs  
**Time:** ~2 minutes

### 2️⃣ Transfer (to Ubuntu)

Copy the entire `metric_dashboard` folder to your Ubuntu server.

### 3️⃣ Deploy (on Ubuntu - no internet needed)

```bash
cd metric_dashboard

# Build Docker images
docker build -f deployment/Dockerfile.frontend -t metric-dashboard-frontend:latest .
docker build -f deployment/Dockerfile.backend -t metric-dashboard-backend:latest .

# Update database credentials
nano deployment/docker-compose.yml

# Start application
docker-compose -f deployment/docker-compose.yml up -d
```

**Access:** http://your-server:8080

---

## Essential Files

```
metric_dashboard/
├── frontend/                    ← React application
│   ├── src/
│   ├── node_modules-linux.tar.gz (created by step 1)
│   └── config files
│
├── backend/                     ← Node.js API
│   ├── controllers/
│   ├── migrations/
│   ├── node_modules-linux.tar.gz (created by step 1)
│   └── server files
│
└── deployment/                  ← Docker configs
    ├── Dockerfile.frontend
    ├── Dockerfile.backend
    ├── docker-compose.yml
    ├── nginx.conf
    └── prepare-with-wsl.ps1
```

---

## Documentation

- **DEPLOYMENT-CHECKLIST.md** - Step-by-step deployment guide
- **deployment/QUICK-START.md** - Quick reference
- **deployment/README-DEPLOYMENT.md** - Detailed documentation
- **deployment/DEPLOYMENT-SUCCESS.md** - Test results

---

## What's in the Archive?

`deployment/archive/` contains:
- Test scripts used during development
- Alternative deployment methods (Kubernetes, etc.)
- Database setup scripts (not needed - you have DB)

**You can safely delete the archive folder.**

---

## Support

If you encounter issues:

1. Check `DEPLOYMENT-CHECKLIST.md` for troubleshooting
2. View logs: `docker logs metric-dashboard-backend`
3. Verify database connection in `docker-compose.yml`

---

## Application Info

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + PostgreSQL
- **Web Server:** Nginx
- **Ports:** 8080 (frontend), 5000 (backend)
- **Database:** PostgreSQL (your existing setup)

---

**Ready to deploy!** 🎉
