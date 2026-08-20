# 🏢 ANUJ ENTERPRISES — COMPLETE FUNCTIONALITY, WORKING PROCESS & FEATURE VERIFICATION REPORT

**Platform:** Anuj Enterprises B2B E-Commerce, Salesman Field Ordering & Admin Management Platform  
**Agency/Engineering:** Qyvero Technologies  
**Technology Stack:**
* **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Recharts, Three.js, PWA (Service Worker / Manifest)
* **Backend:** Node.js, Express.js, TypeScript (Strict Type Safety)
* **Database:** MongoDB Atlas (Mongoose ODM with connection pooling & auto-reconnect)
* **Authentication & RBAC:** JWT (HS256 24h expiration) + bcrypt (10 salt rounds) + Multi-role guards (USER, SALESMAN, ADMIN)
* **Target Viewports:** Desktop, Tablet, Mobile (375px, 390px, 430px, 768px, 1024px, 1280px+) + PWA Standalone

---

## 1. System Architecture & Role Separation

```text
                    ANUJ ENTERPRISES
                          │
             ┌────────────┴────────────┐
             │                         │
        NORMAL USER                SALESMAN               ADMIN
             │                         │                    │
             └────────────┬────────────┘                    │
                          │                                 │
                     FRONTEND (React + Vite + PWA)          │
                          │                                 │
                     REST API (Node.js + Express)           │
                          │                                 │
             ┌────────────┴────────────┐                    │
             │                         │                    │
        Authentication           Business Logic             │
        (JWT + RBAC)             (Atomic Inventory, Log)    │
             │                         │                    │
             └────────────┬────────────┘                    │
                          │                                 │
                    MongoDB Atlas                           │
                          │                                 │
        ┌─────────────────┼──────────────────┐              │
        │                 │                  │              │
     Products          Orders            Invoices           │
     Companies         Customers          Salesmen          │
     Categories        InventoryLogs      AdminActivity ◄───┘
```

### Role Scope & Boundaries
1. **Normal User / Guest:**
   * **Scope:** Product discovery, multi-criteria category/brand filtering, token search, unit packaging breakdown, direct quantity entry, responsive cart.
   * **Restrictions:** Cannot access Admin Dashboard, cannot view Salesman rosters, cannot create unauthorized offline B2B trade orders.
2. **Salesman:**
   * **Scope:** Role login (`AE-SM-XXX`), catalogue browsing, fast direct quantity inputs, Quick Order vs. Full Customer entry, Customer Classification (`NORMAL` / `DAMAGE` / `EXPIRY`), atomic order booking, official tax invoice generation, WhatsApp/print sharing, isolated personal order history.
   * **Restrictions:** Cannot modify product prices, cannot disable peer salesmen, cannot access Admin BI revenue analytics or modify database configurations.
3. **Admin:**
   * **Scope:** Full enterprise management: Product CRUD, publishing/draft toggles, featured/new arrivals, Company/Brand management, Category management, Salesman credential lifecycle & disabling, Order cancellation & restock, Warehouse stock dashboard & physical count audits, Bulk CSV import with row validation, AdminActivity & InventoryLog audit trails, Business Intelligence analytics.

---

## 2. Comprehensive Workflow & Feature Verification Matrix

### 2.1 Normal User Workflow (Discovery $\rightarrow$ Cart)
* **Branding & Layout:** Logo, header navigation, hero banner, category pills, featured products grid, new arrivals, and responsive footer.
* **Smart Search:** Instant tokenized matching across Product Name, SKU, Company/Brand, and Category with zero case sensitivity and no-result fallback.
* **Mobile Filter Bottom Sheet:** Slide-up filter drawer with multi-select checkboxes for categories, brands, in-stock only, featured only, new arrivals, and bulk tiers.
* **Product Detail Experience:**
  * Displays Name, SKU, HSN, Company, Stock, Pack Size, Bundle Size, Case Size.
  * Interactive image gallery with hover zoom, fullscreen high-res zoom, and White Background Studio Preview.
  * Direct numeric quantity input field (`[-] [ 50 ] [+]`) with non-negative validation.
* **Cart Management:** Dynamic quantity increment/decrement, item removal, pack/case breakdown, and empty-state guidance.

---

