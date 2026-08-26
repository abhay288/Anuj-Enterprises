import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Trash2, ArrowLeft, ShieldCheck, FileText, 
  Building2, ArrowRight, AlertTriangle, CheckCircle2, User, Phone, MapPin, Mail, Sparkles, Tag,
  Zap, RotateCcw, Plus, AlertOctagon, PackageX, ChevronDown, ChevronUp, ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InvoiceModal } from './InvoiceModal';
import { ALL_INDIAN_STATES, getDistrictsByState } from '../../data/indiaStatesAndDistricts';

import { checkUnwantedContent } from '../../utils/securityUtils';

export const CartView = () => {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart,
    toggleCartItemPriority,
    brands,
    cartSubtotal, 
    cartTotalQty, 
    user, 
    navigateTo, 
    setIsSalesmanModalOpen,
    checkoutOrder,
    selectedCustomerForOrder,
    showToast,
    t
  } = useApp();

  // Customer Entry Flow Modes: 'quick' | 'full'
  const [customerMode, setCustomerMode] = useState('quick'); 

  // Customer Form Fields (GSTIN completely removed per Part 1)
  const [customerName, setCustomerName] = useState(() => selectedCustomerForOrder?.name || 'Reliance Retail Wholesale Chains');
  const [customerMobile, setCustomerMobile] = useState(() => selectedCustomerForOrder?.mobile || '+91 98200 11223');
  const [customerAddress, setCustomerAddress] = useState(() => selectedCustomerForOrder?.address || 'Bhiwandi Central B2B Logistics Hub, Sector 4');
  const [customerCity, setCustomerCity] = useState(() => selectedCustomerForOrder?.city || 'Thane');
  const [customerState, setCustomerState] = useState(() => selectedCustomerForOrder?.state || 'Maharashtra');
  const [customerEmail, setCustomerEmail] = useState(() => selectedCustomerForOrder?.email || 'purchase@relianceretail.demo');

  // Expired Products Claim State
  const [isExpiredOpen, setIsExpiredOpen] = useState(false);
  const [expiredItems, setExpiredItems] = useState([]);
  const [expiredForm, setExpiredForm] = useState({
    company: 'Amul',
    product: '',
    qty: 1,
    batchOrNote: ''
  });

  // Return Products Docket State
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnItems, setReturnItems] = useState([]);
  const [returnForm, setReturnForm] = useState({
    company: 'Amul',
    product: '',
    qty: 1,
    reason: 'Damaged Packaging / Crushed Box'
  });

  // Customer Classification Options: 'Normal Customer' | 'Damage Customer' | 'Expiry Customer' (Auto-derived from Expired/Damage Dockets)
  const customerType = React.useMemo(() => {
    if (expiredItems.length > 0) return 'Expiry Customer';
    if (returnItems.length > 0) return 'Damage Customer';
    if (selectedCustomerForOrder?.classification === 'DAMAGE') return 'Damage Customer';
    if (selectedCustomerForOrder?.classification === 'EXPIRY') return 'Expiry Customer';
    return 'Normal Customer';
  }, [expiredItems.length, returnItems.length, selectedCustomerForOrder]); 

  const handleAddExpiredItem = (e) => {
    e.preventDefault();
    if (!expiredForm.product.trim()) return;
    const newItem = {
      id: `EXP-${Date.now()}`,
      company: expiredForm.company || 'Amul',
      product: expiredForm.product.trim(),
      qty: Math.max(1, parseInt(expiredForm.qty, 10) || 1),
      batchOrNote: expiredForm.batchOrNote.trim() || 'Expired Stock Batch'
    };
    setExpiredItems(prev => [...prev, newItem]);
    setExpiredForm({
      company: expiredForm.company,
      product: '',
      qty: 1,
      batchOrNote: ''
    });
  };

  const handleRemoveExpiredItem = (id) => {
    setExpiredItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAddReturnItem = (e) => {
    e.preventDefault();
    if (!returnForm.product.trim()) return;
    const newItem = {
      id: `RET-${Date.now()}`,
      company: returnForm.company || 'Amul',
      product: returnForm.product.trim(),
      qty: Math.max(1, parseInt(returnForm.qty, 10) || 1),
      reason: returnForm.reason
    };
    setReturnItems(prev => [...prev, newItem]);
    setReturnForm({
      company: returnForm.company,
      product: '',
      qty: 1,
      reason: 'Damaged Packaging / Crushed Box'
    });
  };

  const handleRemoveReturnItem = (id) => {
    setReturnItems(prev => prev.filter(i => i.id !== id));
  };

  React.useEffect(() => {
    if (selectedCustomerForOrder) {
      setCustomerName(selectedCustomerForOrder.name || user?.name || 'General Retail Store');
      setCustomerMobile(selectedCustomerForOrder.mobile || user?.mobile || '');
      setCustomerAddress(selectedCustomerForOrder.address || '');
      setCustomerCity(selectedCustomerForOrder.city || 'Kanpur');
      setCustomerState(selectedCustomerForOrder.state || 'Uttar Pradesh');
      setCustomerEmail(selectedCustomerForOrder.email || user?.email || '');
    } else if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
    }
  }, [selectedCustomerForOrder, user]);

  const [salesmanIdInput, setSalesmanIdInput] = useState(() => user?.salesmanId || 'AE-SM-001');
  const [salesmanNameInput, setSalesmanNameInput] = useState(() => user?.name || 'Rajesh Kumar');
  const [salesmanAreaInput, setSalesmanAreaInput] = useState('South Kanpur Central');
  const [salesmanRouteInput, setSalesmanRouteInput] = useState('Route #4 — Civil Lines Wholesale Mandi');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'Credit' | 'Online' | 'Special'

  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityCount = cart.filter(i => i.isPriority).length;

  const handleCheckoutClick = () => {
    const fullTextToTest = `${customerName} ${customerAddress} ${customerCity} ${customerEmail} ${salesmanNameInput}`;
    const check = checkUnwantedContent(fullTextToTest);
    if (check.hasUnwanted) {
      showToast(`🚫 Checkout Blocked: Inappropriate or prohibited words detected ("${check.matchedWord}"). Please enter valid business details.`, 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      checkoutOrder({
        customerMode,
        customerName,
        customerMobile,
        customerAddress,
        customerCity,
        customerState,
        customerEmail,
        customerType,
        salesmanId: salesmanIdInput || user.salesmanId || 'AE-SM-001',
        salesmanName: salesmanNameInput || user.name || 'Rajesh Kumar',
        salesmanPhone: user.phone || '+91 98765 43210',
        salesmanArea: salesmanAreaInput || 'South Kanpur Central',
        salesmanRoute: salesmanRouteInput || 'Route #4 — Civil Lines Wholesale Mandi',
        paymentMethod: paymentMethod || 'Cash',
        expiredItems,
        returnItems
      });
    }, 600);
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-slate-800 text-brand-900 dark:text-brand-400 mx-auto flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Your B2B Cart is Currently Empty
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Explore our B2B catalogue for consumer supply, FMCG milk, beverages, personal care, and snacks with pack information & volume discounts.
            </p>
            <button
              onClick={() => navigateTo('catalogue')}
              className="px-8 py-3.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              Browse Products Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <button onClick={() => navigateTo('catalogue')} className="hover:underline flex items-center gap-1 font-bold">
                <ArrowLeft className="w-3.5 h-3.5" /> {t('back_to_products', 'Continue Shopping')}
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('cart_title', 'Salesman Order Cart & Offline Checkout')}
              </h1>
              <span className="px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <User className="w-3.5 h-3.5 text-amber-500" />
                {user.role === 'guest' 
                  ? 'Guest Visitor Cart' 
                  : user.role === 'salesman' 
                  ? `Salesman Cart (${user.salesmanId || 'AE-SM-001'} — ${user.name})` 
                  : user.role === 'admin' 
                  ? 'Admin Executive Cart' 
                  : `Customer Cart (${user.name})`}
              </span>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> {t('clear_filters', 'Clear Cart')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cart Table Container */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Products Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              
              {/* Urgent Priority Counter Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-amber-500/15 via-brand-900/10 to-amber-500/10 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-slate-900/40 rounded-2xl border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
                    <Zap className="w-4 h-4 fill-slate-950" />
                  </span>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      ⚡ Urgent Priority Dispatch (Max 2 Products)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mark up to 2 high-priority SKUs for expedited warehouse picking & distinct invoice marking.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    priorityCount > 0
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {priorityCount} / 2 Urgent Selected
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Item Details</th>
                      <th className="py-3 px-4">Pack Info</th>
                      <th className="py-3 px-4 text-center">Quantity</th>
                      <th className="py-3 px-4 text-right">Pricing Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cart.map((item) => (
                      <tr key={item.product.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors ${
                        item.isPriority ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className={`w-14 h-14 object-contain bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border ${
                                item.isPriority ? 'border-amber-500 ring-2 ring-amber-400/50' : 'border-slate-200 dark:border-slate-800'
                              }`}
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
                                  {item.product.brand}
                                </span>
                                {item.isPriority && (
                                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] uppercase rounded-full shadow-sm flex items-center gap-0.5">
                                    <Zap className="w-2.5 h-2.5 fill-slate-950" /> URGENT
                                  </span>
                                )}
                                {item.product.isNrp && (
                                  <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] uppercase rounded-full shadow-sm flex items-center gap-0.5" title="This product follows No Return Policy. Please inspect the product carefully at the time of delivery.">
                                    <ShieldAlert className="w-2.5 h-2.5" /> NRP
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                {item.product.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                SKU: {item.product.sku}
                              </span>

                              {/* Urgent Priority Toggle Button */}
                              <button
                                type="button"
                                onClick={() => toggleCartItemPriority(item.product.id)}
                                className={`mt-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                                  item.isPriority
                                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-400 font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-500/20 hover:text-amber-600'
                                }`}
                              >
                                <Zap className={`w-3 h-3 ${item.isPriority ? 'fill-slate-950' : ''}`} />
                                <span>{item.isPriority ? '⚡ URGENT PRIORITY (ACTIVE)' : 'Mark as Urgent (Max 2)'}</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Pack Info Column */}
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                          <div className="text-[11px] space-y-0.5">
                            {item.product.packSize && <div>Pack: <strong>{item.product.packSize}</strong></div>}
                            {item.product.bundleSize && <div>Bundle: <strong>{item.product.bundleSize}</strong></div>}
                            {item.product.caseSize && <div className="text-amber-700 dark:text-amber-400 font-bold">Case: {item.product.caseSize}</div>}
                          </div>
                        </td>

                        {/* Direct Numeric Input & Custom B2B Quantity Presets */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="inline-flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-sm">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, -1)}
                                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateCartQty(item.product.id, e.target.value, true)}
                                className="w-14 py-1 text-center font-extrabold text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-x border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, 1)}
                                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center gap-1 text-[9px]">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, 5)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
                                title="Add 5 units (1 Bundle)"
                              >
                                +5 Bundle
                              </button>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, 10)}
                                className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black"
                                title="Add 10 units (1 Master Case)"
                              >
                                +10 Case
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right font-extrabold text-brand-900 dark:text-brand-400">
                          Quote Pending
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Entry Flow & Classification Form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-500" /> B2B Customer Order Registration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select entry complexity & customer classification</p>
                </div>

                {/* Option Selector: Quick Order vs Full Customer */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('quick')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      customerMode === 'quick'
                        ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    OPTION 1 — Quick Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('full')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      customerMode === 'full'
                        ? 'bg-brand-900 text-white shadow font-extrabold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    OPTION 2 — Full Customer
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4 pt-2">
                {/* Always Show Customer Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Customer / Retailer Name <span className="text-[10px] font-normal text-slate-400">(Optional — Auto-filled)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Auto-filled with account or General Retailer..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Show Extra Fields when OPTION 2 - Full Customer is Selected (GSTIN Completely Removed) */}
                {customerMode === 'full' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={customerMobile}
                          onChange={(e) => setCustomerMobile(e.target.value)}
                          placeholder="+91 98XXXXXXXX"
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="orders@customer.com"
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Street, Industrial Hub Address..."
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">State</label>
                        <select
                          value={customerState}
                          onChange={(e) => {
                            const newState = e.target.value;
                            setCustomerState(newState);
                            const districts = getDistrictsByState(newState);
                            if (districts.length > 0) {
                              setCustomerCity(districts[0]);
                            }
                          }}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                        >
                          <option value="">-- Select State / UT --</option>
                          {ALL_INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">District / City</label>
                        {getDistrictsByState(customerState).length > 0 ? (
                          <select
                            value={customerCity}
                            onChange={(e) => setCustomerCity(e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                          >
                            <option value="">-- Select District --</option>
                            {getDistrictsByState(customerState).map((dst) => (
                              <option key={dst} value={dst}>{dst}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={customerCity}
                            onChange={(e) => setCustomerCity(e.target.value)}
                            placeholder="Enter District / City"
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Salesman Representative & Territory Route Entry Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Sales Representative & Territory Route Details (Appears on Invoice)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        Salesman Name *
                      </label>
                      <input
                        type="text"
                        value={salesmanNameInput}
                        onChange={(e) => setSalesmanNameInput(e.target.value)}
                        placeholder="Rajesh Kumar"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        Salesman Area *
                      </label>
                      <input
                        type="text"
                        value={salesmanAreaInput}
                        onChange={(e) => setSalesmanAreaInput(e.target.value)}
                        placeholder="e.g. South Kanpur Central"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        Salesman Route *
                      </label>
                      <input
                        type="text"
                        value={salesmanRouteInput}
                        onChange={(e) => setSalesmanRouteInput(e.target.value)}
                        placeholder="e.g. Route #4 — Wholesale Mandi"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector (Cash, Credit, Online, Special) */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Payment Method Selection *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Cash', label: '💵 Cash', color: 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300' },
                      { id: 'Credit', label: '💳 Credit (Net-30)', color: 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300' },
                      { id: 'Online', label: '🌐 Online (UPI/NEFT)', color: 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' },
                      { id: 'Special', label: '⭐ Special Scheme', color: 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id)}
                        className={`p-3 rounded-2xl border-2 text-xs font-extrabold transition-all text-center ${
                          paymentMethod === p.id
                            ? `${p.color} shadow-sm ring-2 ring-amber-400`
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Expired Products Claim & Replacement Docket */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                    <AlertOctagon className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      Expired Products Claim & Replacement (Optional)
                      {expiredItems.length > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                          {expiredItems.length} Logged
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Record expired stock returned by retailer for manufacturer credit adjustment / replacement.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExpiredOpen(!isExpiredOpen)}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  {isExpiredOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isExpiredOpen ? 'Collapse' : '+ Add Expired Product'}</span>
                </button>
              </div>

              {/* Expired Item Input Form */}
              {isExpiredOpen && (
                <form onSubmit={handleAddExpiredItem} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Brand / Company Selector */}
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">Company / Brand *</label>
                      <select
                        value={expiredForm.company}
                        onChange={(e) => setExpiredForm({ ...expiredForm, company: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                      >
                        {brands.map(b => (
                          <option key={b.name} value={b.name}>{b.name}</option>
                        ))}
                        <option value="Other FMCG">Other FMCG Brand</option>
                      </select>
                    </div>

                    {/* Product Name */}
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amul Taaza 1L Tetra"
                        value={expiredForm.product}
                        onChange={(e) => setExpiredForm({ ...expiredForm, product: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl font-semibold"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">Expired Qty (Units) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={expiredForm.qty}
                        onChange={(e) => setExpiredForm({ ...expiredForm, qty: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                      />
                    </div>

                    {/* Batch / Expiry Note */}
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">Batch No / Expiry Date</label>
                      <input
                        type="text"
                        placeholder="Batch #B204 / Exp 07/2026"
                        value={expiredForm.batchOrNote}
                        onChange={(e) => setExpiredForm({ ...expiredForm, batchOrNote: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Expired Item Claim
                    </button>
                  </div>
                </form>
              )}

              {/* Logged Expired Items List */}
              {expiredItems.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Recorded Expired Claims for Invoice:
                  </span>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-red-200 dark:border-red-950/60 rounded-2xl overflow-hidden bg-red-50/30 dark:bg-slate-950">
                    {expiredItems.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-extrabold text-[10px] uppercase rounded">
                            {item.company}
                          </span>
                          <div>
                            <strong className="text-slate-900 dark:text-white font-bold">{item.product}</strong>
                            <span className="text-slate-400 text-[11px] block font-mono">
                              Qty: <strong>{item.qty} units</strong> • {item.batchOrNote}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExpiredItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Remove claim"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isExpiredOpen && (
                <p className="text-xs text-slate-400 italic">No expired claims recorded for this order.</p>
              )}
            </div>

            {/* Return Goods & Damage Docket */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                    <RotateCcw className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      Goods Return & Damage Docket (Optional)
                      {returnItems.length > 0 && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-full">
                          {returnItems.length} Logged
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Record damaged boxes, leakages, or unsellable stock sent back by merchant.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReturnOpen(!isReturnOpen)}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  {isReturnOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isReturnOpen ? 'Collapse' : '+ Add Return Product'}</span>
                </button>
              </div>

              {/* Return Item Input Form */}
              {isReturnOpen && (
                <form onSubmit={handleAddReturnItem} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Brand / Company Selector */}
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">Company / Brand *</label>
                      <select
                        value={returnForm.company}
                        onChange={(e) => setReturnForm({ ...returnForm, company: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                      >
                        {brands.map(b => (
                          <option key={b.name} value={b.name}>{b.name}</option>
                        ))}
                        <option value="Other FMCG">Other FMCG Brand</option>
                      </select>
                    </div>

                    {/* Product Name */}
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cadbury Dairy Milk 50g"
                        value={returnForm.product}
                        onChange={(e) => setReturnForm({ ...returnForm, product: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl font-semibold"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">Return Qty (Units) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={returnForm.qty}
                        onChange={(e) => setReturnForm({ ...returnForm, qty: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                      />
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-slate-500 mb-1">Return Reason *</label>
                      <select
                        value={returnForm.reason}
                        onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                      >
                        <option value="Damaged Packaging / Crushed Box">Damaged Packaging / Crushed Box</option>
                        <option value="Seal Broken / Liquid Leakage">Seal Broken / Liquid Leakage</option>
                        <option value="Near Expiry / Retailer Rotation">Near Expiry / Retailer Rotation</option>
                        <option value="Slow Moving Stock Exchange">Slow Moving Stock Exchange</option>
                        <option value="Wrong SKU Delivered Previously">Wrong SKU Delivered Previously</option>
                        <option value="Customer Return / Quality Issue">Customer Return / Quality Issue</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Return Item Docket
                    </button>
                  </div>
                </form>
              )}

              {/* Logged Return Items List */}
              {returnItems.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Recorded Return Goods for Invoice:
                  </span>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-orange-200 dark:border-orange-950/60 rounded-2xl overflow-hidden bg-orange-50/30 dark:bg-slate-950">
                    {returnItems.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-extrabold text-[10px] uppercase rounded">
                            {item.company}
                          </span>
                          <div>
                            <strong className="text-slate-900 dark:text-white font-bold">{item.product}</strong>
                            <span className="text-slate-400 text-[11px] block font-mono">
                              Qty: <strong>{item.qty} units</strong> • Reason: {item.reason}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveReturnItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Remove return"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isReturnOpen && (
                <p className="text-xs text-slate-400 italic">No return items recorded for this order.</p>
              )}
            </div>

          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 sticky top-24">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order & Collection Summary
              </h3>

              {/* Order Summary Status Displays */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-600 dark:text-slate-400">ORDER TYPE</span>
                  <span className="px-2.5 py-0.5 bg-brand-900 text-white font-extrabold text-[10px] rounded uppercase">Offline Collection</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-600 dark:text-slate-400">PAYMENT METHOD</span>
                  <span className="font-black text-amber-700 dark:text-amber-400 uppercase">{paymentMethod}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Total Items Quantity</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{cartTotalQty} Units</span>
                </div>

                {/* Priority items count */}
                {priorityCount > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-extrabold">
                    <span>⚡ Urgent Priority Items</span>
                    <span>{priorityCount} SKUs</span>
                  </div>
                )}

                {/* Expired items count */}
                {expiredItems.length > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-extrabold">
                    <span>⚠️ Expired Claims</span>
                    <span>{expiredItems.length} Products</span>
                  </div>
                )}

                {/* Return items count */}
                {returnItems.length > 0 && (
                  <div className="flex justify-between text-orange-600 dark:text-orange-400 font-extrabold">
                    <span>🔄 Goods Return Claims</span>
                    <span>{returnItems.length} Products</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Order Status</span>
                  <span className="font-bold text-slate-900 dark:text-white">Quote Pending</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Total Amount</span>
                  <span className="font-black text-sm text-brand-900 dark:text-brand-400">Price Quoted On RFQ</span>
                </div>
              </div>

              {/* Guest vs Salesman Session Notice */}
              {user?.role === 'guest' ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Salesman Authentication Required</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    Authenticate as an authorized Salesman to generate official printable Sales Invoices.
                  </p>
                  <button
                    onClick={() => setIsSalesmanModalOpen(true)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-colors"
                  >
                    Login as Salesman (ID: AE-SM-001)
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Salesman Session: <strong>{user?.name}</strong> ({user?.salesmanId || 'AE-SM-001'})</span>
                </div>
              )}

              {/* Checkout Action Button */}
              <button
                onClick={handleCheckoutClick}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Confirm Order & Generate Invoice</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Invoice Viewer Modal */}
      <InvoiceModal />
    </div>
  );
};
