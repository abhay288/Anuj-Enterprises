# ====================================================================
# ANUJ ENTERPRISES — SECURITY PHASE S1: COMPLETE SECURITY AUDIT REPORT
# ====================================================================

**Date of Audit:** August 21, 2026  
**Audited Platform:** Anuj Enterprises B2B Supply & Sales Platform  
**Architecture:** Node.js, Express.js, TypeScript, React, Vite, MongoDB Atlas, Mongoose, JWT, bcrypt, RBAC  
**Audit Scope:** Passive Static Code Inspection, Route Security, Auth/RBAC Verification, Database Queries, File Handling, Frontend Storage, Business Logic & Dependencies.  

---

## 📊 EXECUTIVE SUMMARY

| Severity Level | Total Findings | Description |
| :--- | :---: | :--- |
| 🔴 **CRITICAL** | **3** | Immediate exploit risk (Publicly accessible sensitive endpoints, Hardcoded fallback credentials) |
| 🟠 **HIGH** | **4** | Significant security weaknesses (Broken RBAC on Invoices/Orders, Insecure File Upload, Weak JWT fallbacks) |
| 🟡 **MEDIUM** | **5** | Moderate risk (Disabled account login bypass, Regex ReDoS, Storage of JWT in localStorage) |
| 🔵 **LOW** | **4** | Minor security improvements (CORS wildcard with credentials, Unbounded queries, Missing CSP) |
| ℹ️ **INFO** | **2** | Architectural observations & best practice advisories |

---

## 1. 🗄️ REPOSITORY & SECRETS AUDIT

| Location | Secret Type | Risk Level | Details & Impact | Recommended Action |
| :--- | :--- | :---: | :--- | :--- |
| `server/src/middleware/authMiddleware.ts:24` | Hardcoded Fallback JWT Secret | 🟠 **HIGH** | Uses default string `'anuj_enterprises_jwt_super_secret_key_2026_prod'` if `process.env.JWT_SECRET` is missing. | Require `JWT_SECRET` at server boot; throw error if missing. |
| `server/src/controllers/authController.ts:59-64` | Hardcoded Admin Fallback Credentials | 🔴 **CRITICAL** | Hardcoded credentials (`admin@anujenterprises.demo` / `Admin@123`) allow authentication even if DB is empty or breached. | Remove hardcoded fallback auth; rely solely on hashed credentials in MongoDB. |
| `server/src/controllers/authController.ts:115-120` | Hardcoded Salesman Fallback Credentials | 🔴 **CRITICAL** | Hardcoded fallback credentials (`AE-SM-001` / `Sales@123`) generate valid 24h JWT tokens without database check. | Remove hardcoded fallback credentials. |
| `src/services/cloudinaryService.js:10` | Hardcoded Client Cloudinary Name | 🔵 **LOW** | Fallback cloud name `'uazkw46b'` in client bundle. | Read purely from `import.meta.env.VITE_CLOUDINARY_CLOUD_NAME`. |

---

## 2. 🔐 AUTHENTICATION AUDIT

### Finding AUTH-01: Disabled Account Status Bypass on Login
- **Location:** `server/src/controllers/authController.ts:27-145`
- **Severity:** 🟡 **MEDIUM**
- **Impact:** When an administrator toggles a salesman or customer account to `status: 'Disabled'`, the `login` function validates only the password hash and **does not check `status === 'Disabled'`**. The disabled user can continue logging in and generating new tokens.
- **Recommendation:** Add explicit check: `if (userObj.status === 'Disabled' || salesmanObj.status === 'Disabled') return res.status(403).json({ message: 'Account is deactivated' })`.

### Finding AUTH-02: Missing Server-Side Token Invalidation (Stateless Logout)
- **Location:** `server/src/controllers/authController.ts:194-199`
- **Severity:** 🟡 **MEDIUM**
- **Impact:** `/api/v1/auth/logout` returns `{ success: true }` but does not invalidate the JWT. Tokens remain valid for up to 24 hours until expiration.
- **Recommendation:** Implement Redis token blocklist or use short-lived access tokens (15m) paired with refresh token rotation.

---

## 3. 🛡️ AUTHORIZATION & RBAC AUDIT

