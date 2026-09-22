import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Eye, ShieldCheck, LogOut, RefreshCw, ShoppingCart, Calendar, Store, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { orderService } from '../../services/orderService';

export const SalesmanDashboard = () => {
  const { 
    user, 
    orders, 
    refreshOrders,
    openInvoiceModal, 
    logout, 
    navigateTo, 
    showToast 
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrdersFromBackend = async () => {
    setIsRefreshing(true);
    try {
      if (refreshOrders) {
        await refreshOrders();
      } else {
        await orderService.getOrders();
      }
    } catch (err) {
      console.warn('Failed to load orders from backend:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrdersFromBackend();
  }, []);

  const activeSalesmanId = (user?.salesmanId || user?.id || '').toUpperCase().trim();
  const activeSalesmanName = (user?.name || '').toLowerCase().trim();

  // Deduplicate orders by id/invoiceNumber
  const allOrders = useMemo(() => {
    const list = orders || [];
    const map = new Map();
    list.forEach(o => {
      const key = o.id || o.invoiceNumber || o._id;
      if (key && !map.has(key)) {
        map.set(key, o);
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Filter invoices strictly belonging to this logged-in Salesman
  const salesmanInvoices = useMemo(() => {
    return allOrders.filter(o => {
      if (user?.role === 'admin') return true;
      const sId = (o.salesmanId || o.generatedById || '').toUpperCase().trim();
      const sName = (o.salesmanName || o.generatedByName || '').toLowerCase().trim();
      const role = (o.generatedByRole || '').toLowerCase().trim();

      if (activeSalesmanId && sId === activeSalesmanId) return true;
      if (activeSalesmanName && sName === activeSalesmanName) return true;
      if (role === 'salesman' && (!sId || sId === activeSalesmanId)) return true;
      return false;
    });
  }, [allOrders, activeSalesmanId, activeSalesmanName, user?.role]);

  return (
    <div className="py-6 sm:py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase">
                  Sales Representative
                </span>
                {activeSalesmanId && (
                  <span className="text-xs text-slate-300 font-mono font-bold">
                    ID: {activeSalesmanId}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {user?.name || "Salesman"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigateTo('catalogue')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" /> Create Invoice
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* Total Number of Invoices Generated Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Total Invoices Generated
              </span>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {salesmanInvoices.length}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              fetchOrdersFromBackend();
              showToast('Refreshed invoices from database', 'info');
            }}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl transition-all"
            title="Refresh Invoices"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Invoices List / Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" /> Generated Invoices
            </h2>
            <span className="text-xs font-bold text-slate-500">
              {salesmanInvoices.length} Record{salesmanInvoices.length === 1 ? '' : 's'}
            </span>
          </div>

          {salesmanInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p>No invoices generated yet.</p>
              <button
                onClick={() => navigateTo('products')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-extrabold text-xs shadow hover:bg-amber-400 transition-all"
              >
                <span>Start New Invoice</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Invoice Date</th>
                    <th className="py-3 px-4">Customer / Shop Name</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {salesmanInvoices.map((inv, index) => {
                    const invoiceNumber = inv.invoiceNumber || inv.id || `AE-${index + 1}`;
                    const invoiceDate = inv.date || (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-GB') : 'N/A');
                    const customerName = inv.customerName || 'Valued Buyer';

                    return (
                      <tr 
                        key={inv.id || inv._id || index}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{invoiceDate}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{customerName}</span>
                          </div>
                          {inv.description && (
                            <p className="text-[10px] text-slate-500 font-normal italic mt-0.5 line-clamp-1">
                              📝 {inv.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openInvoiceModal(inv)}
                            className="px-3.5 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow transition-all hover:scale-105"
                            title="View Invoice"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>View Invoice</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
