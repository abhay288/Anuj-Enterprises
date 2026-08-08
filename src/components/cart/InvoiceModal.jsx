import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, Share2, CheckCircle2, Building2, ShieldCheck, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InvoiceModal = () => {
  const { isInvoiceModalOpen, closeInvoiceModal, selectedInvoice, showToast } = useApp();

  if (!isInvoiceModalOpen || !selectedInvoice) return null;

  const inv = selectedInvoice;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast(`Downloading B2B Tax Invoice #${inv.id}.pdf...`, 'success');
  };

  const handleShare = () => {
    showToast(`Tax Invoice link copied to clipboard`, 'info');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Top Control Bar (Hidden on print) */}
          <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> B2B Tax Invoice Generated & Recorded
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Invoice
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>

              <button
                onClick={handleShare}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>

              <button
                onClick={closeInvoiceModal}
                className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable GST Tax Invoice Document */}
          <div id="printable-invoice" className="p-8 md:p-12 text-slate-900 bg-white space-y-8">
            
            {/* Header: Company & Invoice Type */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-8 h-8 text-brand-900" />
                  <span className="text-2xl font-black tracking-tight text-slate-900">ANUJ ENTERPRISES</span>
                </div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Your Trusted Industrial Supply Partner</p>
                <p className="text-[11px] text-slate-600 max-w-sm">
                  Anuj Tower, Plot 88, MIDC Central Avenue, Andheri East, Mumbai - 400093
                </p>
                <p className="text-[11px] text-slate-700 font-semibold">
                  GSTIN: <strong className="font-mono">27AAACA12341ZV</strong> | CIN: U74999MH2001PTC132900
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="px-3 py-1 bg-brand-950 text-white font-extrabold text-xs uppercase tracking-widest inline-block rounded">
                  TAX INVOICE
                </span>
                <h3 className="text-xl font-mono font-bold text-slate-900 pt-2">{inv.id}</h3>
                <p className="text-xs text-slate-600">Date: <strong>{inv.date}</strong></p>
                <p className="text-xs text-slate-600">Payment Terms: <strong>{inv.paymentMode}</strong></p>
              </div>
            </div>

            {/* B2B Metadata Grid */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-1">Billed To (Customer Details)</h4>
                <p className="font-bold text-slate-900 text-sm">{inv.customerName || "Premier Heavy Metal Fabricators Pvt Ltd"}</p>
              </div>

              <div className="text-right border-l border-slate-200 pl-6">
                <h4 className="font-extrabold uppercase tracking-wider text-slate-500 mb-1">Salesman & Dispatch Officer</h4>
                <p className="font-bold text-slate-900 text-sm">{inv.salesmanName || "Account Representative"} ({inv.salesmanId || "SLS-101"})</p>
                <p className="text-slate-600">Phone: {inv.salesmanPhone || "+91 98201 44512"}</p>
                <p className="text-slate-600">Dispatch Hub: Mumbai Central Warehouse</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-white uppercase font-extrabold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3">SKU / HSN</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Pricing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {inv.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{item.sku} / {item.hsn || '84672100'}</td>
                      <td className="py-3 px-3 text-center font-bold">{item.qty}</td>
                      <td className="py-3 px-3 text-right font-mono">Price On Request</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">Quote Pending</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-between items-start pt-4 border-t border-slate-200 text-xs">
              <div className="max-w-md space-y-2">
                <span className="font-extrabold uppercase tracking-wider text-slate-500 block">Terms & Conditions:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>Goods once sold with GST Tax Invoice carry full OEM Warranty.</li>
                  <li>Payment due strictly within 30 days for authorized B2B credit accounts.</li>
                  <li>Disputes subject to Mumbai Jurisdiction only.</li>
                </ol>
              </div>

              <div className="w-64 space-y-2 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">Price On Request</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax:</span>
                  <span className="font-mono font-bold">As per RFQ Slab</span>
                </div>
                <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-black text-sm text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-xs text-brand-900 uppercase">Quoted On RFQ</span>
                </div>
              </div>
            </div>

            {/* Signatures & Seal Placeholder */}
            <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-xs">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-brand-900 flex items-center justify-center p-2 text-[9px] font-black text-brand-900 uppercase tracking-widest opacity-80 rotate-[-12deg]">
                  Anuj Enterprises Corporate Seal
                </div>
                <p className="text-[10px] text-slate-500 font-bold">Digital GST Verified</p>
              </div>

              <div className="text-right space-y-4">
                <div className="h-10 border-b border-slate-900 w-48 ml-auto flex items-end justify-center font-serif italic text-slate-700 text-sm">
                  Anuj Sharma (MD)
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