### Finding AUTHZ-01: Sensitive Invoices & Billing Endpoints Lack Authorization Middleware
- **Location:** `server/src/routes/invoiceRoutes.ts:7-9`
- **Severity:** 🔴 **CRITICAL**
- **Impact:** `GET /api/v1/invoices`, `GET /api/v1/invoices/:id`, and `GET /api/v1/invoices/:id/pdf` use only `authenticateJWT` (which passes `next()` for unauthenticated requests) without `requireAuth`. **Any unauthenticated user on the internet can dump all wholesale invoices, customer names, billing amounts, and phone numbers.**
- **Recommendation:** Add `requireAuth` and role verification (`requireRoles('ADMIN', 'SALESMAN')`) to all invoice routes.

### Finding AUTHZ-02: Customer and Salesmen Rosters Publicly Exposed
- **Location:** `server/src/routes/salesmanRoutes.ts:10-11` & `server/src/routes/customerRoutes.ts:7-8`
- **Severity:** 🟠 **HIGH**
- **Impact:** `GET /api/v1/salesmen` and `GET /api/v1/customers` can be queried without authentication, exposing complete sales representative contact rosters and customer accounts.
- **Recommendation:** Protect with `authenticateJWT, requireAuth, requireRoles('ADMIN')`.

### Finding AUTHZ-03: Missing Horizontal Privilege Isolation in Orders API
- **Location:** `server/src/controllers/orderController.ts:280-302`
- **Severity:** 🟠 **HIGH**
- **Impact:** `getOrders` allows any authenticated user or salesman to query `?salesmanId=AE-SM-002` and view orders, customer details, and commissions of other sales representatives.
- **Recommendation:** Enforce role-based query scope: If `req.user.role === 'SALESMAN'`, force `filter.salesmanId = req.user.salesmanId`.

---

## 4. 🌐 API & RATE LIMITING AUDIT

### Finding API-01: Unprotected Image Upload Endpoint
- **Location:** `server/src/routes/uploadRoutes.ts:7-8`
- **Severity:** 🟠 **HIGH**
- **Impact:** `POST /api/v1/upload/cloudinary` and `POST /api/v1/upload/image` have no authentication and no route-specific rate limiting. An attacker can flood the server with base64 payloads, exhausting bandwidth and Cloudinary API quotas.
- **Recommendation:** Add `authenticateJWT, requireAuth, requireRoles('ADMIN')` and apply strict upload rate limiting.

### Finding API-02: User-Controlled Cloudinary Destination Folder
- **Location:** `server/src/controllers/uploadController.ts:24`
- **Severity:** 🟡 **MEDIUM**
- **Impact:** The `folder` parameter is accepted directly from `req.body` (`const { folder = 'anuj_enterprises/products' } = req.body;`), allowing attackers to upload assets to unintended Cloudinary directories.
- **Recommendation:** Whitelist allowed folder names or hardcode the target directory server-side.

---

## 5. 🗄️ DATABASE & NOSQL INJECTION AUDIT

