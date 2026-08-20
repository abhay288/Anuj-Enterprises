import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Award, Users, CheckCircle2, Globe, Truck, Phone, Store, PackageCheck, HeartHandshake, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AboutView = () => {
  const { navigateTo } = useApp();

  const corePillars = [
    {
      icon: <PackageCheck className="w-6 h-6" />,
      color: "bg-amber-500 text-slate-950",
      title: "100% Genuine FMCG Supply",
      desc: "Direct procurement from leading brand manufacturers including Amul, Nestlé, Britannia, Cadbury, Colgate, and HUL. Guaranteed authentic packaging with complete batch traceability."
    },
    {
      icon: <Truck className="w-6 h-6" />,
      color: "bg-brand-900 text-white",
      title: "Kanpur Central Distribution Hub",
      desc: "Strategically located central warehouse in Kanpur, Uttar Pradesh, providing rapid order dispatch and dependable supply to retailers, supermarkets, and wholesale buyers."
    },
    {
      icon: <Users className="w-6 h-6" />,
      color: "bg-emerald-500 text-white",
      title: "Dedicated Field Sales Force",
      desc: "Trained on-ground sales representatives and account managers providing regular store visits, stock replenishment, and personalized customer care."
    }
  ];

  const brandSegments = [
    "Dairy & UHT Beverages (Amul, Nestlé)",
    "Chocolates & Confectionery (Cadbury, Mondelez)",
    "Biscuits, Cookies & Breakfast Cereals",
    "Personal Care, Soaps & Oral Hygiene (Colgate, Dove)",
    "Packaged Snacks & Grocery Essentials"
  ];

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 font-extrabold text-xs uppercase tracking-widest inline-block border border-amber-300 dark:border-amber-800">
            Kanpur, Uttar Pradesh
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            About Anuj Enterprises
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Anuj Enterprises is your trusted B2B FMCG distribution and wholesale sourcing partner in Kanpur, Uttar Pradesh. We connect retail merchants, institutions, and supermarkets with India's most beloved consumer brands with uncompromised quality and dependable service.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {corePillars.map((pillar, idx) => (
            <div 
              key={idx} 
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-amber-400 transition-colors"
            >
              <div className={`w-12 h-12 rounded-2xl ${pillar.color} flex items-center justify-center font-bold shadow-md`}>
                {pillar.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pillar.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Our Mission & Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Mission Card */}
          <div className="p-8 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                <Store className="w-5 h-5" />
                <span>Our Core Purpose</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Empowering Retailers with Reliable FMCG Supply
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                Our mission is to eliminate supply chain uncertainties for retail business owners. By maintaining ready inventory of high-turnover FMCG staples and offering flexible offline collection booking, we ensure our partners never run out of critical customer favorites.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Direct manufacturer relationships with guaranteed authenticity</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fast order processing and direct warehouse dispatch in Kanpur</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dedicated field salesman support for personalized store visits</span>
              </div>
            </div>
          </div>

          {/* Product Categories & Sourcing Scope */}
          <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 text-white shadow-xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-5 h-5" />
                <span>Product Portfolio</span>
              </div>
              <h2 className="text-2xl font-black">
                Leading National FMCG Brand Portfolios
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed">
                We distribute a comprehensive catalog of top consumer packaged goods across multiple essential segments:
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                {brandSegments.map((segment, index) => (
                  <li key={index} className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span>{segment}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-300">Headquarters & Central Hub:</span>
              <strong className="text-xs text-amber-400 font-bold">Kanpur, Uttar Pradesh</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
