import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, FileText, Share2, Printer, Download, ArrowRight, 
  Clock, Truck, DollarSign, Building2, ShoppingBag, X, MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { shareInvoicePDFToWhatsApp, generateInvoicePDF } from '../../utils/pdfGenerator';

export const OrderSuccessModal = ({ isOpen, onClose, order }) => {
  const { openInvoiceModal, navigateTo, showToast } = useApp();

  if (!isOpen || !order) return null;

  const invoiceNumber = order.invoiceNumber || order.id || 'AE-2026-000001';
  const orderId = order.orderId || order.id || 'ORD-2026-000001';

  const handleShareWhatsApp = async () => {
    await shareInvoicePDFToWhatsApp(order, showToast);
  };

  const handleDownloadInvoicePDF = () => {
    try {
      const { doc, filename } = generateInvoicePDF(order);
      doc.save(filename);
      showToast(`Downloaded PDF "${filename}" successfully!`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Error generating PDF download', 'error');
    }
  };

  const handleViewInvoice = () => {
    onClose();
    openInvoiceModal(order);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 p-6 sm:p-8 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">
                  Order Acknowledged & Invoiced
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Order Successfully Placed!
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Product invoice generated. Inventory automatically reserved.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs">
            {/* Key Order Identifier Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Order Reference
                </span>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white block truncate">
                  {orderId}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                  Payment Method
                </span>
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase block truncate">
                  {order.paymentMethod || order.paymentMode || 'Cash'}
                </span>
              </div>
            </div>

            {/* Customer Details Card (Customer Classification removed per user request) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500">B2B Account / Customer:</span>
                <strong className="text-slate-900 dark:text-white font-extrabold">{order.customerName}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500">Total Booked Volume:</span>
                <strong className="text-slate-900 dark:text-white font-black text-sm">
                  {order.totalQuantity || order.items?.reduce((a, b) => a + (b.qty || 0), 0)} Units ({order.items?.length || 0} SKUs)
                </strong>
              </div>
            </div>

            {/* 3-Step Next Steps Roadmap */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Fulfillment & Dispatch Next Steps
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <strong className="block text-slate-900 dark:text-white text-xs">Order Booked</strong>
                  <p className="text-[10px] text-slate-500">
                    Recorded in warehouse ledger and stock reserved.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <strong className="block text-slate-900 dark:text-white text-xs">Warehouse Dispatch</strong>
                  <p className="text-[10px] text-slate-500">
                    Goods packed according to Pack/Case specifications.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-brand-900 text-white font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <strong className="block text-slate-900 dark:text-white text-xs">Delivery Handover</strong>
                  <p className="text-[10px] text-slate-500">
                    Invoice collection & stock delivery completed.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {/* Product Invoice Button (Renamed from View Full GST Invoice) */}
              <button
                type="button"
                onClick={handleViewInvoice}
                className="flex-1 py-3 px-4 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Product Invoice</span>
              </button>

              {/* Download Invoice Button */}
              <button
                type="button"
                onClick={handleDownloadInvoicePDF}
                className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>

              {/* Share WhatsApp Button */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigateTo('catalogue');
                }}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
