import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, ShoppingCart, Menu, X, 
  ChevronDown, ShieldCheck, User, LogOut, LayoutDashboard, HelpCircle, Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationCenter } from './NotificationCenter';
import { HeadlineBar } from './HeadlineBar';

export const Navbar = () => {
  const { 
    view, 
    navigateTo, 
    cartTotalQty, 
    user, 
    logout, 
    setIsSalesmanModalOpen, 
    searchQuery,
    setSearchQuery,
    language,
    toggleLanguage,
    t
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('catalogue');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl backdrop-saturate-150 border-b border-slate-200/60 dark:border-slate-800/60 shadow-md shadow-slate-950/5 transition-all">
      {/* Top Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 shrink-0"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border-2 border-amber-400 p-0.5 sm:p-1 flex items-center justify-center shadow-md sm:shadow-xl group-hover:scale-105 group-hover:border-amber-500 transition-all overflow-hidden flex-shrink-0 relative ring-2 sm:ring-4 ring-amber-500/20">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img 
                src="/logo.png" 
                alt="Anuj Enterprises Logo" 
                className="w-full h-full object-contain scale-110" 
                width="64"
                height="64"
                loading="eager"
              />
            </picture>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 leading-tight whitespace-nowrap">
              <span className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                ANUJ
              </span>
              <span className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-brand-900 dark:text-amber-400">
                ENTERPRISES
              </span>
            </div>
            <span className="text-[8px] sm:text-xs font-extrabold tracking-widest text-amber-800 dark:text-amber-300 uppercase block mt-0.5 truncate max-w-[130px] sm:max-w-none">
              {t('trusted_partner', 'Your Trusted Supply Partner')}
            </span>
          </div>
        </div>

        {/* Live Search Bar (Responsive on Tablet & Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 min-w-[140px] max-w-xs lg:max-w-sm xl:max-w-md relative mx-1 lg:mx-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', 'Search FMCG SKUs, Amul, Nestlé...')}
              className="w-full pl-10 pr-20 sm:pr-24 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all truncate"
            />
            <button 
              type="submit"
              className="absolute right-1.5 top-1.5 px-2.5 sm:px-3 py-1 bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              {t('search', 'Search')}
            </button>
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
          <button
            onClick={() => navigateTo('home')}
            className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              view === 'home' 
                ? 'text-brand-900 dark:text-brand-400 bg-brand-50/80 dark:bg-slate-800' 
                : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-white'
            }`}
          >
            {t('nav_home', 'Home')}
          </button>

          <button
            onClick={() => navigateTo('about')}
            className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              view === 'about' 
                ? 'text-brand-900 dark:text-brand-400 bg-brand-50/80 dark:bg-slate-800' 
                : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-white'
            }`}
          >
            {t('nav_about', 'About')}
          </button>

          <button
            onClick={() => navigateTo('support')}
            className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
              view === 'support' || view === 'contact' 
                ? 'text-brand-900 dark:text-brand-400 bg-brand-50/80 dark:bg-slate-800' 
                : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-white'
            }`}
          >
            {t('nav_support', 'Support & FAQ')}
          </button>
        </nav>

        {/* Action Controls & User Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Switcher Toggle (EN | हिंदी) */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Switch Language (English or Hindi)"
            title={language === 'en' ? 'Switch to Easy Hindi (हिंदी)' : 'Switch to English'}
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-400/60 bg-amber-50 dark:bg-amber-950/60 text-slate-900 dark:text-slate-100 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all font-bold text-xs shadow-xs shrink-0 whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className={language === 'en' ? 'text-amber-900 dark:text-amber-300 font-extrabold text-[11px] sm:text-xs' : 'text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs'}>
              EN
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">|</span>
            <span className={language === 'hi' ? 'text-amber-900 dark:text-amber-300 font-extrabold text-[11px] sm:text-xs' : 'text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs'}>
              हिंदी
            </span>
          </button>

          {/* Notification Center - Admin Only */}
          {user.role === 'admin' && (
            <NotificationCenter role="ADMIN" />
          )}

          {/* Cart Icon */}
          <button
            type="button"
            onClick={() => navigateTo('cart')}
            aria-label={`View Shopping Cart (${cartTotalQty} items)`}
            className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center shrink-0"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartTotalQty > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-brand-900 dark:bg-brand-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow">
                {cartTotalQty}
              </span>
            )}
          </button>

          {/* User Account / Login Dropdown */}
          <div className="relative">
            {user.role === 'guest' ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsSalesmanModalOpen(true)}
                  className="flex items-center gap-1.5 bg-brand-900 hover:bg-brand-800 text-white dark:bg-brand-600 dark:hover:bg-brand-500 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-900/20 transition-all hover:scale-105 whitespace-nowrap shrink-0"
                  title="Login / Sign Up"
                >
                  <User className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">{t('nav_salesman', 'Login / Sign Up')}</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-brand-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate max-w-[100px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                </button>

                {/* User Menu Popup */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full pt-2 w-56 z-50"
                    >
                      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 space-y-1">
                        {user.role === 'customer' && (
                          <>
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                navigateTo('customer-dash');
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl flex items-center gap-2"
                            >
                              <LayoutDashboard className="w-4 h-4 text-amber-500" /> Customer Portal & Invoices
                            </button>
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                navigateTo('customer-dash');
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                            >
                              <User className="w-4 h-4 text-slate-400" /> Store Profile & Settings
                            </button>
                          </>
                        )}

                        {user.role === 'salesman' && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigateTo('salesman-dash');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-500" /> {t('salesman_dashboard', 'Salesman Dashboard')}
                          </button>
                        )}

                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigateTo('admin-dash');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-500" /> {t('admin_dashboard', 'Executive Admin Dashboard')}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> {t('logout', 'End B2B Session')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Announcement / Subline */}
      <HeadlineBar />

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3"
          >
            <form 
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setIsMobileMenuOpen(false);
              }} 
              className="relative"
            >
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', 'Search FMCG SKUs, Amul, Nestlé...')}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </form>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('home');
                }}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold text-xs text-left"
              >
                {t('nav_home', 'Home')}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('about');
                }}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold text-xs text-left"
              >
                {t('nav_about', 'About Us')}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('contact');
                }}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold text-xs text-left cursor-pointer"
              >
                {t('nav_contact', 'Contact Us')}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('support');
                }}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold text-xs text-left cursor-pointer"
              >
                {t('nav_support', 'Support & FAQ')}
              </button>
            </div>

            {user.role === 'guest' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSalesmanModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-brand-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> {t('nav_salesman', 'Login / Sign Up')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
