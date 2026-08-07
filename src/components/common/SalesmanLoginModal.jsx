import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, UserCheck, ShieldCheck, Key, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SalesmanLoginModal = () => {
  const { isSalesmanModalOpen, setIsSalesmanModalOpen, loginSalesman } = useApp();
  const [salesmanId, setSalesmanId] = useState('SLS-101');
  const [password, setPassword] = useState('demo123');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isSalesmanModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      loginSalesman(salesmanId, password);
    }, 1200);
  };

  const fillDemo = () => {
    setSalesmanId('SLS-101');
    setPassword('demo123');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-slate-900 text-white p-6 relative">
            <button
              onClick={() => setIsSalesmanModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Salesman B2B Auth Portal</h3>
            <p className="text-xs text-slate-300 mt-1">
              Authorized Representatives & Enterprise Account Managers
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Salesman / Partner ID
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={salesmanId}
                    onChange={(e) => setSalesmanId(e.target.value)}
                    required
                    placeholder="e.g. SLS-101"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Access Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-900 focus:ring-brand-500" />
                  Remember Session
                </label>
                <button type="button" onClick={fillDemo} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                  Auto-fill Demo Auth
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Demo Credentials: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">SLS-101</span> / <span className="font-mono font-bold text-slate-800 dark:text-slate-200">demo123</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
