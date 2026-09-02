import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, ShoppingBag, PackagePlus, 
  Check, Trash2, X, Clock, History, Search, 
  Archive, ArrowLeft 
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
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'history'
  const [historySearch, setHistorySearch] = useState('');

  // Strict restriction: Notifications are only available for Admin
  if (user?.role !== 'admin' && role !== 'ADMIN') {
    return null;
  }

  // Filter active notifications for active role
  const safeNotifs = Array.isArray(notifications) ? notifications : (Array.isArray(notifications?.active) ? notifications.active : []);
  const safeHist = Array.isArray(notificationHistory) ? notificationHistory : [];

  const roleNotifications = safeNotifs.filter(n => {
    if (!n) return false;
    if (!n.targetRole) return true;
    return n.targetRole === role || n.targetRole === 'ALL';
  });

  // Filter history notifications for active role
  const roleHistory = safeHist.filter(n => {
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
      {/* Single Clean Bell Button in Navbar */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setViewMode('active');
        }}
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

      {/* Main Notification Panel */}
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
              className="absolute right-0 mt-3 w-84 sm:w-96 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 z-50 overflow-hidden text-xs"
            >
              {/* ================= MODE 1: ACTIVE NOTIFICATIONS VIEW ================= */}
              {viewMode === 'active' && (
                <div>
                  {/* Header Bar */}
                  <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-extrabold text-sm truncate">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] whitespace-nowrap shrink-0 inline-flex items-center justify-center shadow-xs">
                          {unreadCount} New
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-extrabold transition-colors px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 whitespace-nowrap"
                          title="Mark all as read"
                        >
                          <Check className="w-3 h-3" /> Mark Read
                        </button>
                      )}
                      {roleNotifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] text-slate-300 hover:text-rose-400 flex items-center gap-1 font-bold transition-colors px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg whitespace-nowrap"
                          title="Move active notifications to 10-day History"
                        >
                          <Trash2 className="w-3 h-3" /> Clear All
                        </button>
                      )}
                      <button 
                        onClick={() => setIsOpen(false)} 
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Active Notification List */}
                  <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                    {roleNotifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 space-y-2">
                        <Clock className="w-8 h-8 text-amber-500 mx-auto opacity-80" />
                        <p className="font-bold text-white text-xs">No active notifications</p>
                        <p className="text-[11px] text-slate-400">
                          Notifications are cleared or auto-archived to history after 7 days.
                        </p>
                      </div>
                    ) : (
                      roleNotifications.map((notif) => {
                        const isNewOrder = notif.type === 'NEW_ORDER';
                        const isBulk = notif.type === 'BULK_UPDATE';

                        return (
                          <div
                            key={notif.id}
                            className={`p-3.5 rounded-2xl flex items-start gap-3 border transition-colors group relative ${
                              !notif.isRead 
                                ? 'bg-amber-950/40 border-amber-500/30 hover:bg-amber-950/60' 
                                : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70'
                            }`}
                          >
                            <div 
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer ${
                                isNewOrder 
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                  : isBulk 
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
                                <strong className="text-white font-extrabold truncate block text-xs">
                                  {notif.title}
                                </strong>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-300 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                                {formatTimestamp(notif.timestamp)}
                              </span>
                            </div>

                            {/* Clear Button (Moves item to History) */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notif.id);
                              }}
                              className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-all shrink-0 self-center"
                              title="Move to History"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Bottom Footer Section Inside Notification Panel: View Notification History Option */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
                    <button
                      type="button"
                      onClick={() => setViewMode('history')}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-300 font-extrabold text-xs rounded-xl border border-amber-500/30 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <History className="w-4 h-4 text-amber-400" />
                      <span>View Notification History (Last 10 Days) ({roleHistory.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ================= MODE 2: NOTIFICATION HISTORY LOG VIEW (INSIDE PANEL) ================= */}
              {viewMode === 'history' && (
                <div className="flex flex-col max-h-96">
                  {/* History View Header Bar with Back Button */}
                  <div className="p-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode('active')}
                      className="text-amber-400 hover:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <History className="w-4 h-4 text-amber-400" />
                      <span className="font-extrabold text-xs">Notification History (10d)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {roleHistory.length > 0 && (
                        <button
                          onClick={clearNotificationHistory}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-extrabold px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 rounded-lg border border-rose-500/30 transition-colors flex items-center gap-1"
                          title="Purge History"
                        >
                          <Trash2 className="w-3 h-3" /> Purge
                        </button>
                      )}
                      <button 
                        onClick={() => setIsOpen(false)} 
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* History Search Bar */}
                  <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        placeholder="Search history log..."
                        className="w-full pl-8 pr-12 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      {historySearch && (
                        <button
                          onClick={() => setHistorySearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {filteredHistory.length} Saved
                    </span>
                  </div>

                  {/* History Items Container */}
                  <div className="max-h-72 overflow-y-auto p-3 space-y-2 divide-y divide-slate-800/80">
                    {filteredHistory.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 space-y-2">
                        <Archive className="w-8 h-8 text-amber-500/60 mx-auto" />
                        <p className="font-extrabold text-white text-xs">
                          No notification history in last 10 days
                        </p>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                          Cleared notifications & active items older than 7 days appear here automatically.
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
                                  setIsOpen(false);
                                  openInvoiceModal(order);
                                }
                              }
                            }}
                            className="pt-2.5 first:pt-0 flex items-start gap-2.5 hover:bg-slate-800/60 p-2 rounded-2xl transition-colors cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-700">
                              {item.type === 'NEW_ORDER' ? <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <strong className="text-xs font-bold text-white truncate">
                                  {item.title}
                                </strong>
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                                  isAutoExpiry 
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {isAutoExpiry ? 'Auto (7d)' : 'Cleared'}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-300 line-clamp-2">
                                {item.message}
                              </p>

                              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-0.5">
                                <span>Logged: {notifDate}</span>
                                <span className="text-amber-400/80">10d Auto-Purge</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
