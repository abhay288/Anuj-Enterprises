export const DEFAULT_LEGAL_POLICIES = {
  privacy: {
    id: 'privacy',
    title: 'Privacy & Data Protection Policy',
    subtitle: 'Enterprise B2B Information Security & Confidentiality Framework',
    lastUpdated: 'August 2026',
    version: '3.4.0 (Statutory FMCG Trade Compliant)',
    effectiveDate: 'January 1, 2026',
    jurisdiction: 'Kanpur Jurisdiction, Uttar Pradesh, India',
    summary: 'Anuj Enterprises is committed to protecting the confidential commercial and personal data of our wholesale buyers, FMCG distributors, retail partners, and field representatives. This policy outlines how information is gathered, encrypted, utilized, and safeguarded.',
    sections: [
      {
        id: 'overview',
        number: '1',
        heading: 'Commercial Scope & Data Stewardship',
        content: 'Anuj Enterprises ("Company", "we", "us", "our"), operating from its Central Hub in Kanpur, Uttar Pradesh, functions as an authorized B2B FMCG distribution and institutional supply partner. We process commercial and personal data solely to facilitate wholesale trade operations, GST tax invoicing, inventory fulfillment, credit ledger auditing, and logistics dispatch.',
        keyPoints: [
          'Strict B2B Commercial Confidentiality — zero data monetisation or third-party ad sharing.',
          'Applies to all interactions via web catalog, salesman order desks, WhatsApp booking, and electronic invoices.',
          'Operates under the Information Technology Act, 2000 and Indian Digital Personal Data Protection standards.'
        ]
      },
      {
        id: 'collection',
        number: '2',
        heading: 'Information We Collect from Trade Partners',
        content: 'To execute wholesale supply orders and maintain compliant statutory accounting, we collect business and contact identifiers during order booking, account creation, or credit facility applications.',
        keyPoints: [
          'Business Identifiers: Legal Entity Name, Trade Name, GSTIN, PAN, FSSAI License numbers.',
          'Contact & Dispatch Data: Proprietor/Manager Name, Delivery Address, Pincode, Mobile Numbers, Official Email.',
          'Trade Transaction Records: SKU order history, case volumes, packaging allocations, payment modes, and delivery confirmations.',
          'Docket Claims Records: Batch numbers, expiry notes, and damage photographs submitted for credit adjustments.'
        ]
      },
      {
        id: 'usage',
        number: '3',
        heading: 'Purpose & Lawful Basis of Processing',
        content: 'All collected information is strictly utilized to deliver legitimate wholesale supply chain operations and adhere to statutory commercial laws.',
        keyPoints: [
          'Generating statutory GST tax invoices and delivery e-Way bills.',
          'Coordinating warehouse picking, packaging, and line-haul transport from our Kanpur Central Dispatch Hub.',
          'Validating B2B credit facilities and maintaining verified ledger statements.',
          'Authenticating field sales representatives and territory allocations across UP and surrounding regions.',
          'Processing urgent priority dispatches and inspecting returned/expired stock replacement claims.'
        ]
      },
      {
        id: 'security',
        number: '4',
        heading: 'Information Security & Data Protection',
        content: 'We employ robust technical, cryptographic, and operational safeguards to protect your business records against unauthorized access, alteration, disclosure, or destruction.',
        keyPoints: [
          '256-bit TLS/SSL encryption for all data in transit across our digital catalog and ordering portal.',
          'Role-Based Access Control (RBAC) restricting customer ledgers strictly to authorized administrative personnel.',
          'Encrypted credential storage and automatic session termination for field salesman terminals.',
          'Daily secure offline backups of business ledgers and invoice audit trails.'
        ],
        alertNote: 'Anuj Enterprises will NEVER request your banking passwords, OTPs, or UPI PINs over phone or email.'
      },
      {
        id: 'sharing',
        number: '5',
        heading: 'Disclosure to Authorized Third Parties',
        content: 'We do not sell, rent, or trade your information. Data is shared exclusively with verified operational partners essential for order fulfillment and legal compliance.',
        keyPoints: [
          'OEM Brand Desks (Amul, Nestlé, Britannia, Cadbury, ITC, HUL, Dabur, Haldiram\'s) for batch authentications and warranty replacements.',
          'Authorized freight carriers and transport logistics for verified door delivery.',
          'Statutory government bodies, GSTN portals, and commercial tax departments as mandated by Indian Law.'
        ]
      },
      {
        id: 'retention',
        number: '6',
        heading: 'Data Retention & Business Partner Rights',
        content: 'Trade records, tax invoices, and payment receipts are retained for 8 financial years in accordance with Section 128 of the Companies Act, 2013 and GST statutory requirements. Registered business partners may request access to their transaction records, update shop delivery addresses, or rectify contact personnel by writing to our compliance desk.',
        keyPoints: [
          'Right to review and download complete historical invoice registers.',
          'Right to update business phone numbers, dispatch contacts, and GSTIN mappings.',
          'Right to request deactivation of field sales accounts upon representative transfer.'
        ]
      },
      {
        id: 'contact',
        number: '7',
        heading: 'Data Protection Officer & Grievance Desk',
        content: 'For questions, data access requests, or privacy concerns, please contact our designated Grievance & Commercial Compliance Officer:',
        keyPoints: [
          'Company: Anuj Enterprises (B2B FMCG Distribution Central Hub)',
          'Address: Transport Nagar / Industrial Area, Kanpur, Uttar Pradesh — 208001',
          'Email: anujenterprises.fmcg.006@gmail.com',
          'Support Lines: +91 88876 83782 / +91 70719 79894',
          'WhatsApp Desk: +91 88876 83782 (Mon–Sat, 9:00 AM – 7:00 PM IST)'
        ]
      }
    ]
  },

  terms: {
    id: 'terms',
    title: 'Terms & Conditions of Wholesale Supply',
    subtitle: 'Standard B2B Commercial Supply Contract & Trade Operational Terms',
    lastUpdated: 'August 2026',
    version: '4.1.0 (B2B Trade Distribution)',
    effectiveDate: 'January 1, 2026',
    jurisdiction: 'Exclusive Courts of Kanpur Jurisdiction, Uttar Pradesh',
    summary: 'These Terms of Supply govern all wholesale procurement orders, institutional contracts, packaging allocations, and invoice settlements executed between Anuj Enterprises and purchasing commercial entities.',
    sections: [
      {
        id: 'commercial-scope',
        number: '1',
        heading: 'Contractual Scope & Acceptance',
        content: 'By placing a wholesale order through the Anuj Enterprises digital catalog, field representative booking, phone desk, or written purchase order (PO), the purchasing business entity ("Buyer") unconditionally agrees to these Terms of Supply.',
        keyPoints: [
          'Applies to all retail shops, modern trade outlets, supermarkets, canteens, and institutional buyers.',
          'Supersedes any conflicting clauses in Buyer purchase requisitions unless explicitly agreed in writing by our Managing Director.',
          'Supply contracts are deemed concluded at our registered central operations hub in Kanpur, Uttar Pradesh.'
        ]
      },
      {
        id: 'packaging-lots',
        number: '2',
        heading: 'Packaging Units, Case Lots & Minimum Orders',
        content: 'As an authorized FMCG distributor, Anuj Enterprises supplies goods exclusively in standardized manufacturer case packaging (bundles, cartons, master cases) to preserve product integrity and batch traceability.',
        keyPoints: [
          'All orders are fulfilled in standard master case multiples (e.g., 6 units, 12 units, 24 units, 48 units per carton).',
          'Minimum Order Value (MOV) requirements apply based on delivery territory and freight tier.',
          'Public pricing is suppressed in standard catalogs; binding commercial quotes are generated on generated Tax Invoices based on volume tiering.'
        ]
      },
      {
        id: 'priority-dispatch',
        number: '3',
        heading: 'Urgent Priority Dispatch Terms (Max 2 SKUs)',
        content: 'To assist trade partners during sudden stockout emergencies or high-turnover festival periods, our ordering system allows marking up to two (2) priority products per invoice.',
        keyPoints: [
          'Marked SKUs are tagged with "⚡ URGENT PRIORITY DISPATCH" on warehouse pick-sheets and invoices.',
          'Priority products receive immediate front-of-line bay allocation and expedited line-haul dispatch from our Kanpur Hub.',
          'Strict system limit of maximum 2 urgent products per invoice prevents line congestion and guarantees turnaround SLAs.'
        ]
      },
      {
        id: 'invoicing-gst',
        number: '4',
        heading: 'Tax Invoicing, Statutory GST & HSN Codes',
        content: 'All supplies are accompanied by official GST Tax Invoices detailing HSN codes, batch numbers, manufacturing dates, and applicable CGST + SGST or IGST tax slabs.',
        keyPoints: [
          'Buyers must furnish a valid, active GSTIN to claim Input Tax Credit (ITC) under the GST Act.',
          'Invoices are uploaded to the GSTN portal for monthly GSTR-1 matching in strict compliance with commercial tax timelines.',
          'Any discrepancies in invoice HSN or tax computations must be notified within 3 business days of invoice receipt.'
        ]
      },
      {
        id: 'payment-credit',
        number: '5',
        heading: 'Payment Modes & B2B Corporate Credit Facilities',
        content: 'We offer flexible payment mechanisms including RTGS, NEFT, IMPS, Verified Company Cheques, and Authorized Field Representative Cash Collections.',
        keyPoints: [
          'Cash-On-Delivery (COD) / Direct Offline Collection is standard for walk-in and non-credit wholesale buyers.',
          'Net 15 to Net 30 Trade Credit is extended exclusively to audited corporate buyers, authorized institutional accounts, and verified retail partners.',
          'Overdue trade balances beyond agreed credit periods will incur commercial interest at 18% per annum from the due date until full settlement.',
          'Supply lines may be temporarily suspended if outstanding trade receivables exceed approved credit thresholds.'
        ]
      },
      {
        id: 'transit-delivery',
        number: '6',
        heading: 'Dispatch Logistics, Transit Risk & Delivery Proof',
        content: 'Dispatches are routed through our dedicated logistics fleet and contracted carriers covering Central UP, East UP, West UP, Lucknow Capital Zone, and Bundelkhand Hubs.',
        keyPoints: [
          'Risk of transit damage remains covered under our distribution transit insurance until physical delivery at the Buyer\'s premises.',
          'Buyer\'s authorized receiving clerk must verify seal integrity, case count, and sign the Delivery Challan (POD).',
          'Same-day dispatch SLA applies for orders confirmed before 2:00 PM IST from the Kanpur Central Hub.'
        ]
      },
      {
        id: 'jurisdiction',
        number: '7',
        heading: 'Governing Law & Exclusive Kanpur Jurisdiction',
        content: 'All commercial relationships, invoices, supply agreements, and claims arising out of transactions with Anuj Enterprises shall be governed by the laws of India.',
        keyPoints: [
          'The courts and commercial tribunals in Kanpur, Uttar Pradesh shall have EXCLUSIVE jurisdiction over any dispute, controversy, or claim.',
          'Any unresolved commercial dispute shall first be referred to mutual conciliation before our Managing Director in Kanpur, UP.'
        ],
        alertNote: 'Legal Venue Notice: All legal notices, arbitrations, and proceedings must be served exclusively within Kanpur Jurisdiction, UP.'
      }
    ]
  },

  returns: {
    id: 'returns',
    title: 'Return, Replacement & Claims Policy',
    subtitle: 'Comprehensive FMCG Quality Assurance, Expiry Claims & Inspection Protocol',
    lastUpdated: 'August 2026',
    version: '3.8.0 (Batch Quality Assurance)',
    effectiveDate: 'January 1, 2026',
    jurisdiction: 'Kanpur Jurisdiction, Uttar Pradesh',
    summary: 'Anuj Enterprises provides a 100% Genuine OEM Batch Guarantee. This policy defines the inspection timeline, claim logging process for expired/damaged stocks, and issuance of replacement stocks or GST credit notes.',
    sections: [
      {
        id: 'guarantee',
        number: '1',
        heading: '100% Genuine OEM Batch Guarantee',
        content: 'Every product supplied by Anuj Enterprises is directly sourced from authorized brand factories and national depots (Amul, Nestlé, Britannia, Cadbury, Colgate, HUL, Parle, ITC, Dabur, Haldiram\'s). We guarantee 0% counterfeit goods and full manufacturer warranty support.',
        keyPoints: [
          'Direct batch tracking from OEM factory release to retail handover.',
          'All cartons carry original tamper-evident factory seals and barcoded batch tags.',
          'Manufacturer test reports (COA) available on request for institutional and corporate consignments.'
        ]
      },
      {
        id: 'inspection-window',
        number: '2',
        heading: 'Delivery Inspection & 48-Hour Reporting Window',
        content: 'Upon receipt of consignments, the Buyer is responsible for conducting an immediate physical count and outer carton inspection.',
        keyPoints: [
          'Visible transit damages, crushed cartons, or broken seals must be recorded on the Delivery Challan (POD) at the time of delivery.',
          'Concealed damage or internal product defect claims must be formally lodged within 48 hours of delivery.',
          'Claims reported after 48 hours without delivery challan endorsement will not be eligible for freight transit reimbursement.'
        ]
      },
      {
        id: 'expired-docket',
        number: '3',
        heading: 'Expired Products Claim & Replacement Docket',
        content: 'To support retail partners with stock rotation, we maintain a dedicated Expired Stock Replacement Docket during order checkout and field representative audits.',
        keyPoints: [
          'Buyers may log expired FMCG products during checkout by selecting Brand, Product Title, Expired Quantity, and Batch No / Expiry Date.',
          'The logged claim is automatically formatted into an official "EXPIRED PRODUCTS REPLACEMENT / CREDIT ADJUSTMENT DOCKET" on the generated invoice.',
          'Eligible expired stock is picked up during the subsequent delivery run and credited against the invoice ledger after warehouse verification.'
        ]
      },
      {
        id: 'damaged-return-docket',
        number: '4',
        heading: 'Goods Return & Damage Inspection Docket',
        content: 'Our system allows structured logging of damaged or exchange-eligible goods under standardized return reason categories.',
        keyPoints: [
          'Standard Return Categories: Packaging Damaged / Crushed Box, Seal Broken / Liquid Leakage, Near Expiry / Retailer Rotation, Slow Moving Stock Exchange, Wrong SKU Delivered Previously, Customer Return / Quality Issue.',
          'Items are printed on the invoice in the "DAMAGED & RETURN GOODS INSPECTION DOCKET" with physical verification by our field representative.',
          'Physical units must be handed over in original retail packaging with legible batch codes.'
        ]
      },
      {
        id: 'settlement-credit',
        number: '5',
        heading: 'Replacement Fulfillment & GST Credit Notes',
        content: 'Once returned or expired goods are inspected and verified by our Quality Assurance team in Kanpur, settlement is processed via one of the following methods:',
        keyPoints: [
          'Direct Physical Replacement: Fresh OEM batch stock delivered in the next scheduled delivery route.',
          'GST Tax Credit Note: Official Credit Note issued under Section 34 of the CGST Act, adjusting the outstanding trade ledger balance.',
          'Ledger Adjustment: Automatic credit adjustment against future wholesale supply orders.'
        ],
        alertNote: 'Cash refunds are not issued for wholesale trade accounts; all adjustments are executed via official GST Credit Notes or fresh stock replacements.'
      },
      {
        id: 'non-returnable',
        number: '6',
        heading: 'Non-Returnable Items & Invalidation Conditions',
        content: 'Returns and replacement claims will be rejected under the following conditions:',
        keyPoints: [
          'Products showing signs of improper retail storage (e.g. chocolate bloom from excessive direct sunlight exposure or dairy spoilage from non-refrigeration).',
          'Items with scratched, defaced, or obliterated MRP tags, bar codes, or batch numbers.',
          'Partial open blister packs or items returned without primary protective carton wraps.',
          'Stock sourced from third-party unauthorized grey market channels not matching our delivery invoice records.'
        ]
      },
      {
        id: 'claim-desk',
        number: '7',
        heading: 'Claims & Return Logistics Desk',
        content: 'To initiate a replacement claim, request an inspection pick-up, or follow up on a GST Credit Note, contact our Kanpur Claims Desk:',
        keyPoints: [
          'Email: anujenterprises.fmcg.006@gmail.com (Subject: Return Claim - [Invoice #])',
          'Claims Hotline: +91 88876 83782 / +91 70719 79894',
          'WhatsApp Claims Assistant: +91 88876 83782',
          'Physical Inspection Depot: Central Dispatch Hub, Kanpur, Uttar Pradesh — 208001'
        ]
      }
    ]
  }
};
