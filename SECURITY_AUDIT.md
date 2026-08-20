# ANUJ ENTERPRISES — SECURITY AUDIT REPORT
**Phase 8 Vulnerability Assessment & Hardening Verification**

---

## 1. Authentication & RBAC Verification

* **Algorithm & Encryption:** Password hashing utilizes **bcrypt** with standard salt rounds.
* **Token Architecture:** Stateless **JSON Web Tokens (JWT)** signed using 256-bit secret keys with 24-hour expiration.
* **Role-Based Access Control (RBAC):**
  * `ADMIN`: Full access to create/update/delete products, reset passwords, bulk CSV ingestion, revenue analytics, and system configurations.
  * `SALESMAN`: Scoped access to book customer orders, view individual performance metrics, and manage assigned territory shops.
  * `USER / GUEST`: Read-only access to published catalog products and basic cart building.
* **Authorization Middleware:** `authenticateJWT`, `requireAuth`, and `requireRoles('ADMIN')` guard administrative endpoints with `401 Unauthorized` and `403 Forbidden` response codes.

---

## 2. API Gateway & Network Security

* **HTTP Header Hardening:** **Helmet** configured to secure response headers against clickjacking, sniffing, and MIME-type confusion.
* **CORS Policy:** Strict origin whitelisting configured via `CLIENT_URL` environment variable.
* **Rate Limiting:** Express Rate Limiter active on `/api/` endpoints (300 requests / 15-minute window per IP) to mitigate brute-force and DDoS vectors.
* **Image Payload & URL Sanitation:** `validateImagePayload` middleware prevents execution of dangerous extensions (`.exe`, `.php`, `.js`, `.sh`, `.bat`).

---

## 3. Environment & Secret Management

* **Environment Separation:** `.env` and `.env.example` templates properly separated.
* **Git Protection:** `.gitignore` properly includes all `.env`, `node_modules`, and build artifacts.
* **Mongoose Projection Protection:** Critical fields (`passwordHash`) are excluded by default via `select: false`.
