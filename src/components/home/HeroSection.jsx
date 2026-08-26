import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Award, Truck, Building2, Search, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Enterprise3DModel = lazy(() => import('./Enterprise3DModel'));

export const HeroSection = () => {
  const { navigateTo, setIsSalesmanModalOpen, searchQuery, setSearchQuery } = useApp();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('catalogue');
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Background Graphic Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-0 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/60 backdrop-blur-md text-xs font-semibold text-amber-400 shadow-lg"
            >
              <Award className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>India's Premier B2B FMCG & Consumer Goods Wholesale Distributor</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
            >
              Powering India's <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                FMCG Supply Chain
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed"
            >
              Direct factory wholesale supply for Milk, Beverages, Cereals, Soaps, Shampoos, Toothpaste & Snacks. Net 30 B2B Credit, Instant B2B Invoicing & 24h Express Freight.
            </motion.p>

            {/* Search Bar in Hero */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearchSubmit} 
              className="relative max-w-xl"
            >
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 1,200+ Wholesale FMCG SKUs (Amul, Nestlé, Dove, Colgate...)"
                className="w-full pl-12 pr-32 py-3.5 bg-slate-800/90 border border-slate-700 rounded-2xl text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xl backdrop-blur-md"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Find Products
              </button>
            </motion.form>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button
                onClick={() => navigateTo('catalogue')}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center gap-2 group transition-all"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Catalog
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setIsSalesmanModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 backdrop-blur-md flex items-center gap-2 transition-all shadow-lg"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Login/SignUp
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400"
            >
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" /> 24h Express Route Dispatch
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Genuine Direct Mill Stock
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-400" /> Official B2B Sales Invoice
              </span>
            </motion.div>
          </div>

          {/* Right Column Interactive 3D Model */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              <Suspense fallback={
                <div className="w-full h-[380px] sm:h-[420px] rounded-3xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center animate-pulse">
                  <div className="text-center p-6 space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/30 mx-auto flex items-center justify-center">
                      <Truck className="w-8 h-8 text-amber-400 animate-bounce" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Anuj Supply Chain 3D</p>
                  </div>
                </div>
              }>
                <Enterprise3DModel />
              </Suspense>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
