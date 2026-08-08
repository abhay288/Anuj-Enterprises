import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, UserCheck, ShieldCheck, Key, ArrowRight, Loader2, User, Sparkles, UserX } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SalesmanLoginModal = () => {
  const { 
    isSalesmanModalOpen, 
    setIsSalesmanModalOpen, 
    loginSalesman, 
    loginNormalUser, 
    bypassLoginAsGuest 
  } = useApp();

  const [authMode, setAuthMode] = useState('user'); // 'user' | 'salesman'
  
  // Normal User State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Salesman State
  const [salesmanId, setSalesmanId] = useState('SLS-101');
  const [password, setPassword] = useState('demo123');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isSalesmanModalOpen) return null;

  const handleSalesmanSubmit = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      loginSalesman(salesmanId, password);
    }, 1000);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userEmail.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      loginNormalUser(userEmail, userName);
    }, 800);
  };

  const fillDemoSalesman = () => {
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
          <div className="bg-gradient-to-r from-slate-950 via-brand-900 to-slate-900 text-white p-6 relative">
            <button
              type="button"
              onClick={() => setIsSalesmanModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Anuj Enterprises Portal</h3>
            <p className="text-xs text-slate-300 mt-1">
              Select your authentication mode to proceed
            </p>

            {/* Auth Mode Toggle Tabs */}
            <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/10 mt-4">
              <button
                type="button"
                onClick={() => setAuthMode('user')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'user'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Normal User Sign In
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('salesman')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'salesman'
                    ? 'bg-brand-600 text-white shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Salesman Login
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {authMode === 'user' ? (
              /* Option 1: Normal User Sign In / Sign Up & Guest Bypass */
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Sign In / Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Bypass Login Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={bypassLoginAsGuest}
                    className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <UserX className="w-4 h-4 text-slate-500" />
                    <span>Bypass Login (Continue as Guest User)</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Option 2: Salesman Login */
              <form onSubmit={handleSalesmanSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Salesman / Partner ID *
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
                    Access Password *
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
                  <span className="text-slate-500">Salesman Access</span>
                  <button type="button" onClick={fillDemoSalesman} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                    Auto-fill Demo Auth (SLS-101)
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
                      <span>Salesman Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
