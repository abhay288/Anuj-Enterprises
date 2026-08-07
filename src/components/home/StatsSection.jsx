import React from 'react';
import { motion } from 'framer-motion';
import { PackageCheck, Users, Building, ShieldCheck } from 'lucide-react';

export const StatsSection = () => {
  const stats = [
    { id: 1, label: "Products Delivered", value: "50,000+", icon: PackageCheck, color: "text-brand-500", bg: "bg-brand-50 dark:bg-slate-800" },
    { id: 2, label: "Enterprise Clients", value: "1,200+", icon: Users, color: "text-amber-500", bg: "bg-amber-50 dark:bg-slate-800" },
    { id: 3, label: "Years Experience", value: "25+ Yrs", icon: Building, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-slate-800" },
    { id: 4, label: "Trusted OEM Brands", value: "150+", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-50 dark:bg-slate-800" },
  ];

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white block leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
