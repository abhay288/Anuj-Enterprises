import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, FileText, Download, Eye, 
  Search, Calendar, ArrowUpRight, ShieldCheck, User, LogOut, 
  TrendingUp, Filter, RefreshCw, Users, Plus, CheckCircle2, 
  RotateCcw, History, Store, Phone, MapPin, Tag, ArrowRight, 
  ShoppingCart, Package, Check, X, AlertCircle, Key, Zap, AlertOctagon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../../context/AppContext';
import { SalesmanPasswordModal } from './SalesmanPasswordModal';

export const SalesmanDashboard = () => {
  const { 
    user, 
    orders, 
    products, 
    customers, 
    cart, 
    addToCart, 
    updateCartQty, 
    removeFromCart, 
    clearCart,
    openInvoiceModal, 
    reorderPreviousOrder, 
    loadCustomerForOrder, 
    saveCustomer, 
    checkoutOrder, 
    logout, 
    navigateTo, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'field-order' | 'customers' | 'analytics'
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('All'); // 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom Date'
  const [customDate, setCustomDate] = useState('');

  // Customer Directory Search & State
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    classification: 'NORMAL',
    customerMode: 'QUICK'
  });

  // Field Order Form State
  const [fieldCustomer, setFieldCustomer] = useState({
    customerMode: 'quick',
    customerName: '',
    customerMobile: '',
    customerAddress: '',
    customerCity: 'Mumbai',
    customerState: 'Maharashtra',
    customerEmail: '',
    customerType: 'Normal Customer'
  });
  const [fieldProductSearch, setFieldProductSearch] = useState('');
  const [selectedFieldCategory, setSelectedFieldCategory] = useState('All');

  const activeSalesmanId = (user.salesmanId || 'AE-SM-001').toUpperCase();

  // Scoped Salesman Orders (Only orders belonging to this active representative)
  const myOrders = useMemo(() => {
    return orders.filter(o => {
      const sId = (o.salesmanId || '').toUpperCase();
      return sId === activeSalesmanId || user.role === 'admin';
    });
  }, [orders, activeSalesmanId, user.role]);

  // Real Database-Driven Salesman Performance Statistics (No Fake Data)
  const performanceStats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let todayOrdersCount = 0;
    let todayQuantity = 0;
    let weekOrdersCount = 0;
    let weekQuantity = 0;
    let monthOrdersCount = 0;
    let monthQuantity = 0;
    let totalLifetimeQuantity = 0;

    for (const order of myOrders) {
      const orderDate = new Date(order.date || order.createdAt);
      const totalUnits = order.totalQuantity || order.items?.reduce((acc, i) => acc + (i.qty || i.quantity || 0), 0) || 0;
      totalLifetimeQuantity += totalUnits;

      if (order.date === todayStr || orderDate.toDateString() === today.toDateString()) {
        todayOrdersCount++;
        todayQuantity += totalUnits;
      }
      if (orderDate >= sevenDaysAgo) {
        weekOrdersCount++;
        weekQuantity += totalUnits;
      }
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        monthOrdersCount++;
        monthQuantity += totalUnits;
      }
    }

    const monthlyTargetOrders = 50;
    const monthlyTargetUnits = 10000;
    const targetProgressOrders = Math.min(100, Math.round((monthOrdersCount / monthlyTargetOrders) * 100));
    const targetProgressUnits = Math.min(100, Math.round((monthQuantity / monthlyTargetUnits) * 100));

    return {
      todayOrdersCount,
      todayQuantity,
      weekOrdersCount,
      weekQuantity,
      monthOrdersCount,
      monthQuantity,
      totalOrdersCount: myOrders.length,
      totalLifetimeQuantity,
      monthlyTargetOrders,
      targetProgressOrders,
      targetProgressUnits
    };
  }, [myOrders]);

  // Scoped Customer Directory (Scoped to this representative)
  const myCustomers = useMemo(() => {
    return customers.filter(c => {
      const createdBy = (c.createdBy || '').toUpperCase();
      return createdBy === activeSalesmanId || user.role === 'admin' || !c.createdBy;
    });
  }, [customers, activeSalesmanId, user.role]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return myCustomers;
    const q = customerSearchQuery.toLowerCase().trim();
    return myCustomers.filter(c => 
      c.name.toLowerCase().includes(q) ||
      (c.mobile && c.mobile.includes(q)) ||
      (c.customerId && c.customerId.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  }, [myCustomers, customerSearchQuery]);

  // Filtered Orders Table by search & time
  const filteredOrders = useMemo(() => {
    return myOrders.filter(o => {
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchId = (o.id || '').toLowerCase().includes(q) || (o.invoiceNumber || '').toLowerCase().includes(q);
        const matchCust = (o.customerName || '').toLowerCase().includes(q);
        if (!matchId && !matchCust) return false;
      }

      const orderDate = new Date(o.date || o.createdAt);
      const today = new Date();

      if (timeFilter === 'Today') {
        return orderDate.toDateString() === today.toDateString();
      } else if (timeFilter === 'This Week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      } else if (timeFilter === 'This Month') {
        return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
      } else if (timeFilter === 'Custom Date' && customDate) {
        return o.date === customDate;
      }

      return true;
    });
  }, [myOrders, orderSearchQuery, timeFilter, customDate]);

  // Filtered Products for Quick Field Order Flow
  const fieldProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedFieldCategory !== 'All' && p.category !== selectedFieldCategory) return false;
      if (fieldProductSearch.trim()) {
        const q = fieldProductSearch.toLowerCase().trim();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedFieldCategory, fieldProductSearch]);

  const handleSelectCustomerForFieldOrder = (cust) => {
    setFieldCustomer({
      customerMode: 'quick',
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerAddress: cust.address,
      customerCity: cust.city,
      customerState: cust.state,
      customerEmail: cust.email || '',
      customerType: cust.classification === 'DAMAGE' ? 'Damage Customer' : cust.classification === 'EXPIRY' ? 'Expiry Customer' : 'Normal Customer'
    });
    setActiveTab('field-order');
    showToast(`Selected "${cust.name}" for Field Order`, 'info');
  };

  const handleCreateCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;
    await saveCustomer(newCustomerForm);
    setIsNewCustomerModalOpen(false);
    setNewCustomerForm({
      name: '',
      mobile: '',
      email: '',
      address: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      classification: 'NORMAL',
      customerMode: 'QUICK'
    });
  };

  const handleFieldCheckout = async () => {
    if (cart.length === 0) {
      showToast('Order cart is empty. Add at least 1 product SKU.', 'warning');
      return;
    }
    if (!fieldCustomer.customerName.trim()) {
      showToast('Please enter customer/retail shop name.', 'warning');
      return;
    }
    await checkoutOrder(fieldCustomer);
  };

  return (
    <div className="py-6 sm:py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Profile Header Card */}
        <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-amber-950 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase">
                  Verified Field Representative
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">ID: {activeSalesmanId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {user.name || "Rajesh Kumar"}
              </h1>
              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-2 mt-0.5">
                <span>Phone: <strong>{user.phone || "+91 98765 43210"}</strong></span>
                <span>•</span>
                <span>Territory: <strong>{user.region || "South India (Bengaluru Hub)"}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('field-order')}
              className="flex-1 md:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" /> Quick Field Order
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs rounded-xl border border-amber-500/30 hover:border-amber-500/60 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Key className="w-4 h-4 text-amber-400" /> Change Password
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* Live Database-Driven Performance Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Today's Orders
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {performanceStats.todayOrdersCount}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {performanceStats.todayQuantity} Units
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Live active bookings</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              This Week
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {performanceStats.weekOrdersCount}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {performanceStats.weekQuantity} Units
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Last 7 calendar days</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              This Month
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-brand-900 dark:text-amber-400">
                {performanceStats.monthOrdersCount}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {performanceStats.monthQuantity} Units
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Current billing cycle</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Monthly Target ({performanceStats.targetProgressOrders}%)
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden my-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${performanceStats.targetProgressOrders}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              {performanceStats.monthOrdersCount} / {performanceStats.monthlyTargetOrders} Booked Orders
            </span>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'orders', label: `My Order History (${myOrders.length})`, icon: FileText },
            { id: 'field-order', label: 'Field Order Booking', icon: ShoppingCart },
            { id: 'customers', label: `Customer Directory (${myCustomers.length})`, icon: Users },
            { id: 'analytics', label: 'Performance Metrics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-900 text-white dark:bg-brand-600 shadow'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: ORDER HISTORY & QUICK REORDER ================= */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            
            {/* Filter Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search Invoice #, Order ID, Customer..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Date Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-extrabold text-slate-400 uppercase text-[10px]">Filter:</span>
                {['All', 'Today', 'This Week', 'This Month', 'Custom Date'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                      timeFilter === t
                        ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}

                {timeFilter === 'Custom Date' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  />
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Invoice / Order ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4 text-center">Items</th>
                    <th className="py-3.5 px-4 text-center">Total Quantity</th>
                    <th className="py-3.5 px-4 text-center">Collection Mode</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-400 text-xs font-semibold">
                        No order records found for the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const totalUnits = order.totalQuantity || order.items?.reduce((acc, i) => acc + (i.qty || i.quantity || 0), 0) || 0;
                      const hasUrgent = order.hasUrgentItems || order.items?.some(i => i.isPriority);
                      const expCount = order.expiredItems?.length || 0;
                      const retCount = order.returnItems?.length || 0;

                      return (
                        <tr key={order.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors ${hasUrgent ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''}`}>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-brand-900 dark:text-brand-400 block">
                              {order.invoiceNumber || order.id}
                            </span>
                            {hasUrgent && (
                              <span className="mt-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase inline-flex items-center gap-0.5 shadow-sm">
                                <Zap className="w-2.5 h-2.5 fill-slate-950" /> URGENT
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{order.date}</td>
                          <td className="py-3.5 px-4">
                            <strong className="text-slate-900 dark:text-white block">{order.customerName}</strong>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400">{order.customerMobile || 'Direct Wholesale'}</span>
                              {expCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-extrabold text-[9px]">
                                  ⚠️ {expCount} Expired
                                </span>
                              )}
                              {retCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-extrabold text-[9px]">
                                  🔄 {retCount} Returns
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold">{order.items?.length || 0} SKUs</td>
                          <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">{totalUnits} Units</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                              Offline - Pending
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Quick Reorder Action */}
                              <button
                                type="button"
                                onClick={() => reorderPreviousOrder(order)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-extrabold text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors"
                                title="Load items into Order Cart to adjust & reorder"
                              >
                                <RotateCcw className="w-3 h-3" /> Reorder
                              </button>
                              {/* Invoice View */}
                              <button
                                type="button"
                                onClick={() => openInvoiceModal(order)}
                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3 h-3" /> Invoice
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 2: STREAMLINED FIELD ORDER FLOW ================= */}
        {activeTab === 'field-order' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Product Sourcing & Quick Add */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-500" />
                    Quick Product Sourcing List
                  </h3>
                  <span className="text-xs text-slate-400">{fieldProducts.length} Available SKUs</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={fieldProductSearch}
                    onChange={(e) => setFieldProductSearch(e.target.value)}
                    placeholder="Fast search SKU, Brand, or Product..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Products List for Instant Field Add */}
                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                  {fieldProducts.map(p => {
                    const inCartItem = cart.find(item => item.product.id === p.id);
                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                      >
                        <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-white rounded-lg p-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-brand-950 text-white">{p.brand}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">{p.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>₹{p.price}/unit</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">{p.stock} in stock</span>
                          </div>
                        </div>

                        {/* Direct Add / Qty Control */}
                        <div>
                          {inCartItem ? (
                            <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                              <button
                                type="button"
                                onClick={() => updateCartQty(p.id, -1)}
                                className="w-7 h-7 flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-black">{inCartItem.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(p.id, 1)}
                                className="w-7 h-7 flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(p, 1)}
                              className="px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Customer Selection, Cart Review & Offline Booking */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                
                {/* Customer Details Form */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-amber-500" />
                      Customer Details
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('customers')}
                      className="text-[11px] font-bold text-brand-900 dark:text-amber-400 hover:underline"
                    >
                      Pick from Directory
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Customer / Shop Name *"
                      value={fieldCustomer.customerName}
                      onChange={(e) => setFieldCustomer({ ...fieldCustomer, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Mobile Number"
                        value={fieldCustomer.customerMobile}
                        onChange={(e) => setFieldCustomer({ ...fieldCustomer, customerMobile: e.target.value })}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                      />
                      <select
                        value={fieldCustomer.customerType}
                        onChange={(e) => setFieldCustomer({ ...fieldCustomer, customerType: e.target.value })}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                      >
                        <option value="Normal Customer">Normal Customer</option>
                        <option value="Damage Customer">Damage Customer</option>
                        <option value="Expiry Customer">Expiry Customer</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Shop Delivery Address & City"
                      value={fieldCustomer.customerAddress}
                      onChange={(e) => setFieldCustomer({ ...fieldCustomer, customerAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                {/* Cart Items Review */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                      Order Cart ({cart.length} SKUs)
                    </span>
                    {cart.length > 0 && (
                      <button onClick={clearCart} className="text-[10px] text-red-500 hover:underline">
                        Clear All
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-2xl">
                      Select items from the catalog to book on field.
                    </div>
                  ) : (
                    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                          <div className="truncate pr-2">
                            <strong className="block truncate text-slate-900 dark:text-white">{item.product.name}</strong>
                            <span className="text-[10px] text-slate-400">Qty: {item.qty} × ₹{item.unitPrice}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs">₹{(item.unitPrice * item.qty).toLocaleString()}</span>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Terms & Checkout Button */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300 space-y-0.5">
                  <div>• Order Mode: <strong>Offline Collection</strong></div>
                  <div>• Payment Term: <strong>Offline / Direct Cash / B2B Terms</strong></div>
                  <div>• Collection Status: <strong>Pending Inspection & Billing</strong></div>
                </div>

                <button
                  type="button"
                  onClick={handleFieldCheckout}
                  disabled={cart.length === 0 || !fieldCustomer.customerName.trim()}
                  className="w-full py-3.5 bg-brand-900 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Submit Field Order & Generate GST Invoice</span>
                </button>

              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: CUSTOMER DIRECTORY & SEARCH ================= */}
        {activeTab === 'customers' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            
            {/* Header with Search and New Customer button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Search customer name, mobile, ID, city..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={() => setIsNewCustomerModalOpen(true)}
                className="px-4 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" /> Register New Retail Customer
              </button>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold">
                  No customer records matched your query. Click "Register New Retail Customer" to create an account.
                </div>
              ) : (
                filteredCustomers.map(cust => (
                  <div
                    key={cust.id || cust.customerId}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-brand-950 text-white">
                          {cust.customerId || 'CUST'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          cust.classification === 'DAMAGE'
                            ? 'bg-orange-100 text-orange-800'
                            : cust.classification === 'EXPIRY'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {cust.classification || 'NORMAL'}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{cust.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {cust.mobile || 'No Mobile Registered'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {cust.address || `${cust.city}, ${cust.state}`}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectCustomerForFieldOrder(cust)}
                        className="flex-1 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-400" /> Book Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ================= TAB 4: REAL PERFORMANCE ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Orders & Units Volume Overview
              </h3>
              <p className="text-xs text-slate-500">
                Performance derived strictly from your authenticated account orders roster.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Total Lifetime Orders</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{performanceStats.totalOrdersCount}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Total Sourced Quantity</span>
                  <span className="text-2xl font-black text-brand-900 dark:text-amber-400 mt-1 block">{performanceStats.totalLifetimeQuantity} Units</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Registered Customers</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{myCustomers.length} Retailers</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* New Customer Registration Modal */}
      <AnimatePresence>
        {isNewCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  Register Retail Customer
                </h3>
                <button
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomerSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Business / Shop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahavir Super Store"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98XXX XXXXX"
                      value={newCustomerForm.mobile}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, mobile: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Classification</label>
                    <select
                      value={newCustomerForm.classification}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, classification: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    >
                      <option value="NORMAL">Normal Customer</option>
                      <option value="DAMAGE">Damage Customer</option>
                      <option value="EXPIRY">Expiry Customer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Shop Address</label>
                  <input
                    type="text"
                    placeholder="Shop No, Street, Landmark"
                    value={newCustomerForm.address}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={newCustomerForm.city}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      value={newCustomerForm.state}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, state: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewCustomerModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow"
                  >
                    Save Customer to Roster
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Salesman Password Change Modal */}
      <SalesmanPasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
};
