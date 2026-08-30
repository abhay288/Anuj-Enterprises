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
import { generateInvoicePDF, downloadInvoicePDF } from '../../utils/pdfGenerator';
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
    customers,
    deliverySchedules,
    openInvoiceModal, 
    reorderPreviousOrder, 
    updateCustomerProfile, 
    updateNormalUserPassword,
    navigateTo, 
    showToast,
    logout,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'schedule' | 'profile' | 'catalog'
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'RECENT'

  // Helper date functions for delivery schedule
  const formatDeliveryDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatFullDeliveryDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getCutoffDateStr = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Derive logged-in customer's schedule
  const myCustId = user?.customerId || user?.id || '';
  const myArea = (user?.area || user?.city || '').toLowerCase();

  const myDeliveryDates = useMemo(() => {
    // 1. Direct ID match in deliverySchedules
    if (myCustId && deliverySchedules?.[myCustId] && deliverySchedules[myCustId].length > 0) {
      return [...deliverySchedules[myCustId]].sort();
    }
    // 2. Area/City match fallback
    if (deliverySchedules && typeof deliverySchedules === 'object') {
      for (const [cId, dates] of Object.entries(deliverySchedules)) {
        if (dates && dates.length > 0) {
          const matchCust = (customers || []).find(c => c.id === cId || c.customerId === cId);
          if (matchCust && ((matchCust.area && matchCust.area.toLowerCase() === myArea) || (matchCust.city && matchCust.city.toLowerCase() === myArea))) {
            return [...dates].sort();
          }
        }
      }
    }
    // 3. Fallback default upcoming dates
    const d1 = new Date(); d1.setDate(d1.getDate() + 2);
    const d2 = new Date(); d2.setDate(d2.getDate() + 6);
    return [d1.toISOString().split('T')[0], d2.toISOString().split('T')[0]];
  }, [myCustId, myArea, deliverySchedules, customers]);

  const upcomingDeliveryDates = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return myDeliveryDates.filter(d => d >= todayStr).sort();
  }, [myDeliveryDates]);

  const nextDeliveryDate = upcomingDeliveryDates[0] || null;
  const cutoffDateStr = nextDeliveryDate ? getCutoffDateStr(nextDeliveryDate) : null;

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
    gstin: user?.gstin || ''
  }));

  // Dedicated Password Change State (Requiring Old Password)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

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

  // Change Password Handler (Requires Old Password Verification)
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.oldPassword) {
      showToast('⚠️ Please enter your current (old) password.', 'warning');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showToast('⚠️ New password must be at least 6 characters.', 'warning');
      return;
    }
    if (passwordForm.newPassword === passwordForm.oldPassword) {
      showToast('⚠️ New password cannot be the same as your old password.', 'warning');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('❌ New password and Confirm Password do not match.', 'error');
      return;
    }

    setIsSubmittingPassword(true);
    setTimeout(() => {
      const res = updateNormalUserPassword(passwordForm.oldPassword, passwordForm.newPassword);
      setIsSubmittingPassword(false);
      if (res && res.success) {
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangePasswordModalOpen(false);
      }
    }, 400);
  };

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
        gstin: profileForm.gstin.trim()
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

            {/* Change Password Header Action */}
            <button
              type="button"
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
              title="Update your account login password"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Password</span>
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

      {/* DELIVERY NOTIFICATION BANNER (Requirement 4) */}
      {nextDeliveryDate && (
        <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-amber-500/20 border-2 border-amber-500/40 dark:border-amber-400/30 rounded-3xl p-5 text-slate-900 dark:text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-xs">
                  Route Delivery Alert
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  📍 {user?.area || user?.city || 'Your Mandi / Area'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold mt-1 text-slate-900 dark:text-white">
                Next delivery in your area: <span className="text-amber-600 dark:text-amber-400 underline font-black">{formatFullDeliveryDate(nextDeliveryDate)}</span>. Please place your order before <span className="text-rose-600 dark:text-rose-400 font-black">{cutoffDateStr || 'the day prior'}</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-brand-900 dark:hover:bg-brand-800 text-white font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>View Route Calendar</span>
            </button>
            <button
              onClick={() => navigateTo('catalogue')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Book Order Now</span>
            </button>
          </div>
        </div>
      )}

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

        {/* TAB: Your Delivery Schedule */}
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Your Delivery Schedule</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs">
            {upcomingDeliveryDates.length} Visits
          </span>
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
                          onClick={() => downloadInvoicePDF(order, showToast)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
                          title="Download Official Sales Invoice PDF"
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

      {/* TAB: Your Delivery Schedule (Requirements 3 & 4) */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          
          {/* Header & Advisory Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      Your Delivery Schedule
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase border border-emerald-500/30">
                      Assigned Route
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Live logistics timetable for your retail store and territory mandi.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigateTo('catalogue')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start md:self-auto hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Place Wholesale Order</span>
              </button>
            </div>

            {/* Mandatory Advisory Notice */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
              <span className="text-lg shrink-0">🚚</span>
              <div>
                <strong className="text-amber-400 font-black text-xs block uppercase tracking-wider">
                  Important Delivery Notice:
                </strong>
                <p className="text-xs text-slate-200 mt-0.5 font-semibold leading-relaxed">
                  Delivery vehicle will visit your area on the marked date. Please place your order at least 1 day before the scheduled delivery date.
                </p>
              </div>
            </div>
          </div>

          {/* Store Location & Route Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retail Store</span>
                <strong className="text-xs font-black text-slate-900 dark:text-white block truncate">
                  {user?.shopName || user?.name || 'Registered Store'}
                </strong>
                <span className="text-[10px] text-slate-500">ID: {user?.customerId || user?.id || 'CUST'}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Territory</span>
                <strong className="text-xs font-black text-slate-900 dark:text-white block">
                  {user?.area || user?.city || 'Kanpur Central Mandi'}
                </strong>
                <span className="text-[10px] text-slate-500">{user?.city || 'Kanpur'}, {user?.state || 'UP'}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Scheduled Visit</span>
                <strong className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                  {nextDeliveryDate ? formatDeliveryDate(nextDeliveryDate) : 'Schedule Pending'}
                </strong>
                <span className="text-[10px] text-slate-500">
                  {nextDeliveryDate ? `Cutoff: ${cutoffDateStr || '1 Day Prior'}` : 'Contact Support'}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Delivery Visit Dates Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Upcoming Scheduled Delivery Dates ({upcomingDeliveryDates.length})</span>
              </h3>
              <span className="text-xs text-slate-400">
                Vehicle Dispatched from Kanpur Central Logistics Hub
              </span>
            </div>

            {upcomingDeliveryDates.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <Calendar className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  No Upcoming Delivery Schedule Assigned Yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Our route manager is planning the next vehicle dispatch for your area ({user?.area || user?.city || 'your mandi'}). For urgent booking, contact dispatch desk at <strong>+91 88876 83782</strong>.
                </p>
                <button
                  onClick={() => navigateTo('catalogue')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow mt-2"
                >
                  Explore Catalogue & Order
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingDeliveryDates.map((dateStr, idx) => {
                  const daysLeft = getDaysLeft(dateStr);
                  const cutoff = getCutoffDateStr(dateStr);
                  const isNext = idx === 0;

                  return (
                    <motion.div
                      key={dateStr}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all hover:shadow-xl flex flex-col justify-between space-y-4 ${
                        isNext
                          ? 'border-2 border-amber-500 shadow-amber-500/10'
                          : 'border-slate-200 dark:border-slate-800 shadow-sm'
                      }`}
                    >
                      {isNext && (
                        <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-sm">
                          ⭐ Next Delivery Visit
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 border ${
                            daysLeft === 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 animate-pulse'
                              : daysLeft === 1
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                          }`}>
                            {daysLeft === 0 ? '⚡ TODAY' : daysLeft === 1 ? '🚚 TOMORROW' : `🟢 In ${daysLeft} Days`}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            Visit #{idx + 1}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Scheduled Vehicle Visit Date
                          </span>
                          <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                            {formatFullDeliveryDate(dateStr)}
                          </h4>
                        </div>

                        {/* Order Cutoff Notice */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Order Booking Cutoff Deadline:
                          </span>
                          <span className="font-extrabold text-rose-600 dark:text-rose-400 block">
                            ⏰ Place order before {cutoff || '1 day prior'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigateTo('catalogue')}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-brand-900 dark:hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                        <span>Book Order For This Route</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
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

              </div>

              {/* Submit Button for Profile */}
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

            {/* Dedicated Account Security & Password Update Card (Requires Old Password) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Account Security & Password Update
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Enter your <strong>Old Password</strong> to verify your identity, then set a new secure password.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] rounded-full border border-amber-300 dark:border-amber-800">
                  Old Password Required
                </span>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
                {/* 1. Old Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Current (Old) Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showOldPass ? "text" : "password"}
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      placeholder="Enter your current account password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      New Password (Min 6 Characters) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-500" />
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        minLength={6}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="New strong password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-500" />
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Re-type new password"
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                          passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                            ? 'border-rose-500 focus:ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 focus:ring-amber-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <span className="text-[10px] text-rose-500 mt-1 block">
                        Passwords do not match
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-brand-900 dark:hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 hover:scale-105"
                  >
                    {isSubmittingPassword ? (
                      <span>Verifying & Updating...</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Update Account Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal (Accessible Anytime) */}
      <AnimatePresence>
        {isChangePasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">Change Account Password</h3>
                    <p className="text-[11px] text-slate-400">Old password verification required</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <EyeOff className="w-4 h-4 hidden" />
                  <span>✕</span>
                </button>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4 text-xs">
                {/* 1. Old Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Current (Old) Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showOldPass ? "text" : "password"}
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. New Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    New Password (Min 6 Characters) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-500" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="New strong password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-500" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                        passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                          ? 'border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-slate-800 focus:ring-amber-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition-colors"
                  >
                    {isSubmittingPassword ? 'Verifying...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
