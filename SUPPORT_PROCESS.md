# CLIENT SUPPORT PROCESS & MAINTENANCE BOUNDARIES
**Developer Agency:** Qyvero Technologies  
**Client Organization:** Anuj Enterprises  

---

## 🚨 Bug vs. Feature Request Classification

To ensure clear maintenance boundaries, all incoming client requests are categorized into one of two distinct tracks:

### Track A: Maintenance Defect / Bug Fix (Included in Maintenance)
- Existing approved page or button not working as designed.
- API error or database connection failure.
- Existing order checkout, invoice PDF, or stock decrement malfunction.
- Security vulnerability or rate-limiting issue.
- Mobile layout alignment defect or PWA launch error.

### Track B: New Feature / Change Request (Requires Scope Approval & Separate Quotation)
- Adding WhatsApp or SMS automated invoice messaging.
- Online payment gateway integration (Razorpay, Paytm, UPI).
- ERP / Tally / SAP accounting software integration.
- AI-driven product recommendations or automated customer chatbots.
- Major visual redesigns or new business role additions.

---

## ⚡ Incident Severity Levels & SLAs

| Severity | Definition / Impact | Initial Response SLA | Target Resolution SLA |
|---|---|---|---|
| **CRITICAL** | Production site down, database unreachable, or orders failing globally | **< 30 Minutes** | **< 4 Hours** |
| **HIGH** | Core business flow broken (e.g. Salesman unable to checkout or invoices failing) | **< 2 Hours** | **< 12 Hours** |
| **MEDIUM** | Non-critical feature defect or secondary admin tool issue | **< 4 Hours** | **< 24 Hours** |
| **LOW** | Minor UI spacing, typography alignment, or visual tweak | **< 8 Hours** | **< 48 Hours** |

---

## 📝 Support Ticket Template

When reporting an issue to Qyvero Technologies support (`support@qyvero.com`), please use the following template:

```text
[TICKET ID]: AE-SUP-YYYYMMDD-XX
[DATE]: YYYY-MM-DD
[REPORTED BY]: Name & Title
[SEVERITY]: CRITICAL | HIGH | MEDIUM | LOW
[MODULE]: Catalogue | Cart | Checkout | Invoice | Admin | Salesman | Mobile
[DESCRIPTION]: Concise description of observed issue vs expected behavior.
[STEPS TO REPRODUCE]:
  1. ...
  2. ...
[SCREENSHOT / LOG]: Attach screenshot or error message if available.
```
