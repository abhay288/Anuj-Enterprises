import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wrench, Zap, Cog, ShieldCheck, Cpu, Layers, Flame, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CategoriesSection = () => {
  const { categories, filterByCategory } = useApp();

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      case 'Cog': return <Cog className="w-6 h-6" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'Layers': return <Layers className="w-6 h-6" />;
      case 'Flame': return <Flame className="w-6 h-6" />;
      default: return <Truck className="w-6 h-6" />;
    }
  };

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">
              Engineered Equipment Categories
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Industrial Departments
            </h2>
          </div>
          <button
            onClick={() => filterByCategory('All')}
            className="text-sm font-bold text-brand-900 dark:text-brand-400 hover:underline flex items-center gap-1.5 self-start md:self-auto"
          >
            Explore All 8 Categories <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => filterByCategory(cat.name)}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                
                <div className="absolute top-3 left-3 p-2.5 rounded-xl bg-brand-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
                  {getIcon(cat.icon)}
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between bg-white dark:bg-slate-900">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {cat.count}+ Ready Stock Items
                </span>
                <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-brand-900 group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
