# PROJECT FINAL DOCUMENTATION — ANUJ ENTERPRISES B2B PLATFORM
**Developer Agency:** Qyvero Technologies  
**Client Organization:** Anuj Enterprises  
**Agreed Project Development Fee:** ₹30,000  
**Completion Date:** August 14, 2026  

---

## 🎯 1. Project Overview

The **Anuj Enterprises B2B E-Commerce & Salesman Management Platform** is a full-stack, enterprise-grade wholesale distribution system designed to power FMCG supply chains.

### System Capabilities
- **Branded E-Commerce Web Portal:** FMCG product catalogue, brand/category filters, real-time search, master pack/bundle/case specifications, and volume pricing.
- **Sales Representative Ordering Hub:** Quick & Full customer registration modes, customer classifications (`NORMAL CUSTOMER`, `DAMAGE CUSTOMER`, `EXPIRY CUSTOMER`), direct pack quantity entry, offline checkout, and salesman purchase history.
- **Sales Invoice Engine:** Printable and downloadable B2B Sales Invoice documents (`AE-2026-XXXXXX`) featuring corporate branding, corporate seal, and authorized signatory.
- **Admin Command Center:** Real-time KPI analytics, product CRUD, sales roster management, order status pipeline (`NEW` ➔ `CONFIRMED` ➔ `READY_FOR_COLLECTION` ➔ `COMPLETED`), inventory stock reservation, and bulk CSV upload.

---

## 💻 2. Technology Stack & Architecture

- **Frontend:** React 18, Vite 5, Vanilla CSS3, TailwindCSS, Lucide React Icons, Recharts, Framer Motion.
- **Backend:** Node.js 22, Express 4, TypeScript 5, Zod 3, Helmet 8, Express Rate Limit 7.
- **Database:** MongoDB Atlas Cluster (`anuj_enterprises`) using Mongoose 8.
- **Authentication:** JSON Web Tokens (JWT) with 256-bit cryptographic secrets and bcryptjs password hashing.
- **PWA:** Web App Manifest with mobile standalone app support.

---

## 📑 3. Key Feature Modules & Workflows

1. **Guest & User Catalogue Mode:** Browse products, inspect pack specifications, view white background product images, and add to cart.
2. **Salesman Session (`AE-SM-001`):** Direct numeric quantity entry, customer selection, customer classification selection, offline checkout creation.
3. **Admin Management (`admin@anujenterprises.demo`):** Product CRUD, salesman status toggling, CSV upload validator, analytics graph aggregation.
