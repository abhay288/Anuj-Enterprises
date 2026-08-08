import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Trash2, ArrowLeft, ShieldCheck, FileText, 
  Building2, ArrowRight, AlertTriangle, CheckCircle2, User 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InvoiceModal } from './InvoiceModal';

export const CartView = () => {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    cartGst, 
    cartGrandTotal, 
    cartTotalQty, 
    user, 
    navigateTo, 
    setIsSalesmanModalOpen,
    checkoutOrder
  } = useApp();

  const [customerName, setCustomerName] = useState('Premier Heavy Metal Fabricators Pvt Ltd');
  const [salesmanIdInput, setSalesmanIdInput] = useState(user.salesmanId || 'SLS-101');
  const [paymentMode, setPaymentMode] = useState('Net 30 Days B2B Credit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckoutClick = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      checkoutOrder({
        companyName: customerName,
        salesmanId: salesmanIdInput || 'SLS-101',
        paymentMode
      });
    }, 800);
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
              Explore our industrial product catalogue for power tools, electrical MCCBs, SKF bearings, and safety equipment with volume tiered discounts.
            </p>
            <button
              onClick={() => navigateTo('catalogue')}
              className="px-8 py-3.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              Browse Industrial Catalog
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
              <button onClick={() => navigateTo('catalogue')} className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
              </button>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              B2B Order Cart & Tax Invoice Summary
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cart Table Container */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Quote Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cart.map((item) => (
                    <tr key={item.product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-contain bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800"
                          />
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 block">
                              {item.product.brand}
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              SKU: {item.product.sku} | HSN: {item.product.hsn}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">
                        Price On Request
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-bold text-slate-900 dark:text-white">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                          >
                            +
                          </button>
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

            {/* Customer & Salesman Details Form */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" /> B2B Order & Invoice Generation
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Corporate Buyer / Company Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Salesman ID
                  </label>
                  <input
                    type="text"
                    value={salesmanIdInput}
                    onChange={(e) => setSalesmanIdInput(e.target.value)}
                    placeholder="e.g. SLS-101"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold uppercase text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checkout & GST Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order Enquiry Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Total Items Quantity</span>
                  <span className="font-bold text-slate-900 dark:text-white">{cartTotalQty} Units</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">Price On Request</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Applicable GST</span>
                  <span className="font-bold text-slate-900 dark:text-white">Quoted on RFQ</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Estimated Total</span>
                  <span className="font-black text-sm text-brand-900 dark:text-brand-400">Price Quoted On RFQ</span>
                </div>
              </div>

              {/* Guest vs Salesman Notice Card */}
              {user.role === 'guest' ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Salesman Authentication Required</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    Guest visitors must authenticate as an authorized Salesman to generate official printable GST Tax Invoices.
                  </p>
                  <button
                    onClick={() => setIsSalesmanModalOpen(true)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-colors"
                  >
                    Authenticate as Salesman (ID: SLS-101)
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Logged in as <strong>{user.name}</strong> ({user.salesmanId})</span>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Generate Official GST Tax Invoice</span>
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
