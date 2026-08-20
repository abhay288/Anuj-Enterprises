# CHANGELOG — ANUJ ENTERPRISES B2B PLATFORM

All notable changes to the Anuj Enterprises B2B E-Commerce & Salesman Management Platform are documented in this file using Semantic Versioning (`vMAJOR.MINOR.PATCH`).

---

## [v1.0.0] — 2026-08-14
### Initial Production Release
- **Frontend MVP:** Completed branded responsive web application, product catalogue, company/category filters, master pack/bundle/case specifications, quick & full customer registration modes, customer classifications (`NORMAL`, `DAMAGE`, `EXPIRY`), offline checkout, official sales invoice modal, salesman purchase history, admin CRUD, bulk CSV importer, and analytics UI.
- **Backend API:** Full Express REST API with TypeScript, Mongoose models (`User`, `Salesman`, `Company`, `Category`, `Product`, `Customer`, `Order`, `Invoice`, `AdminActivity`), JWT auth, Zod validation, Helmet security headers, CORS, rate limiting, and atomic inventory decrement.
- **Database:** Live connection to MongoDB Atlas cluster (`anuj_enterprises`).
- **GSTIN Removal:** Completely removed GSTIN/GST/Tax Invoice references across frontend, backend, database models, and documentation per client instructions.
- **Client UAT:** 26/26 feature verification tests passed. Signed off by Qyvero Technologies and Anuj Enterprises.