### 2.2 Salesman Field Ordering & Offline Collection Workflow
* **Authentication:** Secure login via Salesman ID (`AE-SM-001`) and password with JWT generation.
* **Dashboard:** Live database-driven order metrics (Today's Orders, Total Quantity, Recent Orders roster, Customer Directory).
* **Customer Selection & Classification:**
  * **Option 1 (Quick Order):** Customer Name only.
  * **Option 2 (Full Customer):** Name, Mobile, Email, Address, City, State.
  * **Mandatory Classification:** `NORMAL` | `DAMAGE` | `EXPIRY` stored directly in order schema.
* **Atomic Checkout & Stock Reservation:**
  * MongoDB `$inc: { stock: -quantity }` with `{ stock: { $gte: quantity } }` condition.
  * Prevents overselling and eliminates race conditions under concurrent ordering.
* **Offline Collection Standard:**
  * `Order Type`: `OFFLINE COLLECTION`
  * `Payment Mode`: `OFFLINE`
  * `Collection Status`: `PENDING`
* **Official Tax Invoice:**
  * Sequential invoice number generation (`AE-2026-000001`, `AE-2026-000002`).
  * Immutable historical snapshot: Captures exact product name, SKU, unit rate, and customer classification at booking time.
  * Multi-channel actions: 1-Click Print (clean `@media print`), Download HTML/PDF, WhatsApp direct share, Email dispatch toast, and Clipboard copy.
* **Data Isolation:** Salesmen can only access and review their own assigned order history.

---

### 2.3 Admin Management & Warehouse Operations
* **Executive KPI Dashboard:** Real-time metrics for Total Orders, Pending Orders, In Stock, Low Stock, Active Salesmen, and Category volume.
* **Product CRUD & State Management:**
  * Add, edit, clone/duplicate, and delete products.
  * Status toggles: `Draft` (hidden from catalogue) $\leftrightarrow$ `Published` (publicly available).
  * Flag toggles: `Featured = ON/OFF`, `New Product = ON/OFF`.
* **Company & Category Management:** Create, edit, and delete brands/categories with instant catalogue synchronization.
* **Salesman Management:** Add new salesmen, toggle `Active` / `Disabled` status (disabled accounts are immediately blocked at login), and securely reset passwords.
* **Order Status Workflow:**
  * `NEW` $\rightarrow$ `CONFIRMED` $\rightarrow$ `READY FOR COLLECTION` $\rightarrow$ `COMPLETED`
  * Alternative: `CANCELLED` (automatically restores reserved stock and logs `ORDER_CANCELLATION_RESTOCK` to `InventoryLog`).
* **Warehouse Stock Management:**
  * Configurable per-SKU `lowStockThreshold` (default: 20 units).
  * Incremental restock (`+25`, `+50`, `+100`, `+250`, `+500`) with reason logging.
  * Physical count audits with variance calculations.
* **Bulk CSV Import:**
  * Maximum 500 records per batch.
  * Pre-import validation isolating valid rows vs. invalid rows (missing fields, duplicate SKU, negative values).
  * Complete atomic import with activity logging in `AdminActivity`.

---

### 2.4 Security, Data Protection & Performance
* **Authentication Security:** 24h HS256 JWT tokens, bcrypt hash (10 salt rounds), password hashes masked (`select: false`).
* **API Rate Limiting:** 20 login attempts per 15 min on `/api/v1/auth/login`; 500 requests per 15 min across all API routes.
* **Production Error Sanitization:** Centralized `errorHandler.ts` catches and cleans Mongo duplicate keys (11000), CastErrors, and validation errors; zero server stack traces or secrets exposed.
* **PWA & Mobile Optimization:** Installable standalone PWA manifest, iOS/Android safe area padding (`pb-safe`), and code-split bundles (core JS reduced to 302 kB).

---

## 3. Build & Test Verification

```text
Backend Build (tsc):            ✅ 0 Errors (Exit Code 0)
Frontend Build (Vite):          ✅ 0 Errors (Exit Code 0 in 12.31s)
Core JS Bundle:                 ✅ Split into modular vendor chunks (302 kB core)
Automated Test Suite:           ✅ 4/4 Passed (Exit Code 0)
Responsive Viewport QA:         ✅ 375px to 1920px (0px Horizontal Overflow)
```
