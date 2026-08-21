import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, AlertTriangle, ShoppingBag, 
  PackagePlus, Check, Trash2, X, ArrowRight, Clock 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationCenter = ({ role = 'ADMIN' }) => {
  const { 
    user,
    notifications = [], 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearAllNotifications, 
    openInvoiceModal,
    orders,
    navigateTo 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  // Strict restriction: Notifications are only available for Admin
  if (user?.role !== 'admin' && role !== 'ADMIN') {
    return null;
  }

  // Filter notifications for active role
  const roleNotifications = notifications.filter(n => {
    if (!n.targetRole) return true;
    return n.targetRole === role || n.targetRole === 'ALL';
  });

  const unreadCount = roleNotifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notif) => {
    markNotificationAsRead(notif.id);
    if (notif.orderId || notif.invoiceNumber) {
      const order = orders.find(o => o.id === notif.orderId || o.invoiceNumber === notif.invoiceNumber || o.orderId === notif.orderId);
      if (order) {
        openInvoiceModal(order);
        setIsOpen(false);
        return;
      }
    }
    if (notif.actionView) {
      const target = notif.actionView === 'admin' ? 'admin-dash' : notif.actionView;
      navigateTo(target);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 rounded-full font-black text-[10px] flex items-center justify-center shadow animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for outside click */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-xs"
            >
              {/* Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="font-extrabold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition-colors"
                      title="Mark all as read"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                  {roleNotifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 font-bold transition-colors"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {roleNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold">No new notifications</p>
                    <p className="text-[10px] text-slate-500">You're completely up to date.</p>
                  </div>
                ) : (
                  roleNotifications.map((notif) => {
                    const isNewOrder = notif.type === 'NEW_ORDER';
                    const isStockAlert = notif.type === 'LOW_STOCK' || notif.type === 'OUT_OF_STOCK';
                    const isBulk = notif.type === 'BULK_UPDATE';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-950/60 cursor-pointer transition-colors ${
                          !notif.isRead ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isNewOrder 
                            ? 'bg-brand-100 text-brand-900' 
                            : isStockAlert 
                            ? 'bg-red-100 text-red-700' 
                            : isBulk 
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isNewOrder && <ShoppingBag className="w-4 h-4" />}
                          {isStockAlert && <AlertTriangle className="w-4 h-4" />}
                          {isBulk && <PackagePlus className="w-4 h-4" />}
                          {!isNewOrder && !isStockAlert && !isBulk && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <strong className="text-slate-900 dark:text-white font-extrabold truncate block">
                              {notif.title}
                            </strong>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                            {notif.time || 'Just now'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
