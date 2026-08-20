import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, FileText, Share2, Printer, Download, ArrowRight, 
  Clock, Truck, DollarSign, Building2, ShoppingBag, X, MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OrderSuccessModal = ({ isOpen, onClose, order }) => {
  const { openInvoiceModal, navigateTo, showToast } = useApp();

  if (!isOpen || !order) return null;

  const invoiceNumber = order.invoiceNumber || order.id || 'AE-2026-000001';
  const orderId = order.orderId || order.id || 'ORD-2026-000001';

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*ANUJ ENTERPRISES - ORDER CONFIRMATION*\n\n` +
      `*Order ID:* ${orderId}\n` +
      `*Invoice Number:* ${invoiceNumber}\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Classification:* ${order.customerType || 'Normal Customer'}\n` +
      `*Total Quantity:* ${order.totalQuantity || order.items?.reduce((a, b) => a + (b.qty || 0), 0)} Units\n` +
      `*Collection Status:* Offline Collection (Pending)\n\n` +
      `Thank you for partnering with Anuj Enterprises! Support: +91 98200 11223`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    showToast('Opening WhatsApp to share order summary...', 'info');
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
                  Tax invoice generated. Inventory automatically reserved.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-xs">
            {/* Key Order Identifier Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Order Reference
                </span>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white block truncate">
                  {orderId}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Tax Invoice #
                </span>
                <span className="text-xs font-mono font-black text-brand-900 dark:text-brand-400 block truncate">
                  {invoiceNumber}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-1">
                  Collection Status
                </span>
                <span className="text-xs font-black text-amber-800 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> PENDING (Offline)
                </span>
              </div>
            </div>

            {/* Customer & Classification Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500">B2B Account / Customer:</span>
                <strong className="text-slate-900 dark:text-white font-extrabold">{order.customerName}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500">Customer Classification:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-100 text-brand-900 uppercase">
                  {order.customerType || 'NORMAL CUSTOMER'}
                </span>
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
                Fulfillment & Collection Next Steps
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
                  <strong className="block text-slate-900 dark:text-white text-xs">Offline Settlement</strong>
                  <p className="text-[10px] text-slate-500">
                    Invoice collection completed on delivery handover.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleViewInvoice}
                className="flex-1 py-3 px-4 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>View Full GST Invoice</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
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
