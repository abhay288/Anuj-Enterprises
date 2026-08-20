# PRODUCTION BASELINE SPECIFICATION
**Project Title:** Anuj Enterprises B2B E-Commerce & Salesman Management Platform  
**Developer Agency:** Qyvero Technologies  
**Client Organization:** Anuj Enterprises  
**Production Release Version:** `v1.0.0`  
**Official Launch Date:** August 14, 2026  
**Agreed Maintenance Term:** August 14, 2026 – February 14, 2027  

---

## 💻 Environment & Infrastructure Specifications

| Component | Technical Specification / Version |
|---|---|
| **Frontend Framework** | React v18.3.1 (Vite v5.4.11) |
| **Backend Framework** | Express v4.21.1 (TypeScript v5.6.3, Node.js v22.x) |
| **Database System** | MongoDB Atlas (Cluster: `anujenterprises.nix5vcy.mongodb.net`, Database: `anuj_enterprises`) |
| **ODM / Query Layer** | Mongoose v8.8.2 |
| **Authentication System**| JSON Web Tokens (JWT) with 256-bit Secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`) |
| **Security Suite** | Helmet v8.0.0, Express Rate Limit v7.4.1, CORS v2.8.5, Image MIME Validator |
| **Styling & Icons** | Vanilla CSS3, TailwindCSS v3.4.15, Lucide React Icons v0.460.0 |
| **State Management** | Context API (`AppContext.jsx`) with live REST API sync |
| **PWA Configuration** | Web App Manifest, Service Worker ready, Standalone mode |
| **Build Tools** | Vite (`npm run build`), TypeScript Compiler (`npx tsc`), Concurrently (`v9.1.2`) |

---

## 🌐 Production URLs & Endpoints

- **Web Application URL:** `http://localhost:5173` (or client domain)
- **REST API Base URL:** `http://localhost:5000/api/v1`
- **Health Check Endpoint:** `http://localhost:5000/api/v1/health`

---

## 🔑 Key Pre-Seeded Production Accounts

- **Super Admin:** `admin@anujenterprises.demo` (Role: `admin`)
- **Lead Sales Rep:** `AE-SM-001` (Role: `salesman`, Salesman ID: `AE-SM-001`)
- **Field Sales Rep:** `SLS-101` (Role: `salesman`, Salesman ID: `SLS-101`)

---

## 🔒 Security Baseline
- Separation of environment secrets in `.env` and `server/.env`.
- Mandatory passwords hashed via `bcryptjs` (salt rounds: 10).
- Automatic database health check monitoring without credential leaks.
- Image uploads capped at 5MB with strict MIME-type validation.
