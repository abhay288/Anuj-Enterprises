import React from 'react';
import { useApp } from '../../context/AppContext';

export const BrandTicker = () => {
  const { brands } = useApp();

  return (
    <section className="py-10 bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
          Authorized Direct Industrial Distributor For
        </span>
      </div>

      <div className="flex overflow-hidden relative group">
        <div className="flex gap-12 animate-marquee whitespace-nowrap py-2">
          {brands.concat(brands).map((brand, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg hover:border-amber-400/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-amber-400 text-sm">
                {brand.name.charAt(0)}
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">{brand.name}</span>
                <span className="text-[10px] text-slate-400">{brand.country} • {brand.count}+ Products</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
