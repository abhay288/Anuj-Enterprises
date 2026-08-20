import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, Percent, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FlipkartBanner = () => {
  const { navigateTo, setIsSalesmanModalOpen } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: "B2B Wholesale FMCG Mega Sale",
      subtitle: "Up to 25% Volume Tiered Discounts on Amul, Nestlé & HUL Master Crates",
      tag: "DIRECT FACTORY RATES",
      bgColor: "from-brand-950 via-brand-900 to-slate-900",
      accentColor: "text-amber-400",
      badge: "Sales Invoice Included",
      btnText: "Explore Bulk Crates",
      target: "catalogue"
    },
    {
      id: 2,
      title: "Fast Dispatch for Supermarkets & Retailers",
      subtitle: "Direct Warehouse Fulfillment & Delivery from Kanpur Hub",
      tag: "FAST REGIONAL DISPATCH",
      bgColor: "from-slate-900 via-slate-950 to-brand-950",
      accentColor: "text-emerald-400",
      badge: "100% Genuine FMCG Sourcing",
      btnText: "View FMCG Products",
      target: "catalogue"
    },
    {
      id: 3,
      title: "Field Salesman & Store Order Booking",
      subtitle: "Authorized Sales Representatives for Regular Store Visits & Stock Replenishment",
      tag: "B2B SALES FORCE",
      bgColor: "from-brand-900 via-slate-900 to-amber-950",
      accentColor: "text-amber-300",
      badge: "Salesman Portal Ready",
      btnText: "Authenticate as Salesman",
      action: "salesman"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeBanner = banners[currentSlide];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${activeBanner.bgColor} text-white p-6 sm:p-10 shadow-xl border border-slate-800 transition-all duration-500`}>
        
        {/* Banner Content */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-extrabold tracking-widest uppercase text-amber-400 border border-amber-400/30">
                {activeBanner.tag}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {activeBanner.badge}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {activeBanner.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {activeBanner.subtitle}
            </p>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <button
              onClick={() => {
                if (activeBanner.action === 'salesman') {
                  setIsSalesmanModalOpen(true);
                } else {
                  navigateTo('catalogue');
                }
              }}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>{activeBanner.btnText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center gap-1.5 justify-center mt-6">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
