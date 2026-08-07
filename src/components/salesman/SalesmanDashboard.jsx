import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, FileText, Download, Eye, 
  Search, Calendar, ArrowUpRight, ShieldCheck, User, LogOut, TrendingUp, DollarSign 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../../context/AppContext';

export const SalesmanDashboard = () => {
  const { user, orders, openInvoiceModal, logout, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'invoices' | 'history'
  const [searchQuery, setSearchQuery] = useState('');

  const chartData = [
    { month: 'Mar', volume: 18.2 },
    { month: 'Apr', volume: 24.5 },
    { month: 'May', volume: 31.0 },
    { month: 'Jun', volume: 28.4 },
    { month: 'Jul', volume: 42.1 },
    { month: 'Aug', volume: 48.5 },
  ];

  const salesmanOrders = orders.filter(o => o.salesmanId === (user.salesmanId || 'SLS-101') || true);

  const filteredOrders = salesmanOrders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
  });

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase">
                  Verified B2B Account Manager
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {user.salesmanId || 'SLS-101'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {user.name || "Vikram Malhotra"}
              </h1>
              <p className="text-xs text-slate-300">
                Region: {user.region || "West India (Mumbai Corporate HQ)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('catalogue')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" /> Create New B2B Quote
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Dashboard Tabs & Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-brand-900 text-white dark:bg-brand-600 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'invoices'
                ? 'bg-brand-900 text-white dark:bg-brand-600 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tax Invoices ({salesmanOrders.length})
          </button>
        </div>

        {/* Content Views */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Today's Purchase Volume
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block">
                  ₹ 1,40,302
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs yesterday
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Monthly Purchase Volume
                </span>
                <span className="text-2xl font-black text-brand-900 dark:text-brand-400 block">
                  ₹ 48,50,000
                </span>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mt-1">
                  Target: ₹ 50 Lakhs (97% achieved)
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Completed Invoices
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block">
                  {salesmanOrders.length} Invoices
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                  100% Tax Credit Verified
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Commission Tier
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                  Platinum (2.5%)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                  Estimated Payout: ₹1,21,250
                </span>
              </div>
            </div>

            {/* Purchase Volume Chart & Recent Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Recharts Bar Chart */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Monthly Purchase Volume Trend (in ₹ Lakhs)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Recent Invoice List */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Recent B2B Tax Invoices
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {salesmanOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-xs text-brand-900 dark:text-brand-400 block">{order.id}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[12rem]">{order.customerName}</span>
                        <span className="text-[10px] text-slate-400">{order.date} • {order.items.length} Items</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block">₹{order.grandTotal.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => openInvoiceModal(order)}
                          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 justify-end mt-1"
                        >
                          View <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            
            {/* Search Filter */}
            <div className="flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Invoice # or Customer Name..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer Company</th>
                    <th className="py-3 px-4 text-center">Items</th>
                    <th className="py-3 px-4 text-right">Grand Total (GST)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-900 dark:text-brand-400">{order.id}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{order.date}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{order.customerName}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{order.items.length} Products</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">₹{order.grandTotal.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => openInvoiceModal(order)}
                          className="px-3 py-1 bg-brand-900 hover:bg-brand-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Printable Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
