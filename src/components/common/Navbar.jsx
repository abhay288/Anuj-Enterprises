import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, ShoppingCart, Menu, X, 
  ChevronDown, ShieldCheck, User, LogOut, LayoutDashboard 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar = () => {
  const { 
    view, 
    navigateTo, 
    cartTotalQty, 
    user, 
    logout, 
    setIsSalesmanModalOpen, 
    loginAdmin, 
    categories,
    filterByCategory,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('catalogue');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      {/* Top Banner for Enterprise Credentials */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> ISO 9001:2015 Certified B2B Supplier
          </span>
          <span>GSTIN: <strong className="text-white">27AAACA12341ZV</strong></span>
          <span>24/7 Hotline: <strong className="text-white">+91 (022) 6890-4400</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateTo('about')}
            className="hover:text-amber-400 transition-colors"
          >
            Company Overview
          </button>
          <span>•</span>
          <button 
            onClick={() => navigateTo('contact')}
            className="hover:text-amber-400 transition-colors"
          >
            Locate Branches
          </button>
          <span>•</span>
          {user.role === 'guest' ? (
            <button 
              onClick={loginAdmin}
              className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <LayoutDashboard className="w-3 h-3" /> Admin Portal
            </button>
          ) : (
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              Logged in: {user.name} ({user.role})
            </span>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-950 via-brand-900 to-brand-800 text-amber-400 flex items-center justify-center shadow-lg shadow-brand-900/30 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                ANUJ
              </span>
              <span className="text-xl font-extrabold tracking-tight text-brand-900 dark:text-brand-400">
                ENTERPRISES
              </span>
            </div>
            <span className="text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase block -mt-1">
              Your Trusted Industrial Partner
            </span>
          </div>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md relative">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKUs, HSN, Bosch, Siemens, MCCB, Bearings..."
              className="w-full pl-10 pr-24 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
            />
            <button 
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => navigateTo('home')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === 'home' 
                ? 'text-brand-900 dark:text-brand-400 bg-brand-50/80 dark:bg-slate-800' 
                : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => navigateTo('catalogue')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === 'catalogue' 
                ? 'text-brand-900 dark:text-brand-400 bg-brand-50/80 dark:bg-slate-800' 
                : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-white'
            }`}
          >
            Products
          </button>

          {/* Categories Mega Menu Trigger */}
          <div className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
            <button
              onClick={() => navigateTo('catalogue')}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-white flex items-center gap-1"
            >
              Categories <ChevronDown className="w-4 h-4" />
            </button>

            {/* Mega Menu Dropdown */}
            <AnimatePresence>
              {isMegaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full pt-2 w-80 z-50"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 gap-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
                      Industrial Equipment Categories
                    </span>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          filterByCategory(cat.name);
                        }}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <span>{cat.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]">
                          {cat.count} items
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => navigateTo('about')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === 'about' 
                ? 'text-brand-900 dark:text-brand-400 bg-brand-50/80 dark:bg-slate-800' 
                : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-white'
            }`}
          >
            About
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === 'contact' 
                ? 'text-brand-900 dark:text-brand-400 bg-brand-50/80 dark:bg-slate-800' 
                : 'text-slate-700 dark:text-slate-300 hover:text-brand-900 dark:hover:text-white'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Action Controls & User Dropdown */}
        <div className="flex items-center gap-2">
          {/* Cart Icon */}
          <button
            onClick={() => navigateTo('cart')}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartTotalQty > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-900 dark:bg-brand-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow">
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
                  className="hidden sm:flex items-center gap-1.5 bg-brand-900 hover:bg-brand-800 text-white dark:bg-brand-600 dark:hover:bg-brand-500 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-900/20 transition-all hover:scale-105"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Salesman Login</span>
                </button>
                <button
                  onClick={loginAdmin}
                  className="hidden md:flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all"
                >
                  Admin
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
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
                        {user.role === 'salesman' && (
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigateTo('salesman-dash');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-500" /> Salesman Dashboard
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
                            <LayoutDashboard className="w-4 h-4 text-amber-500" /> Enterprise Admin Panel
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> End B2B Session
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm"
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
                Home
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('catalogue');
                }}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold text-xs text-left"
              >
                Product Catalogue
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('about');
                }}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold text-xs text-left"
              >
                About Us
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo('contact');
                }}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-semibold text-xs text-left"
              >
                Contact
              </button>
            </div>

            {user.role === 'guest' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSalesmanModalOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-brand-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Salesman Login
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    loginAdmin();
                  }}
                  className="py-2.5 px-4 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Admin
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
