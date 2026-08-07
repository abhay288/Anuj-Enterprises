import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductCard = ({ product }) => {
  const { addToCart, openQuickView, navigateTo } = useApp();

  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Image Area */}
      <div className="relative p-4 bg-slate-50/80 dark:bg-slate-950/60 overflow-hidden flex items-center justify-center h-52 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-brand-950 text-white dark:bg-brand-600 shadow">
            {product.brand}
          </span>
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500 text-white shadow">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="max-h-44 max-w-full object-contain group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={() => navigateTo('product-detail', product.id)}
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <button
            onClick={() => openQuickView(product)}
            className="w-full py-2 bg-slate-900/90 text-white dark:bg-slate-800/90 backdrop-blur-md rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg hover:bg-brand-900 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span>SKU: <strong className="text-slate-700 dark:text-slate-300">{product.sku}</strong></span>
            <span>Stock: <strong className="text-emerald-600 dark:text-emerald-400">{product.stock} units</strong></span>
          </div>

          <h3 
            onClick={() => navigateTo('product-detail', product.id)}
            className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-900 dark:hover:text-brand-400 cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-1 text-xs text-amber-500 mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{product.rating}</span>
            <span className="text-slate-400">({product.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Price & Cart Trigger */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg font-extrabold text-brand-900 dark:text-brand-400">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 line-through ml-2">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              + {product.gstRate}% GST
            </span>
          </div>

          {/* Tier hint */}
          {product.bulkTiers && (
            <div className="bg-brand-50/70 dark:bg-slate-800/60 p-2 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 flex justify-between items-center">
              <span>Bulk Tier Rate:</span>
              <strong className="text-brand-900 dark:text-brand-400 font-bold">
                ₹{product.bulkTiers[product.bulkTiers.length - 1].price.toLocaleString('en-IN')}
              </strong>
            </div>
          )}

          <button
            onClick={() => addToCart(product, 1)}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-brand-900 text-white dark:bg-brand-600 dark:hover:bg-brand-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};
