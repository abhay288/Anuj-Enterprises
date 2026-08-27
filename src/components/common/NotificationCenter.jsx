import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, AlertTriangle, ShoppingBag, 
  PackagePlus, Check, Trash2, X, ArrowRight, Clock, 
  History, Search, Archive, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationCenter = ({ role = 'ADMIN' }) => {
  const { 
    user,
    notifications = [], 
    notificationHistory = [],
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications, 
    clearNotificationHistory,
    openInvoiceModal,
    orders,
    navigateTo 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Strict restriction: Notifications are only available for Admin
  if (user?.role !== 'admin' && role !== 'ADMIN') {
    return null;
  }

  // Filter active notifications for active role
  const roleNotifications = notifications.filter(n => {
    if (!n) return false;
    if (!n.targetRole) return true;
    return n.targetRole === role || n.targetRole === 'ALL';
  });

  // Filter history notifications for active role
  const roleHistory = notificationHistory.filter(n => {
    if (!n) return false;
    if (!n.targetRole) return true;
    return n.targetRole === role || n.targetRole === 'ALL';
  });

  const unreadCount = roleNotifications.filter(n => !n.isRead).length;

  const filteredHistory = roleHistory.filter(h => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase().trim();
    return (
      (h.title && h.title.toLowerCase().includes(q)) ||
      (h.message && h.message.toLowerCase().includes(q)) ||
      (h.orderId && h.orderId.toLowerCase().includes(q)) ||
      (h.invoiceNumber && h.invoiceNumber.toLowerCase().includes(q))
    );
  });

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

  const formatTimestamp = (ts) => {
    if (!ts) return 'Recent';
    const dateObj = new Date(ts);
    if (isNaN(dateObj.getTime())) return 'Recent';
    return dateObj.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="relative">
      {/* Top Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center"
        title="Admin Notifications"
      >
        <Bell className="w-4 h-4 text-amber-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 rounded-full font-black text-[10px] flex items-center justify-center shadow animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Main Dropdown Panel */}
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
              className="absolute right-0 mt-3 w-84 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-xs"
            >
              {/* Header Bar */}
              <div className="p-4 bg-slate-950 text-white flex flex-col gap-2.5 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-extrabold text-sm">Admin Control Center</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub-header Actions Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-extrabold transition-colors px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20"
                        title="Mark all as read (Persists permanently)"
                      >
                        <Check className="w-3 h-3" /> Mark Read
                      </button>
                    )}
                    {roleNotifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-slate-300 hover:text-rose-400 flex items-center gap-1 font-bold transition-colors px-2 py-1 bg-slate-800 rounded-lg"
                        title="Move active notifications to 10-day History"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Notification History Button */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsHistoryOpen(true);
                    }}
                    className="text-[10px] bg-brand-900 hover:bg-brand-800 text-amber-300 font-extrabold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-400/30 transition-all shadow-sm"
                    title="View Notification History (Last 10 Days)"
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>Notification History ({roleHistory.length})</span>
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {roleNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 text-amber-500 mx-auto opacity-80" />
                    <p className="font-bold text-slate-800 dark:text-slate-200">No active notifications</p>
                    <p className="text-[11px] text-slate-500">
                      Notifications are cleared or auto-archived to history after 7 days.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setIsHistoryOpen(true);
                      }}
                      className="mt-2 text-amber-500 hover:underline font-extrabold text-[11px] inline-flex items-center gap-1"
                    >
                      <History className="w-3.5 h-3.5" /> View Notification History ({roleHistory.length})
                    </button>
                  </div>
                ) : (
                  roleNotifications.map((notif) => {
                    const isNewOrder = notif.type === 'NEW_ORDER';
                    const isBulk = notif.type === 'BULK_UPDATE';

                    return (
                      <div
                        key={notif.id}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors group relative ${
                          !notif.isRead ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <div 
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${
                            isNewOrder 
                              ? 'bg-brand-100 text-brand-900' 
                              : isBulk 
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isNewOrder && <ShoppingBag className="w-4 h-4" />}
                          {isBulk && <PackagePlus className="w-4 h-4" />}
                          {!isNewOrder && !isBulk && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        <div 
                          onClick={() => handleNotificationClick(notif)}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <strong className="text-slate-900 dark:text-white font-extrabold truncate block">
                              {notif.title}
                            </strong>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                            {formatTimestamp(notif.timestamp)}
                          </span>
                        </div>

                        {/* Individual Clear Button (Moves item to History) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notif.id);
                          }}
                          className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shrink-0"
                          title="Move to History"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NOTIFICATION HISTORY MODAL (LAST 10 DAYS FIFO LOG) */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[85vh]"
            >
              {/* History Modal Header */}
              <div className="p-5 bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight">Notification History (Last 10 Days)</h3>
                    <p className="text-[11px] text-amber-300 font-medium">
                      FIFO Queue Log • Items auto-archive after 7 days & purge after 10 days
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toolbar & Search Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search history by title, order, or invoice..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {historySearch && (
                    <button
                      onClick={() => setHistorySearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                    {filteredHistory.length} Logged Items
                  </span>

                  {roleHistory.length > 0 && (
                    <button
                      onClick={clearNotificationHistory}
                      className="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs rounded-xl border border-rose-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Purge History
                    </button>
                  )}
                </div>
              </div>

              {/* History Items Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredHistory.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Archive className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-extrabold text-slate-700 dark:text-slate-300 text-xs">
                      No notification history logged in the last 10 days
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Cleared notifications and active notifications older than 7 days appear here automatically.
                    </p>
                  </div>
                ) : (
                  filteredHistory.map((item) => {
                    const isAutoExpiry = item.archiveReason === 'AUTO_7_DAY_EXPIRY';
                    const notifDate = formatTimestamp(item.timestamp);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.orderId || item.invoiceNumber) {
                            const order = orders.find(o => o.id === item.orderId || o.invoiceNumber === item.invoiceNumber || o.orderId === item.orderId);
                            if (order) {
                              setIsHistoryOpen(false);
                              openInvoiceModal(order);
                            }
                          }
                        }}
                        className="pt-3 first:pt-0 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-950/40 p-2 rounded-2xl transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                          {item.type === 'NEW_ORDER' ? <ShoppingBag className="w-4 h-4 text-brand-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <strong className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.title}
                            </strong>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              isAutoExpiry 
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {isAutoExpiry ? 'Auto-Archived (7d)' : 'Cleared by Admin'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {item.message}
                          </p>

                          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                            <span>Logged: {notifDate}</span>
                            <span className="text-amber-600 dark:text-amber-400">10-Day Purge Window Active</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
