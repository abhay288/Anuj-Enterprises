# MONTHLY MAINTENANCE & SYSTEM AUDIT CHECKLIST
**Maintenance Term:** 14 August 2026 – 14 February 2027  
**Frequency:** Performed on the 1st of every month  

---

## 📋 25-Point Operational Health Checklist

- [ ] **1. Web Availability:** Verify application loads cleanly over HTTPS without browser console errors.
- [ ] **2. Backend Health:** Execute `GET /api/v1/health` and verify `Database: CONNECTED`.
- [ ] **3. MongoDB Atlas:** Inspect storage usage, active connection count, and query latency in Atlas dashboard.
- [ ] **4. User Authentication:** Test guest browsing, salesman login (`AE-SM-001`), and admin login (`admin@anujenterprises.demo`).
- [ ] **5. Product Catalogue:** Verify product items render with images, pack/bundle/case sizes, and HSN codes.
- [ ] **6. Search & Filters:** Test real-time search, company filter, and category filter response times.
- [ ] **7. Cart & Direct Quantity:** Test numeric quantity typing, MOQ enforcement, and cart subtotal recalculations.
- [ ] **8. Customer Registration:** Verify Quick Customer mode (Name only) and Full Customer mode (Name, Mobile, Email, Address).
- [ ] **9. Order Creation:** Confirm order submission generates `CONFIRMED` status with `OFFLINE COLLECTION` and `PENDING` collection status.
- [ ] **10. Sales Invoice Modal:** Verify invoice popup displays Anuj Enterprises corporate branding, Corporate Seal, and Authorized Signatory.
- [ ] **11. Invoice Download & Print:** Test print layout and PDF download features on Chrome & Safari.
- [ ] **12. Salesman History:** Verify date range filters (`Today`, `This Week`, `This Month`, `Custom Date`) and salesman data isolation.
- [ ] **13. Admin Dashboard:** Audit live KPI cards, recent orders table, and low-stock alerts.
- [ ] **14. Product Management:** Create, edit, unpublish, and mark featured/new arrival test product.
- [ ] **15. Sales Roster Management:** Test enabling/disabling a salesman account and verifying password resets.
- [ ] **16. Order Status Pipeline:** Update order status from `NEW` ➔ `CONFIRMED` ➔ `READY_FOR_COLLECTION` ➔ `COMPLETED`.
- [ ] **17. Inventory Concurrency:** Verify atomic stock decrement and cancellation stock restoration.
- [ ] **18. Bulk CSV Upload:** Test uploading sample CSV file and verifying schema error reporting.
- [ ] **19. Image Upload Security:** Verify upload middleware blocks non-image files and files larger than 5MB.
- [ ] **20. Analytics Dashboard:** Verify sales trends, top companies, and top products render real MongoDB data.
- [ ] **21. Mobile Responsiveness:** Inspect mobile views at 375px, 390px, 430px, 768px viewports without page overflow.
- [ ] **22. PWA Installation:** Verify app installation prompt and standalone launch on mobile devices.
- [ ] **23. Database Backup:** Verify MongoDB Atlas automated backup snapshot integrity.
- [ ] **24. Security Audit:** Review dependency vulnerability reports (`npm audit`) and security headers.
- [ ] **25. Log Inspection:** Review server error logs for unexpected stack traces or authorization failures.