### Finding DB-01: Unescaped User Input in RegExp Queries (ReDoS Risk)
- **Location:** `server/src/controllers/orderController.ts:296-298` & `server/src/controllers/productController.ts`
- **Severity:** 🟡 **MEDIUM**
- **Impact:** Search inputs are passed directly to `new RegExp(q, 'i')` without escaping regex characters (`.*+?^${}()|[]\`). A user submitting special regex sequences can trigger catastrophic backtracking (ReDoS) or cause server query crashes.
- **Recommendation:** Use a regex sanitization helper (e.g. `q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`) before constructing regex filters.

### Finding DB-02: Unbounded Database Queries Without Pagination
- **Location:** `server/src/controllers/orderController.ts:302` & `server/src/controllers/salesmanController.ts:9`
- **Severity:** 🔵 **LOW**
- **Impact:** Queries use `.find().lean()` without `.limit()`. As the business scales to tens of thousands of orders, fetching all records in a single query can cause high memory usage and slow responses.
- **Recommendation:** Implement pagination (`limit`, `skip`, or cursor-based pagination) with a default limit of 50 records.

---

## 6. 📁 FILE SECURITY AUDIT

### Finding FILE-01: Missing Magic Byte / MIME Verification
- **Location:** `server/src/controllers/uploadController.ts:22-62`
- **Severity:** 🟡 **MEDIUM**
- **Impact:** The server verifies only `if (!image)` without checking if the payload starts with a valid image MIME header (`data:image/(png|jpeg|webp)`) or inspecting file magic numbers.
- **Recommendation:** Validate image headers and restrict allowed MIME types to `image/jpeg`, `image/png`, and `image/webp`.

### Finding FILE-02: Client-Side ZIP Extraction Path Traversal Protection
- **Location:** `src/components/admin/BulkCsvModal.jsx:92-120`
- **Severity:** 🔵 **LOW**
- **Impact:** In-memory ZIP extraction parses relative entry paths. While processed client-side without filesystem write, zip entries containing malicious directory traversal paths (`../../`) could cause unexpected key collisions.
- **Recommendation:** Sanitize ZIP entry filenames using `entry.name.split('/').pop()` to extract purely the basename.

---

## 7. 💻 FRONTEND SECURITY AUDIT

### Finding FE-01: JWT Storage in Browser LocalStorage
- **Location:** `src/services/authService.js:10`
- **Severity:** 🟡 **MEDIUM**
- **Impact:** The authentication token is stored in `localStorage.setItem('anuj_jwt_token', token)`. If any third-party script or XSS vulnerability is introduced, the token can be read by JavaScript.
- **Recommendation:** Migrate authentication tokens to `HttpOnly`, `SameSite=Strict`, `Secure` cookies.

### Finding FE-02: XSS & HTML Injection Status
- **Location:** Frontend component tree (`src/components/`)
- **Severity:** 🟢 **PASSED (INFO)**
- **Audit Result:** Zero instances of `dangerouslySetInnerHTML`, `eval()`, or `document.write()` in core application rendering. React JSX auto-escaping protects against reflected and stored XSS.

---

## 8. 💼 BUSINESS LOGIC SECURITY AUDIT

### Finding BIZ-01: Concurrency & Race Condition Protection
- **Location:** `server/src/controllers/orderController.ts:65-72`
- **Severity:** 🟢 **PASSED (INFO)**
- **Audit Result:** Atomic inventory deduction is properly implemented using `Product.findOneAndUpdate({ stock: { $gte: qty } }, { $inc: { stock: -qty } })`. This prevents overselling during concurrent checkouts.

### Finding BIZ-02: Order Status Stock Rollback
- **Location:** `server/src/controllers/orderController.ts:349-357`
- **Severity:** 🟢 **PASSED (INFO)**
- **Audit Result:** Order cancellation properly increments stock back into the inventory catalog.

---

## 9. 📦 DEPENDENCY VULNERABILITY AUDIT

### Results of `npm audit`:
- **Server Backend (`server/package.json`):**  
  `0 vulnerabilities` (0 Critical, 0 High, 0 Moderate, 0 Low). All production server packages are clean.
- **Frontend (`package.json`):**  
  - 🟠 **High:** `xlsx` (Prototype Pollution & ReDoS in older versions)
  - 🟠 **High:** `vite` (Windows path traversal advisory in dev server)
  - 🟠 **High:** `nanoid` (Custom generator loop advisory)
  - 🟡 **Moderate:** `esbuild` (Dev server CORS advisory)

---

## 10. 📋 REMEDIATION ACTION PLAN

| Priority | Task ID | Description | Target Module |
| :---: | :---: | :--- | :--- |
| **P0** | SEC-FIX-01 | Add `requireAuth` and `requireRoles` to `invoiceRoutes.ts`, `salesmanRoutes.ts`, and `customerRoutes.ts` | `server/src/routes/` |
| **P0** | SEC-FIX-02 | Remove hardcoded fallback admin and salesman credentials from `authController.ts` | `server/src/controllers/authController.ts` |
| **P1** | SEC-FIX-03 | Enforce authentication and rate limiting on image upload endpoints | `server/src/routes/uploadRoutes.ts` |
| **P1** | SEC-FIX-04 | Enforce account `status !== 'Disabled'` validation during login | `server/src/controllers/authController.ts` |
| **P1** | SEC-FIX-05 | Enforce horizontal isolation for Salesman order retrieval (`filter.salesmanId = req.user.salesmanId`) | `server/src/controllers/orderController.ts` |
| **P2** | SEC-FIX-06 | Add regex sanitization to prevent ReDoS on product/order searches | `server/src/controllers/` |
| **P2** | SEC-FIX-07 | Restrict Cloudinary destination folders and enforce MIME type checks | `server/src/controllers/uploadController.ts` |

---
*Report Generated by Antigravity IDE Security Auditor — Phase S1 Complete.*
