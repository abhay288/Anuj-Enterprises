import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, UserCheck, ShieldCheck, Key, ArrowRight, Loader2, User, Sparkles, UserX, Award, LayoutDashboard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SalesmanLoginModal = () => {
  const { 
    isSalesmanModalOpen, 
    setIsSalesmanModalOpen, 
    salesmanModalMode,
    loginSalesman, 
    loginNormalUser, 
    bypassLoginAsGuest,
    loginAdmin 
  } = useApp();

  const [authMode, setAuthMode] = useState(salesmanModalMode || 'salesman');

  useEffect(() => {
    if (salesmanModalMode) {
      setAuthMode(salesmanModalMode);
    }
  }, [salesmanModalMode, isSalesmanModalOpen]);
  
  // Normal User State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Salesman State
  const [salesmanId, setSalesmanId] = useState('AE-SM-001');
  const [salesmanPassword, setSalesmanPassword] = useState('Sales@123');

  // Admin State
  const [adminEmail, setAdminEmail] = useState('admin@anujenterprises.demo');
  const [adminPassword, setAdminPassword] = useState('Admin@123');

  const [isVerifying, setIsVerifying] = useState(false);

  if (!isSalesmanModalOpen) return null;

  const handleSalesmanSubmit = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      loginSalesman(salesmanId, salesmanPassword);
    }, 600);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      loginAdmin(adminEmail, adminPassword);
    }, 600);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userEmail.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      loginNormalUser(userEmail, userName);
    }, 600);
  };

  const fillDemoSalesman = () => {
    setSalesmanId('AE-SM-001');
    setSalesmanPassword('Sales@123');
  };

  const fillDemoAdmin = () => {
    setAdminEmail('anujenterprises.fmcg.006@gmail.com');
    setAdminPassword('Anuj@2026');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 text-white p-6 relative">
            <button
              type="button"
              onClick={() => setIsSalesmanModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-2.5 flex items-center justify-center mb-4 shadow-2xl shadow-amber-500/30 border-2 border-amber-400 overflow-hidden flex-shrink-0 relative ring-4 ring-white/20">
              <img src="/logo.png" alt="Anuj Enterprises Logo" className="w-full h-full object-contain filter drop-shadow-sm scale-110" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">Anuj Enterprises Portal</h3>
            <p className="text-xs text-slate-300 mt-1">
              Select your role authentication mode to proceed
            </p>

            {/* 3-Role Toggle Tabs */}
            <div className="grid grid-cols-3 bg-slate-950/70 p-1 rounded-2xl border border-white/10 mt-4 gap-1">
              <button
                type="button"
                onClick={() => setAuthMode('user')}
                className={`py-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 ${
                  authMode === 'user'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> User
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('salesman')}
                className={`py-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 ${
                  authMode === 'salesman'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Salesman
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('admin')}
                className={`py-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 ${
                  authMode === 'admin'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Admin
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {authMode === 'user' && (
              /* Option 1: Normal User Sign In */
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Sign In / Browse Products</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={bypassLoginAsGuest}
                    className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <UserX className="w-4 h-4 text-slate-500" />
                    <span>Continue as Guest Visitor</span>
                  </button>
                </div>
              </form>
            )}

            {authMode === 'salesman' && (
              /* Option 2: Salesman Login */
              <form onSubmit={handleSalesmanSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Salesman ID *
                    </label>
                    <button
                      type="button"
                      onClick={fillDemoSalesman}
                      className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Fill Demo (AE-SM-001)
                    </button>
                  </div>
                  <div className="relative">
                    <UserCheck className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={salesmanId}
                      onChange={(e) => setSalesmanId(e.target.value)}
                      required
                      placeholder="e.g. AE-SM-001"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Salesman Password *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={salesmanPassword}
                      onChange={(e) => setSalesmanPassword(e.target.value)}
                      required
                      placeholder="Sales@123"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-slate-950 rounded-xl border border-amber-200 dark:border-slate-800 text-[11px] text-amber-800 dark:text-amber-300">
                  Demo Salesman Credentials:<br />
                  <strong>ID:</strong> AE-SM-001 | <strong>Password:</strong> Sales@123
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 px-4 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Activate Salesman Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {authMode === 'admin' && (
              /* Option 3: Admin Login */
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Admin Email *
                    </label>
                    <button
                      type="button"
                      onClick={fillDemoAdmin}
                      className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Fill Demo Admin
                    </button>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      placeholder="admin@anujenterprises.demo"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Admin Password *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="Admin@123"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-slate-950 rounded-xl border border-emerald-200 dark:border-slate-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                  Registered Admin Credentials:<br />
                  <strong>Email:</strong> anujenterprises.fmcg.006@gmail.com | <strong>Password:</strong> Anuj@2026
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Enter Enterprise Admin Panel</span>
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
