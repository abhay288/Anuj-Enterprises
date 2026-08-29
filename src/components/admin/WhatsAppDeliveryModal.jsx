import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageSquare, Truck, Send, Phone, MapPin, Calendar, 
  Clock, ShieldCheck, CheckCircle2, Copy, AlertCircle, Sparkles,
  Package, User, FileText, ExternalLink
} from 'lucide-react';
import { 
  cleanWhatsAppPhone, 
  generateDeliveryWhatsAppMessage, 
  sendDeliveryWhatsAppNotification 
} from '../../utils/deliveryNotificationUtils';

export const WhatsAppDeliveryModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onStatusUpdate, 
  showToast 
}) => {
  if (!isOpen || !order) return null;

  const invoiceNumber = order.invoiceNumber || order.id || 'AE-2026-000001';
  const rawCustomerMobile = (order.customerMobile || order.customerPhone || order.phone || '').replace('+91', '').trim();

  const [customerMobile, setCustomerMobile] = useState(rawCustomerMobile);
  const [driverName, setDriverName] = useState('Anuj Enterprises Express Fleet');
  const [driverPhone, setDriverPhone] = useState('+91 88876 83782');
  const [vehicleNo, setVehicleNo] = useState('UP-78 Kanpur Central Dispatch');
  const [estimatedTime, setEstimatedTime] = useState('Within 2 Hours (Today)');
  const [customNote, setCustomNote] = useState('');
  const [autoUpdateStatus, setAutoUpdateStatus] = useState(true);

  useEffect(() => {
    if (order) {
      setCustomerMobile((order.customerMobile || order.customerPhone || order.phone || '').replace('+91', '').trim());
      setDriverName(order.salesmanName ? `${order.salesmanName} (Sales & Logistics)` : 'Central Logistics Fleet');
      setDriverPhone(order.salesmanPhone || '+91 88876 83782');
    }
  }, [order]);

  const customPayload = {
    customerMobile: customerMobile ? (customerMobile.startsWith('+91') ? customerMobile : `+91 ${customerMobile}`) : '',
    driverName,
    driverPhone,
    vehicleNo,
    estimatedTime,
    customNote
  };

  const previewMessage = generateDeliveryWhatsAppMessage(order, customPayload);
  const cleanPhone = cleanWhatsAppPhone(customPayload.customerMobile);

  const handleSendWhatsApp = () => {
    // 1. Optionally update status in database and state to OUT_FOR_DELIVERY
    if (autoUpdateStatus && onStatusUpdate) {
      onStatusUpdate(order.id || order.orderId || order.invoiceNumber, 'OUT_FOR_DELIVERY');
    }

    // 2. Open WhatsApp Web / App
    sendDeliveryWhatsAppNotification(order, customPayload, showToast);

    // 3. Close modal
    onClose();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(previewMessage);
    if (showToast) showToast('Delivery WhatsApp message copied to clipboard!', 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden my-6 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white tracking-tight">
                    WhatsApp Delivery Notification
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-100 font-extrabold text-[10px] uppercase border border-emerald-400/30">
                    Live Dispatch
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-medium">
                  Direct customer notification for Invoice <span className="font-bold text-white font-mono">{invoiceNumber}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-emerald-100 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs">
            
            {/* Customer & Order Summary Banner */}
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{order.customerName || 'Valued Retailer'}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  📍 {order.customerAddress || 'Kanpur Store'}, {order.customerCity || 'Kanpur'} • {order.totalQuantity || 0} Total Units
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-xl text-[10px] shrink-0 shadow-xs">
                {order.items?.length || 0} SKUs
              </span>
            </div>

            {/* Config Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Customer WhatsApp Number */}
              <div>
                <label className="block font-extrabold uppercase text-[10px] text-slate-700 dark:text-slate-300 mb-1">
                  Customer Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">+91</span>
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {cleanPhone ? `Target: +${cleanPhone}` : '⚠️ Please enter 10-digit mobile number'}
                </span>
              </div>

              {/* Estimated Delivery Time */}
              <div>
                <label className="block font-extrabold uppercase text-[10px] text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Arrival Time
                </label>
                <select
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  <option value="Today (In-Transit)">🚚 Today (In-Transit)</option>
                  <option value="Within 1 Hour (Urgent)">⚡ Within 1 Hour (Urgent)</option>
                  <option value="Within 2 Hours (Standard)">🕒 Within 2 Hours (Standard)</option>
                  <option value="By 2:00 PM Today">☀️ By 2:00 PM Today</option>
                  <option value="By 6:00 PM Today">🌆 By 6:00 PM Today</option>
                  <option value="Tomorrow Morning">🌅 Tomorrow Morning</option>
                </select>
              </div>

              {/* Delivery Executive / Driver */}
              <div>
                <label className="block font-extrabold uppercase text-[10px] text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Representative
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              {/* Executive Contact / Helpline */}
              <div>
                <label className="block font-extrabold uppercase text-[10px] text-slate-700 dark:text-slate-300 mb-1">
                  Rep Contact / Phone
                </label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+91 88876 83782"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                />
              </div>

              {/* Special Instructions (Optional) */}
              <div className="sm:col-span-2">
                <label className="block font-extrabold uppercase text-[10px] text-slate-700 dark:text-slate-300 mb-1">
                  Custom Dispatch Note (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Keep store receiving seal ready"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Auto Update Status Checkbox */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoUpdateStatus}
                  onChange={(e) => setAutoUpdateStatus(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Automatically set Order Status to 🚚 <strong className="text-emerald-600 dark:text-emerald-400 font-black">"Out For Delivery"</strong>
                </span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">Updates Live Database</span>
            </div>

            {/* WhatsApp Live Bubble Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase text-[10px] flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-emerald-500" />
                  Live WhatsApp Message Preview:
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy Text
                </button>
              </div>

              <div className="p-4 bg-[#e5ddd5] dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 font-sans text-slate-900 dark:text-slate-100 text-[11px] whitespace-pre-wrap leading-relaxed shadow-inner max-h-48 overflow-y-auto">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-800">
                  {previewMessage}
                </div>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Send WhatsApp & Dispatch</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
