import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Percent, Headset, FileText, CheckCircle } from 'lucide-react';

export const WhyChooseUs = () => {
  const features = [
    {
      id: 1,
      title: "100% Genuine FMCG Brands",
      desc: "Direct authorized distribution with Amul, Nestlé, Britannia, Cadbury, Colgate, and HUL with complete batch authenticity.",
      icon: ShieldCheck,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/40"
    },
    {
      id: 2,
      title: "Kanpur Central Warehouse",
      desc: "Centralized warehouse hub in Kanpur, Uttar Pradesh for dependable dispatch across regional retail networks.",
      icon: Truck,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/40"
    },
    {
      id: 3,
      title: "Wholesale Case Packaging",
      desc: "Master cartons, bundle packaging, and dependable wholesale volume supply for supermarkets and retail stores.",
      icon: Percent,
      color: "text-brand-500",
      bg: "bg-brand-50 dark:bg-brand-950/40"
    },
    {
      id: 4,
      title: "Dedicated Field Sales Force",
      desc: "Assigned sales representatives for regular store visits, stock replenishment, and personalized customer care.",
      icon: Headset,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/40"
    }
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">
            Enterprise Value Proposition
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why India's Top EPCs & OEMs Trust Anuj Enterprises
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
