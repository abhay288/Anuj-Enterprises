# FINAL DEPLOYMENT GUIDE — ANUJ ENTERPRISES B2B PLATFORM
**Developer Agency:** Qyvero Technologies  
**Target Environment:** Production Node.js + Vite + MongoDB Atlas  

---

## 🏗️ 1. Environment Setup & Configuration

### Prerequisites
- Node.js v20.x or v22.x LTS
- npm v10.x+
- MongoDB Atlas Cluster URI

### Environment Secrets Configuration
1. **Frontend Environment (`.env`)**:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   VITE_COMPANY_NAME=Anuj Enterprises
   VITE_COMPANY_PHONE=+91 88876 83782 / +91 70719 79894
   VITE_COMPANY_EMAIL=anujenterprises.fmcg.006@gmail.com
   ```

2. **Backend Environment (`server/.env`)**:
   ```env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://anujenterprisesfmcg006_db_user:<password>@anujenterprises.nix5vcy.mongodb.net/anuj_enterprises?retryWrites=true&w=all
   JWT_SECRET=d696760c179af2e3b8929acc37c740640a3cbcd9d2b270d608fe859fb94dc6b0
   JWT_REFRESH_SECRET=7f8b9e4a2c1d0e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f
   CLIENT_URL=http://localhost:5173
   RESEND_API_KEY=re_your_resend_api_key_here
   ```

---

## 🚀 2. Deployment Instructions

### Backend API Build & Launch
```powershell
cd server
npm install
npm run build
npm start
```

### Production Database Seed (If Fresh Deployment)
```powershell
cd server
npm run seed:prod
```

### Frontend Web Application Build
```powershell
cd ..
npm install
npm run build
```

---

## 🔍 3. Post-Deployment Verification & Health Check

Execute the following HTTP request to verify live server status:
```bash
curl -X GET http://localhost:5000/api/v1/health
```
**Expected Response:**
```json
{
  "success": true,
  "status": "UP",
  "data": {
    "app": "Anuj Enterprises REST API",
    "environment": "production",
    "database": "CONNECTED",
    "timestamp": "2026-08-14T00:10:00.000Z"
  }
}
```

---

## 🔄 4. Process Management & Rollback Protocol
- **Process Manager:** Use PM2 or systemd to run backend Node services in daemon mode (`pm2 start dist/index.js --name "anuj-backend"`).
- **Rollback Strategy:** To revert a deployment, checkout the previous stable Git tag (`git checkout v1.0.0`), re-build bundles (`npm run build`), and restart the process manager.
