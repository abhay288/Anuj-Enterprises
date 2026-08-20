# ANUJ ENTERPRISES — DATABASE AUDIT REPORT
**Phase 8 Mongoose Schema & Data Integrity Review**

---

## 1. Database Schema Specifications

### `Product` Collection (`server/src/models/Product.ts`)
* **Primary Key / Unique Index:** `productId` (String, unique, index), `sku` (String, unique, index, uppercase).
* **Compound & Text Indexes:** `{ name: 'text', sku: 'text', companyName: 'text', categoryName: 'text' }`.
* **Field Level Validation:**
  * `price`: Number, `required: true`, `min: 0`
  * `stock`: Number, `required: true`, `min: 0`, `default: 0`
  * `status`: String enum `['Published', 'Draft']`
  * `featured` & `newProduct`: Boolean indexes for fast catalogue filtering.

### `Order` Collection (`server/src/models/Order.ts`)
* **Primary Key / Indexes:** `orderId` (unique, index), `invoiceNumber` (index), `salesmanId` (index), `createdAt` (descending index).
* **Embedded Item Snapshot:** Stores historical snapshot of items (`productId`, `sku`, `productName`, `quantity`, `price`, `packSize`, `total`) so future price edits on the master product never alter historical financial audits.
* **Status Lifecycles:**
  * `status`: `['NEW', 'CONFIRMED', 'READY_FOR_COLLECTION', 'COMPLETED', 'CANCELLED']`
  * `collectionStatus`: `['PENDING', 'COLLECTED']`
  * `paymentStatus`: `['OFFLINE']`

### `Salesman` Collection (`server/src/models/Salesman.ts`)
* **Primary Key / Indexes:** `salesmanId` (unique, index, uppercase), `email` (unique, lowercase).
* **Security Guard:** `passwordHash` defined with `select: false` to prevent accidental credential leakage in standard roster queries.
* **Status Enum:** `['Active', 'Disabled']`.

### `User` Collection (`server/src/models/User.ts`)
* **Indexes:** `email` (unique, lowercase, index).
* **RBAC Roles:** `['USER', 'SALESMAN', 'ADMIN']`.
* **Security Guard:** `passwordHash` defined with `select: false`.

### `Company` & `Category` Collections (`server/src/models/Company.ts`, `Category.ts`)
* **Unique Constraints:** Case-insensitive uniqueness enforcement for brand and category names.
* **Status Control:** Active/Disabled flags.

### `Invoice` & `Customer` Collections (`server/src/models/Invoice.ts`, `Customer.ts`)
* **Invoices:** Formal tax invoice records with GST calculations, issued timestamps, and sequential numbering.
* **Customers:** B2B retailer directory with `classification` (`NORMAL`, `DAMAGE`, `EXPIRY`) and `customerMode` (`FULL`, `QUICK`).

---

## 2. Integrity & Concurrency Verification

* **Overselling Prevention:** Verified `$gte: qty` atomic query guards inside `Product.findOneAndUpdate`.
* **Cancellation Restocking:** Automated inventory replenishment triggered upon order status change to `CANCELLED`.
* **Orphan Records:** Embedded item schemas ensure invoices and orders remain fully legible even if a product SKU is deleted from the catalog.
