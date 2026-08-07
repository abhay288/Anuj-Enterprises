import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Award, Users, CheckCircle2, Globe, Truck, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AboutView = () => {
  const { navigateTo } = useApp();

  const timeline = [
    { year: "2001", title: "Foundation in Mumbai", desc: "Started as a regional distributor of industrial fasteners and basic hand tools." },
    { year: "2008", title: "Direct OEM Partnerships", desc: "Secured direct national distributorship with Bosch, Siemens, and SKF Bearings." },
    { year: "2015", title: "Pan-India Warehousing", desc: "Expanded dispatch hubs to Delhi NCR and Bengaluru with 24-hour freight SLAs." },
    { year: "2026", title: "Digital B2B Platform Launch", desc: "Introduced instant GST tax invoicing, real-time stock allocation, and Salesman portal." }
  ];

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-900 dark:bg-slate-800 dark:text-amber-400 font-extrabold text-xs uppercase tracking-widest inline-block">
            25+ Years of B2B Excellence
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Anuj Enterprises — Engineering India's Industrial Supply Chain
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            From heavy infrastructure projects to precision automotive plants, Anuj Enterprises supplies over 50,000+ certified OEM products with 100% transparent GST tax credits and credit facilities.
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">ISO 9001:2015 Certified</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Strict quality inspection protocols ensuring 0% counterfeit parts. Every shipment includes original manufacturer test certificates.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pan-India Freight Logistics</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Strategic warehousing in Mumbai, Delhi, and Bengaluru guarantees same-day dispatch and 24-hour delivery SLAs for critical site spares.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">B2B Corporate Credit Facilities</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Flexible Net 30 to Net 60 days payment credit terms for audited corporate buyers, OEMs, and government EPC contractors.
            </p>
          </div>
        </div>

        {/* Corporate Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-sm space-y-8">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">
            Our 25-Year Growth Journey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                <span className="text-2xl font-black text-amber-500 block mb-1">{item.year}</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
