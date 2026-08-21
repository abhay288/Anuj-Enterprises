import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Download, Share2, CheckCircle2, Building2, 
  ShieldCheck, FileText, AlertCircle, MessageSquare, Mail, Copy,
  Zap, AlertOctagon, RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InvoiceModal = () => {
  const { isInvoiceModalOpen, closeInvoiceModal, selectedInvoice, showToast } = useApp();

  if (!isInvoiceModalOpen || !selectedInvoice) return null;

  const inv = selectedInvoice;
  const invoiceNumber = inv.invoiceNumber || inv.id || 'AE-2026-000001';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate clean printable HTML wrapper for saving as document
    const invoiceContent = document.getElementById('printable-invoice');
    if (!invoiceContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sales_Invoice_${invoiceNumber}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @media print {
                body { padding: 20px; font-family: sans-serif; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body onload="window.print()">
            <div class="p-8 max-w-4xl mx-auto">
              ${invoiceContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      showToast(`Generating printable document for Invoice #${invoiceNumber}...`, 'success');
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*ANUJ ENTERPRISES - OFFICIAL TAX INVOICE*\n\n` +
      `*Invoice #:* ${invoiceNumber}\n` +
      `*Date:* ${inv.date || new Date().toISOString().split('T')[0]}\n` +
      `*Customer:* ${inv.customerName}\n` +
      `*Classification:* ${inv.customerType || 'Normal Customer'}\n` +
      `*Sales Representative:* ${inv.salesmanName || 'Rajesh Kumar'} (${inv.salesmanId || 'AE-SM-001'})\n` +
      `*Total Items:* ${inv.totalQuantity || inv.items?.reduce((a, b) => a + (b.qty || 0), 0)} Units\n` +
      `*Collection Status:* Offline Collection (Pending)\n\n` +
      `For queries, reach Anuj Enterprises Helpdesk at +91 (022) 6890-4400.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    showToast('Opening WhatsApp to share tax invoice...', 'info');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(
      `Anuj Enterprises Sales Invoice #${invoiceNumber} - Customer: ${inv.customerName} - Total: ${inv.totalQuantity || 0} Units - Status: PENDING COLLECTION`
    );
    showToast(`Invoice #${invoiceNumber} details copied to clipboard!`, 'success');
  };

  const handleEmailInvoice = () => {
    showToast(`Tax invoice #${invoiceNumber} dispatched to ${inv.customerEmail || 'customer billing email'}.`, 'success');
  };

  // Badge styling for Customer Classification
  const getCustomerTypeBadge = (type) => {
    if (type?.toUpperCase().includes('DAMAGE')) {
      return <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-extrabold text-[10px] uppercase">DAMAGE CUSTOMER</span>;
    }
    if (type?.toUpperCase().includes('EXPIRY')) {
      return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-extrabold text-[10px] uppercase">EXPIRY CUSTOMER</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-300 font-extrabold text-[10px] uppercase">NORMAL CUSTOMER</span>;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Top Control Bar (Hidden on print) */}
          <div className="no-print bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> B2B Sales Invoice Generated — Collection Pending
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Print full invoice document"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Download HTML / PDF format"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Share via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>

              <button
                onClick={handleEmailInvoice}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Dispatch email copy"
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>

              <button
                onClick={handleCopyLink}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                title="Copy details to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={closeInvoiceModal}
                className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Sales Invoice Document */}
          <div id="printable-invoice" className="p-8 md:p-12 text-slate-900 bg-white space-y-8">
            
            {/* Header: Company Logo, Brand Name & Address */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white p-1.5 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0 border-2 border-amber-400">
                    <img src="/logo.png" alt="Anuj Enterprises" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">ANUJ ENTERPRISES</span>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block -mt-0.5">
                      Your Trusted Supply Partner
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 max-w-sm pt-1">
                  Kanpur, Uttar Pradesh
                </p>
                <p className="text-[11px] text-slate-700 font-semibold">
                  Phone: +91 88876 83782 / +91 70719 79894 | Email: anujenterprises.fmcg.006@gmail.com
                </p>
              </div>

              <div className="text-right space-y-1.5">
                <span className="px-3 py-1 bg-brand-950 text-white font-extrabold text-xs uppercase tracking-widest inline-block rounded">
                  OFFICIAL TAX INVOICE
                </span>
                <h3 className="text-xl font-mono font-black text-slate-900 pt-1">{invoiceNumber}</h3>
                <p className="text-xs text-slate-600">Date: <strong>{inv.date || new Date().toISOString().split('T')[0]}</strong></p>
                <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-700 pt-1">
                  <span>Classification:</span>
                  {getCustomerTypeBadge(inv.customerType)}
                </div>
              </div>
            </div>

            {/* B2B Customer & Salesman Information Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-500 text-[10px]">Customer Details</h4>
                <p className="font-extrabold text-slate-900 text-sm">{inv.customerName}</p>
                <p className="text-slate-600">Contact: {inv.customerMobile || "+91 98200 11223"}</p>
                {inv.customerAddress && <p className="text-slate-600">Address: {inv.customerAddress}</p>}
                {inv.customerCity && <p className="text-slate-600">Location: {inv.customerCity}, {inv.customerState || 'Maharashtra'}</p>}
              </div>

              <div className="md:text-right border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 space-y-1">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-500 text-[10px]">Salesman & Collection Details</h4>
                <p className="font-extrabold text-slate-900 text-sm">
                  {inv.salesmanName || "Rajesh Kumar"} (ID: <span className="font-mono">{inv.salesmanId || "AE-SM-001"}</span>)
                </p>
                <p className="text-slate-600">Phone: {inv.salesmanPhone || "+91 98765 43210"}</p>
                <div className="pt-1 flex items-center md:justify-end gap-2 text-xs">
                  <span className="font-bold text-slate-600">Order Type:</span>
                  <span className="px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px] rounded uppercase">Offline Collection</span>
                </div>
                <div className="flex items-center md:justify-end gap-2 text-xs">
                  <span className="font-bold text-slate-600">Collection Status:</span>
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded uppercase">Pending</span>
                </div>
              </div>
            </div>

            {/* Itemized Invoice Table with Pack Specifications */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-white uppercase font-extrabold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Product Name & SKU</th>
                    <th className="py-2.5 px-3">Pack Info</th>
                    <th className="py-2.5 px-3 text-center">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {inv.items?.map((item, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50 ${item.isPriority ? 'bg-amber-50/70 border-l-4 border-amber-500' : ''}`}>
                      <td className="py-3 px-3 text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          {item.isPriority && (
                            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase rounded inline-flex items-center gap-0.5 shadow-sm border border-amber-500">
                              <Zap className="w-2.5 h-2.5 fill-slate-950" /> URGENT PRIORITY DISPATCH
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          SKU: {item.sku} | HSN: {item.hsn || '19053100'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[10px] text-slate-600 space-y-0.5">
                        {item.packSize && <div>Pack: <strong>{item.packSize}</strong></div>}
                        {item.bundleSize && <div>Bundle: <strong>{item.bundleSize}</strong></div>}
                        {item.caseSize && <div className="text-amber-800 font-bold">Case: {item.caseSize}</div>}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-sm">
                        {item.qty} {item.isPriority && <span className="text-[10px] font-black text-amber-700 block">⚡ Urgent</span>}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">Price On Request</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-brand-900">Quote Pending</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expired Products Return / Replacement Docket (If recorded) */}
            {inv.expiredItems && inv.expiredItems.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-xl border border-red-200 bg-red-50/40 text-xs">
                <div className="flex items-center gap-2 font-black text-red-800 uppercase tracking-wide text-[11px]">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                  <span>EXPIRED PRODUCTS REPLACEMENT / CREDIT ADJUSTMENT DOCKET ({inv.expiredItems.length} ITEMS)</span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-red-100/80 text-red-900 uppercase font-extrabold text-[9px]">
                    <tr>
                      <th className="py-1.5 px-2">#</th>
                      <th className="py-1.5 px-2">Company / Brand</th>
                      <th className="py-1.5 px-2">Product Title</th>
                      <th className="py-1.5 px-2 text-center">Expired Qty</th>
                      <th className="py-1.5 px-2">Batch No / Expiry Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-200/60 font-medium text-[11px]">
                    {inv.expiredItems.map((exp, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 text-red-600 font-bold">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-bold text-red-950">{exp.company}</td>
                        <td className="py-1.5 px-2 text-slate-900">{exp.product}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-red-700">{exp.qty} Units</td>
                        <td className="py-1.5 px-2 text-slate-600 font-mono text-[10px]">{exp.batchOrNote || 'Expired Batch'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Damaged & Return Goods Docket (If recorded) */}
            {inv.returnItems && inv.returnItems.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-xl border border-orange-200 bg-orange-50/40 text-xs">
                <div className="flex items-center gap-2 font-black text-orange-800 uppercase tracking-wide text-[11px]">
                  <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                  <span>DAMAGED & RETURN GOODS INSPECTION DOCKET ({inv.returnItems.length} ITEMS)</span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-orange-100/80 text-orange-900 uppercase font-extrabold text-[9px]">
                    <tr>
                      <th className="py-1.5 px-2">#</th>
                      <th className="py-1.5 px-2">Company / Brand</th>
                      <th className="py-1.5 px-2">Product Title</th>
                      <th className="py-1.5 px-2 text-center">Return Qty</th>
                      <th className="py-1.5 px-2">Return Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-200/60 font-medium text-[11px]">
                    {inv.returnItems.map((ret, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 text-orange-600 font-bold">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-bold text-orange-950">{ret.company}</td>
                        <td className="py-1.5 px-2 text-slate-900">{ret.product}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-orange-700">{ret.qty} Units</td>
                        <td className="py-1.5 px-2 text-slate-700 font-bold text-[10px]">{ret.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary & Terms */}
            <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 text-xs gap-6">
              <div className="max-w-md space-y-2">
                <span className="font-extrabold uppercase tracking-wider text-slate-500 text-[10px] block">Terms & Conditions:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>Payment is offline and collection is marked as <strong>Pending</strong> upon booking.</li>
                  <li>Customer Classification ({inv.customerType || "Normal"}) determines returns & warranty terms.</li>
                  <li>Disputes subject to Kanpur Jurisdiction only.</li>
                </ol>
              </div>

              <div className="w-full sm:w-64 space-y-2 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Total Items Quantity:</span>
                  <span className="font-bold text-slate-900">{inv.totalQuantity || inv.items?.reduce((acc, i) => acc + (i.qty || 0), 0)} Units</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">Price On Request</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Applicable Charges:</span>
                  <span className="font-mono font-bold">Quoted on RFQ</span>
                </div>
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-black text-sm text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-xs text-brand-900 uppercase">Quoted On RFQ</span>
                </div>
              </div>
            </div>

            {/* Corporate Seal & Authorized Signature */}
            <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-xs">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-brand-900 flex items-center justify-center p-2 text-[9px] font-black text-brand-900 uppercase tracking-widest opacity-80 rotate-[-12deg]">
                  Anuj Enterprises Corporate Seal
                </div>
                <p className="text-[10px] text-slate-500 font-bold">Verified Corporate Seal</p>
              </div>

              <div className="text-right space-y-4">
                <div className="h-10 border-b border-slate-900 w-48 ml-auto flex items-end justify-center font-serif italic text-slate-700 text-sm font-bold">
                  ANUJ
                </div>
                <p className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Authorized Signatory</p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
