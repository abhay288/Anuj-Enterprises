import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Store, User, Phone, Mail, MapPin, FileText, 
  Download, Eye, Search, Calendar, ShoppingBag, Plus, 
  CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, 
  Edit3, Save, Lock, EyeOff, Sparkles, Tag, ShoppingCart,
  Layers, Package, Check, HelpCircle, ArrowUpRight, Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { ALL_INDIAN_STATES } from '../../data/indiaStatesAndDistricts';
import { checkUnwantedContent } from '../../utils/securityUtils';

const FMCG_CITIES = [
  'Kanpur', 'Lucknow', 'Unnao', 'Fatehpur', 'Prayagraj', 
  'Varanasi', 'Agra', 'Aligarh', 'Bareilly', 'Gorakhpur', 
  'Jhansi', 'Meerut', 'Moradabad', 'Noida / Greater Noida', 
  'Ghaziabad', 'Mathura', 'Ayodhya', 'Etawah', 'Farrukhabad', 
  'Kannauj', 'Raebareli', 'Sultanpur', 'Sitapur', 'Hardoi', 
  'Banda', 'Delhi NCR', 'Mumbai / Thane', 'Navi Mumbai', 
  'Kalyan', 'Pune', 'Patna', 'Indore', 'Jaipur'
];

export const CustomerDashboard = () => {
  const { 
    user, 
    orders, 
    products, 
    openInvoiceModal, 
    reorderPreviousOrder, 
    updateCustomerProfile, 
    navigateTo, 
    showToast,
    logout,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'profile' | 'catalog'
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'RECENT'

  // Profile Form State
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.shopName || user?.name || '',
    ownerName: user?.ownerName || user?.shopOwnerName || user?.name || '',
    mobile: (user?.mobile || '').replace('+91', '').trim(),
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || 'Kanpur',
    state: user?.state || 'Uttar Pradesh',
    area: user?.area || user?.city || 'Kanpur',
    gstin: user?.gstin || '',
    password: user?.password || 'Cust@123'
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(() => !FMCG_CITIES.includes(user?.city || 'Kanpur'));

  // Sync profile form if active user changes
  React.useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.shopName || user.name || '',
        ownerName: user.ownerName || user.shopOwnerName || user.name || '',
        mobile: (user.mobile || '').replace('+91', '').trim(),
        email: user.email || '',
        address: user.address || '',
        city: user.city || 'Kanpur',
        state: user.state || 'Uttar Pradesh',
        area: user.area || user.city || 'Kanpur',
        gstin: user.gstin || '',
        password: user.password || 'Cust@123'
      });
      setIsCustomCity(!FMCG_CITIES.includes(user.city || 'Kanpur'));
    }
  }, [user]);

  // Scoped Customer Orders Filter
  const customerOrders = useMemo(() => {
    if (!user) return [];
    const uEmail = (user.email || '').toLowerCase().trim();
    const uMobile = (user.mobile || '').replace(/\D/g, '');
    const uName = (user.shopName || user.name || '').toLowerCase().trim();
    const uCustId = (user.customerId || user.id || '').toLowerCase().trim();

    return (orders || []).filter(o => {
      const oEmail = (o.customerEmail || '').toLowerCase().trim();
      const oMobile = (o.customerMobile || '').replace(/\D/g, '');
      const oName = (o.customerName || '').toLowerCase().trim();
      const oCustId = (o.customerId || '').toLowerCase().trim();

      if (uCustId && oCustId && uCustId === oCustId) return true;
      if (uEmail && oEmail && uEmail === oEmail) return true;
      if (uMobile && oMobile && (uMobile.includes(oMobile) || oMobile.includes(uMobile))) return true;
      if (uName && oName && (uName.includes(oName) || oName.includes(uName))) return true;
      return false;
    });
  }, [orders, user]);

  // Filtered Orders for Invoices Tab
  const filteredOrders = useMemo(() => {
    let list = [...customerOrders];

    if (timeFilter === 'THIS_MONTH') {
      const now = new Date();
      const curMonth = now.getMonth();
      const curYear = now.getFullYear();
      list = list.filter(o => {
        const d = new Date(o.date || o.createdAt);
        return d.getMonth() === curMonth && d.getFullYear() === curYear;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(o => 
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.items && o.items.some(i => i.name && i.name.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [customerOrders, timeFilter, searchQuery]);

  // Performance & Lifetime Metrics
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let totalValue = 0;

    for (const order of customerOrders) {
      const units = order.totalQuantity || (order.items || []).reduce((acc, i) => acc + (i.qty || i.quantity || 0), 0) || 0;
      totalUnits += units;

      const orderVal = (order.items || []).reduce((acc, i) => {
        const p = i.price || i.unitPrice || i.mrp || 0;
        const q = i.qty || i.quantity || 0;
        return acc + (p * q);
      }, 0);
      totalValue += orderVal;
    }

    return {
      totalOrders: customerOrders.length,
      totalUnits,
      totalValue
    };
  }, [customerOrders]);

  // Save Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('⚠️ Store / Business Name is required.', 'warning');
      return;
    }
    if (!profileForm.ownerName.trim()) {
      showToast('⚠️ Shop Owner Name is required.', 'warning');
      return;
    }
    if (!profileForm.mobile.trim()) {
      showToast('⚠️ Mobile Contact Number is required.', 'warning');
      return;
    }

    const check = checkUnwantedContent(`${profileForm.name} ${profileForm.ownerName} ${profileForm.address} ${profileForm.city}`);
    if (check.hasUnwanted) {
      showToast(`🚫 Prohibited or offensive text detected ("${check.matchedWord}"). Please enter clean business details.`, 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateCustomerProfile({
        name: profileForm.name.trim(),
        shopName: profileForm.name.trim(),
        ownerName: profileForm.ownerName.trim(),
        shopOwnerName: profileForm.ownerName.trim(),
        mobile: profileForm.mobile.startsWith('+91') ? profileForm.mobile.trim() : `+91 ${profileForm.mobile.trim()}`,
        email: profileForm.email.trim(),
        address: profileForm.address.trim(),
        city: profileForm.city.trim(),
        state: profileForm.state.trim(),
        area: profileForm.area.trim() || profileForm.city.trim(),
        gstin: profileForm.gstin.trim(),
        password: profileForm.password.trim() || 'Cust@123'
      });
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner / Store Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 p-6 sm:p-8 text-white border border-slate-800 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 p-1 flex items-center justify-center shrink-0 shadow-xl">
              <Store className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3" /> Registered B2B Customer
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/10 text-slate-300 font-mono">
                  ID: {user?.customerId || user?.id || 'CUST-ACTIVE'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {user?.shopName || user?.name || 'Valued Retail Store'}
              </h1>
              
              <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap pt-0.5">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Owner: <strong>{user?.ownerName || user?.shopOwnerName || user?.name || 'Authorized Buyer'}</strong>
                </span>
                {user?.mobile && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    {user.mobile}
                  </span>
                )}
                {user?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {user.city}, {user.state || 'UP'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigateTo('catalogue')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>New Order / Catalogue</span>
            </button>

            <button
              onClick={logout}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-white/10 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Invoices Booked
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{metrics.totalOrders}</span>
              <span className="text-xs text-amber-400 font-bold">Invoices</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Products Ordered
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{metrics.totalUnits}</span>
              <span className="text-xs text-emerald-400 font-bold">Total Units / Cases</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Account Verification
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-amber-400">100% KYC Verified</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Invoices & Orders ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Store Profile & Settings</span>
        </button>

        <button
          onClick={() => navigateTo('catalogue')}
          className="pb-3 px-4 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 ml-auto"
        >
          <span>Explore All FMCG Products</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* TAB 1: Invoices & Order History */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Invoice #, Product, Order ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setTimeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  timeFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All Orders ({customerOrders.length})
              </button>
              <button
                onClick={() => setTimeFilter('THIS_MONTH')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  timeFilter === 'THIS_MONTH'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Orders List / Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-slate-950 text-amber-500 flex items-center justify-center border border-amber-200 dark:border-slate-800">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {searchQuery ? 'No Matching Invoices Found' : 'No Invoices Recorded Yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try searching with a different Invoice Number or clearing the search filter.' 
                  : 'Start placing orders from our wholesale FMCG catalogue to generate your first tax invoice with auto-filled store details.'}
              </p>
              <button
                onClick={() => navigateTo('catalogue')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Start New Order</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const totalUnits = order.totalQuantity || (order.items || []).reduce((acc, i) => acc + (i.qty || i.quantity || 0), 0) || 0;
                
                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:border-amber-500/50 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-slate-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-slate-800">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                              {order.invoiceNumber || order.id}
                            </span>
                            {order.status === 'OUT_FOR_DELIVERY' || order.status === 'Out For Delivery' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white flex items-center gap-1 shadow-sm animate-pulse">
                                <Truck className="w-3 h-3" /> Out For Delivery (In-Transit)
                              </span>
                            ) : order.status === 'DELIVERED' || order.status === 'Delivered' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Delivered
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {order.status || 'Confirmed'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.date || order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openInvoiceModal(order)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>

                        <button
                          onClick={() => generateInvoicePDF(order)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => reorderPreviousOrder(order)}
                          className="px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          title="Load items from this order into current cart"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-Order</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Details Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Shop / Retailer</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {order.customerName || user?.shopName || 'Retailer Store'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Shop Owner</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {order.shopOwnerName || user?.ownerName || 'Owner'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Items Booked</span>
                        <span className="font-black text-amber-600 dark:text-amber-400">
                          {order.items?.length || 0} SKUs ({totalUnits} Units)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Store Profile & Settings */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Info Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Profile & Store Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  These details will be <strong>automatically pre-filled</strong> every time you generate a new order or B2B tax invoice.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 dark:bg-slate-950 rounded-2xl border border-amber-200 dark:border-slate-800 text-xs text-amber-900 dark:text-amber-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-black">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Invoice Auto-Fill Enabled</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Shop Name, Owner Name, Contact Number, and Delivery Location are locked to your authenticated account.
                </p>
              </div>
            </div>
          </div>

          {/* Right Editable Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-500" /> Edit Registered Business Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your retail shop details below. Changes reflect across all future orders instantly.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Shop / Retail Store Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Retail Store / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g. Reliance Retail Supermarket Chains / Mahavir Kirana"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 2. Shop Owner Name & Contact Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Shop Owner / Authorized Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profileForm.ownerName}
                        onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                        placeholder="e.g. Ramesh Chandra / Rajesh Gupta"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Contact Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-black text-amber-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                        value={profileForm.mobile}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setProfileForm({ ...profileForm, mobile: digits });
                        }}
                        placeholder="98XXXXXXXX"
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Email Address & GSTIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="purchase@store.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      GSTIN / Tax ID <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.gstin}
                        onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value.toUpperCase() })}
                        placeholder="09AAAAA0000A1Z5"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Shop Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Store Physical Address / Landmark
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Shop/Gala No, Market Complex, Road, Landmark..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 5. City & State Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      City / Mandi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={isCustomCity ? 'OTHER' : profileForm.city}
                      onChange={(e) => {
                        if (e.target.value === 'OTHER') {
                          setIsCustomCity(true);
                        } else {
                          setIsCustomCity(false);
                          setProfileForm({ ...profileForm, city: e.target.value, area: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {FMCG_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="OTHER">Other Custom City...</option>
                    </select>

                    {isCustomCity && (
                      <input
                        type="text"
                        required
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value, area: e.target.value })}
                        placeholder="Enter City Name"
                        className="w-full px-3 py-1.5 mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Area / Market Zone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.area}
                      onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}
                      placeholder="e.g. Collectorganj Wholesale Mandi"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {ALL_INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6. Account Password */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Account Security Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      placeholder="Change your login password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <span>Saving Changes...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile & Store Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
