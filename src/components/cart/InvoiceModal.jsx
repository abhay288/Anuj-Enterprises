import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Download, Share2, CheckCircle2, Building2, 
  ShieldCheck, FileText, AlertCircle, MessageSquare, Mail, Copy,
  Zap, AlertOctagon, RotateCcw, Calendar, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { shareInvoicePDFToWhatsApp, generateInvoicePDF } from '../../utils/pdfGenerator';

export const InvoiceModal = () => {
  const { isInvoiceModalOpen, closeInvoiceModal, selectedInvoice, showToast } = useApp();

  if (!isInvoiceModalOpen || !selectedInvoice) return null;

  const inv = selectedInvoice;
  const invoiceNumber = inv.invoiceNumber || inv.id || 'AE-2026-000001';

  const getInvoiceDateInfo = (order) => {
    let dateObj;
    if (order.timestamp) {
      dateObj = new Date(order.timestamp);
    } else if (order.date) {
      dateObj = new Date(order.date.includes('T') ? order.date : `${order.date}T12:00:00`);
    } else {
      dateObj = new Date();
    }
    
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }

    const dayName = order.day || dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = order.time || dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const isoTimestamp = order.timestamp || dateObj.toISOString();

    return { dayName, formattedDate, formattedTime, isoTimestamp };
  };

  const invoiceDateInfo = getInvoiceDateInfo(inv);

  const handlePrint = () => {
    try {
      const invoiceContent = document.getElementById('printable-invoice');
      if (!invoiceContent) {
        window.print();
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${invoiceNumber}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @page { size: A4 portrait; margin: 10mm; }
              body { background: white !important; color: black !important; font-family: system-ui, -apple-system, sans-serif; padding: 15px; }
              .no-print { display: none !important; }
              .invoice-logo-container { width: 44px !important; height: 44px !important; max-width: 44px !important; max-height: 44px !important; min-width: 44px !important; min-height: 44px !important; flex-shrink: 0 !important; }
              .invoice-logo-img { max-width: 100% !important; max-height: 100% !important; width: auto !important; height: auto !important; object-fit: contain !important; }
            </style>
          </head>
          <body>
            ${invoiceContent.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      showToast(`Preparing print document for Invoice #${invoiceNumber}...`, 'info');

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 400);
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  const handleDownload = () => {
    try {
      const { doc, filename } = generateInvoicePDF(inv);
      doc.save(filename);
      showToast(`Downloaded PDF "${filename}" successfully!`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Downloading document view...', 'info');
      window.print();
    }
  };

  const handleShareWhatsApp = async () => {
    await shareInvoicePDFToWhatsApp(inv, showToast);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]"
        >
          {/* Action Bar (Not Printed) */}
          <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0 no-print">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300">
                Official FMCG Sales Invoice #{invoiceNumber}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow"
                title="Print Invoice"
              >
                <Printer className="w-4 h-4" /> <span>Print Invoice</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Download PDF"
              >
                <Download className="w-4 h-4" /> <span>Download PDF</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow"
                title="Share via WhatsApp"
              >
                <MessageSquare className="w-4 h-4" /> <span>WhatsApp</span>
              </button>
              
              <button
                onClick={closeInvoiceModal}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow ml-1"
                title="Close invoice"
              >
                <X className="w-4 h-4" /> <span>Close</span>
              </button>
            </div>
          </div>

          {/* Printable Sales Invoice Document (Independently Scrollable) */}
          <div id="printable-invoice" className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 text-slate-900 bg-white space-y-6 sm:space-y-8">
            
            {/* Header: Company Logo, Brand Name & Address */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 invoice-logo-container rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0 border-2 border-amber-400">
                    <img src="/logo.png" alt="Anuj Enterprises" className="w-full h-full object-contain invoice-logo-img" />
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
                  OFFICIAL PRODUCT INVOICE
                </span>
                <h3 className="text-xl font-mono font-black text-slate-900 pt-0.5">{invoiceNumber}</h3>
                
                <div className="text-xs text-slate-700 space-y-0.5 pt-1 border-t border-slate-200">
                  <div className="flex items-center justify-end gap-1.5 font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{invoiceDateInfo.dayName}, {invoiceDateInfo.formattedDate}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-slate-600 font-semibold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Time: {invoiceDateInfo.formattedTime}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Timestamp: {invoiceDateInfo.isoTimestamp}
                  </div>
                </div>
              </div>
            </div>

            {/* B2B Customer & Shop Owner Information Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-500 text-[10px]">Shop & Buyer Details</h4>
                <p className="font-extrabold text-slate-900 text-sm">{inv.customerName}</p>
                {inv.customerMobile && <p className="text-slate-600">Contact: {inv.customerMobile}</p>}
                {inv.customerAddress && <p className="text-slate-600">Address: {inv.customerAddress}</p>}
                {inv.customerCity && <p className="text-slate-600">Location: {inv.customerCity}, {inv.customerState || 'Uttar Pradesh'}</p>}
              </div>

              <div className="md:text-right border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 space-y-1">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-500 text-[10px]">Shop Owner & Route Details</h4>
                <p className="font-extrabold text-slate-900 text-sm">
                  {inv.shopOwnerName || inv.salesmanName || "Shop Owner"}
                </p>
                <p className="text-slate-800 font-semibold">
                  Shop Owner Area: <strong>{inv.shopOwnerArea || inv.salesmanArea || "South Kanpur Central"}</strong>
                </p>
                {(inv.shopRoute || inv.salesmanRoute) && (
                  <p className="text-slate-800 font-semibold">
                    Shop Route: <strong>{inv.shopRoute || inv.salesmanRoute}</strong>
                  </p>
                )}
                <div className="pt-1 flex items-center md:justify-end gap-2 text-xs">
                  <span className="font-bold text-slate-600">Payment Method:</span>
                  <span className={`px-2.5 py-0.5 font-black text-[10px] rounded uppercase shadow-sm ${
                    (inv.paymentMethod || inv.paymentMode || 'Cash').toUpperCase().includes('CREDIT')
                      ? 'bg-purple-600 text-white'
                      : (inv.paymentMethod || inv.paymentMode || 'Cash').toUpperCase().includes('ONLINE')
                      ? 'bg-blue-600 text-white'
                      : (inv.paymentMethod || inv.paymentMode || 'Cash').toUpperCase().includes('SPECIAL')
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {inv.paymentMethod || inv.paymentMode || 'Cash'}
                  </span>
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
                        {item.qty} Units {item.isPriority && <span className="text-[10px] font-black text-amber-700 block">⚡ Urgent</span>}
                      </td>
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
                      <th className="py-1.5 px-2">Product & SKU</th>
                      <th className="py-1.5 px-2">MFD Date</th>
                      <th className="py-1.5 px-2 text-center">Expired Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-200/60 font-semibold text-[11px]">
                    {inv.expiredItems.map((ex, i) => (
                      <tr key={ex.id || i} className="hover:bg-red-100/40">
                        <td className="py-1.5 px-2 text-red-700">{i + 1}</td>
                        <td className="py-1.5 px-2 font-bold text-slate-900">{ex.company}</td>
                        <td className="py-1.5 px-2 text-slate-800">
                          <div>{ex.product}</div>
                          {ex.sku && <div className="text-[10px] text-slate-500 font-mono">SKU: {ex.sku}</div>}
                        </td>
                        <td className="py-1.5 px-2 text-slate-700 font-mono text-[10px]">
                          {ex.noDateAvailable ? 'No Date Available' : ex.mfdDate ? `MFD: ${ex.mfdDate}` : ex.batchOrNote || 'Undated'}
                        </td>
                        <td className="py-1.5 px-2 text-center font-black text-red-700">{ex.qty} Units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Damage Return Goods Docket (If recorded) */}
            {inv.returnItems && inv.returnItems.length > 0 && (
              <div className="space-y-2 p-3.5 rounded-xl border border-orange-200 bg-orange-50/40 text-xs">
                <div className="flex items-center gap-2 font-black text-orange-800 uppercase tracking-wide text-[11px]">
                  <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                  <span>GOODS RETURN & DAMAGE REPLACEMENT DOCKET ({inv.returnItems.length} ITEMS)</span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-orange-100/80 text-orange-900 uppercase font-extrabold text-[9px]">
                    <tr>
                      <th className="py-1.5 px-2">#</th>
                      <th className="py-1.5 px-2">Company / Brand</th>
                      <th className="py-1.5 px-2">Product & SKU</th>
                      <th className="py-1.5 px-2">Damage Reason</th>
                      <th className="py-1.5 px-2 text-center">Damage Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-200/60 font-semibold text-[11px]">
                    {inv.returnItems.map((rt, i) => (
                      <tr key={rt.id || i} className="hover:bg-orange-100/40">
                        <td className="py-1.5 px-2 text-orange-700">{i + 1}</td>
                        <td className="py-1.5 px-2 font-bold text-slate-900">{rt.company}</td>
                        <td className="py-1.5 px-2 text-slate-800">
                          <div>{rt.product}</div>
                          {rt.sku && <div className="text-[10px] text-slate-500 font-mono">SKU: {rt.sku}</div>}
                        </td>
                        <td className="py-1.5 px-2 text-orange-800 font-medium">
                          {rt.reason || 'Damaged Packaging'}
                        </td>
                        <td className="py-1.5 px-2 text-center font-black text-orange-700">{rt.qty} Units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary Totals */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Ordered Quantity:</span>
                  <span className="font-extrabold text-slate-900">{inv.totalQuantity || inv.items?.reduce((a, b) => a + (b.qty || 0), 0) || 0} Units</span>
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
