import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, UserCheck, ShieldCheck, Key, ArrowRight, Loader2, User, Sparkles, UserX, Award, LayoutDashboard, UserPlus, LogIn, Store, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { checkUnwantedContent } from '../../utils/securityUtils';

export const SalesmanLoginModal = () => {
  const { 
    isSalesmanModalOpen, 
    setIsSalesmanModalOpen, 
    salesmanModalMode,
    loginSalesman, 
    loginNormalUser, 
    saveCustomer,
    bypassLoginAsGuest,
    loginAdmin,
    showToast,
    t
  } = useApp();

  const [authMode, setAuthMode] = useState(salesmanModalMode || 'user');

  useEffect(() => {
    if (salesmanModalMode) {
      setAuthMode(salesmanModalMode);
    }
  }, [salesmanModalMode, isSalesmanModalOpen]);
  
  // Normal User State (Sign In & Self-Registration)
  const [userSubTab, setUserSubTab] = useState('login'); // 'login' | 'register'
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [regForm, setRegForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    address: '',
    city: 'Kanpur',
    state: 'Uttar Pradesh'
  });

  // Salesman State
  const [salesmanId, setSalesmanId] = useState('');
  const [salesmanPassword, setSalesmanPassword] = useState('');

  // Admin State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);

  if (!isSalesmanModalOpen) return null;

  const handleSalesmanSubmit = (e) => {
    e.preventDefault();
    const check = checkUnwantedContent(salesmanId);
    if (check.hasUnwanted) {
      showToast('🚫 Prohibited characters or words detected in Salesman ID.', 'error');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      loginSalesman(salesmanId, salesmanPassword);
    }, 600);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    const check = checkUnwantedContent(adminEmail);
    if (check.hasUnwanted) {
      showToast('🚫 Prohibited characters or words detected in Admin Email.', 'error');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      loginAdmin(adminEmail, adminPassword);
    }, 600);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      showToast('Please enter your Email Address or Mobile Number.', 'warning');
      return;
    }
    const check = checkUnwantedContent(`${userName} ${userEmail}`);
    if (check.hasUnwanted) {
      showToast('🚫 Entry Blocked: Inappropriate or prohibited words detected. Please check your details.', 'error');
      return;
    }
    setIsVerifying(true);
    try {
      await loginNormalUser(userEmail.trim(), userPassword, userName);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUserRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.email.trim()) {
      showToast('Please enter Shop Name and Email Address.', 'warning');
      return;
    }
    if (!regForm.password.trim()) {
      showToast('Please create a password for your account.', 'warning');
      return;
    }
    const check = checkUnwantedContent(`${regForm.name} ${regForm.email} ${regForm.address} ${regForm.city}`);
    if (check.hasUnwanted) {
      showToast(`🚫 Registration Blocked: Inappropriate or prohibited words detected ("${check.matchedWord}"). Please enter clean business details.`, 'error');
      return;
    }
    setIsVerifying(true);
    try {
      await saveCustomer({
        name: regForm.name.trim(),
        mobile: regForm.mobile.trim(),
        email: regForm.email.trim(),
        password: regForm.password.trim(),
        address: regForm.address.trim(),
        city: regForm.city.trim() || 'Kanpur',
        state: regForm.state.trim() || 'Uttar Pradesh',
        classification: 'NORMAL',
        customerMode: 'QUICK'
      });
      await loginNormalUser(regForm.email.trim(), regForm.password.trim(), regForm.name.trim());
      showToast(`Account registered for "${regForm.name}"! Welcome to Anuj Enterprises`, 'success');
    } catch (err) {
      loginNormalUser(regForm.email.trim(), regForm.password.trim(), regForm.name.trim());
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800"
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
                <User className="w-3.5 h-3.5" /> {t('customer_details', 'User')}
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
                <ShieldCheck className="w-3.5 h-3.5" /> {t('salesman_dashboard', 'Salesman')}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('admin')}
                className={`py-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 ${
                  authMode === 'admin'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> {t('nav_admin', 'Admin')}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {authMode === 'user' && (
              <div className="space-y-4">
                {/* Sub-tabs: Sign In vs Self-Registration */}
                <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setUserSubTab('login')}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      userSubTab === 'login'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserSubTab('register')}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      userSubTab === 'register'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register Account
                  </button>
                </div>

                {userSubTab === 'login' ? (
                  /* Option 1: Normal User Sign In */
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Email Address / Mobile Number *
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="customer@example.com or +91 98XXX"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Account Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type={showUserPassword ? "text" : "password"}
                          required
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder="Enter your account password"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUserPassword(!showUserPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
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
                          <span>Sign In / Access Portal</span>
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
                ) : (
                  /* Option 2: Normal User Self-Registration Form */
                  <form onSubmit={handleUserRegisterSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Retail Store / Customer Name *
                      </label>
                      <div className="relative">
                        <Store className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regForm.name}
                          onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                          placeholder="e.g. Mahavir Kirana Store"
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          Mobile Number *
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-xs font-black text-amber-500 select-none">
                            +91
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            required
                            value={regForm.mobile}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setRegForm({ ...regForm, mobile: digits });
                            }}
                            placeholder="98XXXXXXXX"
                            className="w-full pl-11 pr-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          placeholder="store@example.com"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Create Account Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          placeholder="Create strong account password"
                          className="w-full pl-8 pr-9 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={regForm.address}
                          onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                          placeholder="House/Shop No, Market, Landmark, Address"
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          Select City *
                        </label>
                        <select
                          value={isCustomCity ? 'OTHER' : regForm.city}
                          onChange={(e) => {
                            if (e.target.value === 'OTHER') {
                              setIsCustomCity(true);
                              setRegForm({ ...regForm, city: customCity || 'Kanpur' });
                            } else {
                              setIsCustomCity(false);
                              setRegForm({ ...regForm, city: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Kanpur">Kanpur</option>
                          <option value="Lucknow">Lucknow</option>
                          <option value="Unnao">Unnao</option>
                          <option value="Fatehpur">Fatehpur</option>
                          <option value="Prayagraj">Prayagraj (Allahabad)</option>
                          <option value="Varanasi">Varanasi</option>
                          <option value="Agra">Agra</option>
                          <option value="Aligarh">Aligarh</option>
                          <option value="Bareilly">Bareilly</option>
                          <option value="Gorakhpur">Gorakhpur</option>
                          <option value="Jhansi">Jhansi</option>
                          <option value="Meerut">Meerut</option>
                          <option value="Moradabad">Moradabad</option>
                          <option value="Noida / Greater Noida">Noida / Greater Noida</option>
                          <option value="Ghaziabad">Ghaziabad</option>
                          <option value="Mathura">Mathura</option>
                          <option value="Ayodhya">Ayodhya</option>
                          <option value="Etawah">Etawah</option>
                          <option value="Farrukhabad">Farrukhabad</option>
                          <option value="Kannauj">Kannauj</option>
                          <option value="Raebareli">Raebareli</option>
                          <option value="Sultanpur">Sultanpur</option>
                          <option value="Sitapur">Sitapur</option>
                          <option value="Hardoi">Hardoi</option>
                          <option value="Banda">Banda</option>
                          <option value="Delhi NCR">Delhi NCR</option>
                          <option value="Mumbai / Thane">Mumbai / Thane</option>
                          <option value="Patna">Patna</option>
                          <option value="Indore">Indore</option>
                          <option value="Jaipur">Jaipur</option>
                          <option value="OTHER">Enter Other City...</option>
                        </select>

                        {isCustomCity && (
                          <input
                            type="text"
                            required
                            value={customCity}
                            onChange={(e) => {
                              setCustomCity(e.target.value);
                              setRegForm({ ...regForm, city: e.target.value });
                            }}
                            placeholder="Type your city name"
                            className="w-full px-3 py-1.5 mt-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={regForm.state}
                          onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                          placeholder="Uttar Pradesh"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {isVerifying ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Create Account & Start Ordering</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {authMode === 'salesman' && (
              /* Option 2: Salesman Login */
              <form onSubmit={handleSalesmanSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Salesman ID *
                  </label>
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
                      placeholder="Enter Salesman password..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Admin Email *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      placeholder="admin@anujfmcg.com"
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
                      placeholder="Enter Admin password..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
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
