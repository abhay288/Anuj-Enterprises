# 🛡️ Anuj Enterprises — Advanced Security Audit & Hardening Report (Phase 15)

**Platform:** Anuj Enterprises B2B Industrial FMCG Distribution Platform  
**Audit Scope:** Full Stack (Node.js/Express Backend, React Frontend, MongoDB Atlas, Auth Architecture, API Surface)  
**Security Status:** **PASSED & PRODUCTION HARDENED**  
**Audit Date:** August 20, 2026  

---

## 1. Authentication Security Architecture

### 1.1 JWT & Refresh Token Standards
* **Algorithm:** HMAC SHA-256 (`HS256`).
* **Expiration Policy:** Access tokens expire after 24 hours (`expiresIn: '24h'`).
* **Refresh Token Rotation:** Handled via `/api/v1/auth/refresh` validating with dedicated `JWT_REFRESH_SECRET`.
* **State Invalidation & Logout:** Client removes cached bearer tokens from localStorage and context memory; server endpoint `/api/v1/auth/logout` invalidates session tokens.

### 1.2 Password Hashing & Salt Standard
* **Mechanism:** `bcryptjs` with a work factor of **10 salt rounds** (`bcrypt.hash(password, 10)`).
* **Hash Exclusion:** Mongoose schemas (`User.ts`, `Salesman.ts`) define `passwordHash: { type: String, select: false }`, ensuring hashes are never returned in queries or API responses by default.
* **Password Reset:** Managed exclusively by authenticated Admins via `POST /api/v1/salesmen/:id/reset-password` protected by `requireRoles('ADMIN')`.

---

## 2. Role-Based Access Control (RBAC) & Privilege Escalation Defenses

### 2.1 Role Hierarchy & Permissions Matrix

| Endpoint Group | Method | Minimum Role Required | Middleware Guard | Escalation Defense |
| :--- | :---: | :---: | :--- | :--- |
| `/api/v1/products` (Catalog View) | `GET` | `PUBLIC` | `authenticateJWT` (Optional) | Safe read-only access |
| `/api/v1/products` (CRUD / Status) | `POST`/`PATCH`/`DELETE` | `ADMIN` | `requireRoles('ADMIN')` | 403 Forbidden for Salesman/Guest |
| `/api/v1/inventory/*` | `ALL` | `ADMIN` | `requireRoles('ADMIN')` | 403 Forbidden for non-Admin |
| `/api/v1/analytics/*` | `GET` | `ADMIN` | `requireRoles('ADMIN')` | Business intelligence locked |
| `/api/v1/salesmen` (Roster/Reset) | `POST`/`PATCH` | `ADMIN` | `requireRoles('ADMIN')` | Cannot modify or reset peers |
| `/api/v1/orders` (Booking) | `POST` | `USER`/`SALESMAN`/`ADMIN` | `authenticateJWT` | Enforces atomic stock checks |
| `/api/v1/orders/:id/status` | `PATCH` | `ADMIN` | `requireRoles('ADMIN')` | Fulfillment state changes locked |

### 2.2 Privilege Escalation Verification
* **Token Tampering:** Modifying token payload triggers `JsonWebTokenError` and terminates the request with HTTP 401.
* **Role Tampering:** Injecting arbitrary roles in request bodies (e.g. `role: "ADMIN"`) is strictly ignored; authorization derives solely from the cryptographically verified JWT payload.

---

## 3. API Security & Threat Mitigation

### 3.1 Rate Limiting Defense
* **Global API Limiter:** 500 requests per 15-minute window (`express-rate-limit`) on all `/api/` endpoints with standard HTTP 429 status codes.
* **Brute-Force Auth Protection:** 20 requests per 15-minute window on `/api/v1/auth/login`.

### 3.2 Security Headers & Cross-Origin Safety (CORS & Helmet)
* **Helmet:** Enabled with HTTP security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, and strict referrer policies.
* **CORS:** Configured with origin filtering (`CLIENT_URL` environment variable) and `credentials: true`.
* **Payload Limits:** Strict 10MB limit on `express.json()` and `express.urlencoded()` to prevent memory exhaustion and buffer overflow attacks.

### 3.3 MongoDB Injection Prevention
* All Mongoose queries utilize parameterized Mongoose models (`find`, `findOne`, `findOneAndUpdate`) with strict type schemas.
* No raw `$where` or arbitrary JavaScript execution is enabled.

---

## 4. File & Upload Security

### 4.1 Bulk CSV Validation & Sanitization
* **Row Count Caps:** Maximum 500 records per upload batch.
* **Payload Validation:** Evaluates mandatory types (`sku`, `name`, `price >= 0`, `stock >= 0`).
* **Executable Rejection:** Only JSON/CSV structured payloads are processed. Raw binary executable extensions (`.exe`, `.sh`, `.bat`, `.cmd`, `.js`) are rejected immediately.

---

## 5. Audit Logging & Traceability

### 5.1 Admin Activity Trail (`AdminActivity`)
All state-modifying actions log:
* `action`: `SALESMAN_CREATED`, `SALESMAN_DISABLED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`, `BULK_IMPORT`, `THRESHOLD_UPDATED`.
* `adminId`: Authenticated admin user ID.
* `details`: Descriptive human-readable change summary.
* `timestamp`: Automated ISO-8601 creation timestamp.

### 5.2 Stock Movement Ledger (`InventoryLog`)
Every inventory adjustment logs:
* `changeType`: `STOCK_ADDED`, `ORDER_DEDUCTION`, `ORDER_CANCELLATION_RESTOCK`, `MANUAL_ADJUSTMENT`.
* `previousStock`, `newStock`, `quantityChange`, `performedBy`, `reason`.

---

## 6. Error Sanitization & Data Protection

### 6.1 Production Error Sanitization
* The centralized `errorHandler.ts` sanitizes all errors before sending them over the wire:
  * MongoDB duplicate key error code 11000 $\rightarrow$ `"A record with this field already exists."`
  * CastError $\rightarrow$ `"Invalid resource identifier format."`
  * ValidationError $\rightarrow$ Clean comma-separated field failure messages.
  * JWT Error $\rightarrow$ `"Your session has expired or is invalid. Please sign in again."`
* **Zero Stack Trace Leaks:** Server stack traces, internal filesystem paths (`E:\Anuj-Enterprises\...`), database connection strings, and credential secrets are strictly suppressed from HTTP response bodies.

---

## 7. Dependency Security Audit

| Core Dependency | Version | Security Verification Status |
| :--- | :---: | :--- |
| `bcryptjs` | `^2.4.3` | **Secure** (No open CVEs, pure JS implementation) |
| `jsonwebtoken` | `^9.0.2` | **Secure** (Standard HS256 algorithm enforcement) |
| `helmet` | `^8.0.0` | **Secure** (Latest production major) |
| `express-rate-limit` | `^7.5.0` | **Secure** (Standard rate limiting headers) |
| `mongoose` | `^8.10.0` | **Secure** (Latest stable driver with connection pooling) |
| `cors` | `^2.8.5` | **Secure** (Origin validation) |

---

## 8. Summary of Hardened Components

```text
Authentication:     ✅ 24h JWT + Bcrypt (10 rounds) + Hidden Hashes
Authorization:      ✅ RBAC Middleware enforced on all administrative routes
Rate Limiting:      ✅ Dedicated Auth Limiter (20/15m) + API Limiter (500/15m)
Data Protection:    ✅ Sensitive fields excluded from default queries
Error Sanitization: ✅ Production stack trace suppression & human-readable toasts
Database Security:  ✅ TLS/SSL MongoDB Atlas + Connection pooling + Auto-reconnect
```
