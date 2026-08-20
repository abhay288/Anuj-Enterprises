import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Building2, Package, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NewArrivalsBanner = () => {
  const { products, brands, navigateTo, addToCart } = useApp();

  // Find New Companies & New Products
  const newCompanies = brands.filter(b => b.isNew || b.name === 'ABC Industries');
  const newProducts = products.filter(p => p.isNew || p.brand === 'ABC Industries');

  if (newProducts.length === 0 && newCompanies.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-amber-950 p-6 sm:p-8 text-white border border-amber-500/30 shadow-2xl"
        >
          {/* Subtle Background Lighting */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Box */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>NEW ARRIVAL LAUNCH</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                ABC Industries — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">New Product Range</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Direct wholesale B2B launch of ABC Industries' newly certified organic protein bars and industrial consumer supply line with exclusive tier pricing & sales invoice fulfillment.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigateTo('catalogue')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Explore ABC Range</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-slate-950/60 px-3 py-2 rounded-xl border border-amber-500/20">
                  <Tag className="w-4 h-4" /> Official Invoice Ready
                </div>
              </div>
            </div>

            {/* Right Product Spotlight Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newProducts.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain bg-white rounded-xl p-1.5 shrink-0"
                    />
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-400 text-slate-950 inline-block mb-1">
                        {item.brand}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-slate-300 block font-mono">SKU: {item.sku}</span>
                    </div>
                  </div>

                  {/* Pack Spec details */}
                  <div className="text-[10px] text-slate-300 bg-slate-950/50 p-2 rounded-xl border border-white/5 space-y-0.5 mb-3">
                    <div>Pack: <strong>{item.packSize || '100g Bar'}</strong></div>
                    <div>Case: <strong>{item.caseSize || '24 Bars'}</strong></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-xs font-black text-amber-400">Quote Pending</span>
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-colors"
                    >
                      + Quick Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
