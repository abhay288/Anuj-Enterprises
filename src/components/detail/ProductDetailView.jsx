import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, ShoppingCart, ShieldCheck, Truck, ArrowLeft, 
  CheckCircle2, FileText, Phone, Building2, ChevronRight, Layers, Tag 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../catalogue/ProductCard';

export const ProductDetailView = () => {
  const { 
    selectedProductId, 
    products, 
    addToCart, 
    navigateTo,
    setIsSalesmanModalOpen
  } = useApp();

  const product = products.find(p => p.id === selectedProductId) || products[0];
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [qty, setQty] = useState(product.minOrderQty || 1);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  // Price tier calculation
  let unitPrice = product.price;
  if (product.bulkTiers && product.bulkTiers.length > 0) {
    if (qty >= 21) unitPrice = product.bulkTiers[2]?.price || unitPrice;
    else if (qty >= 6) unitPrice = product.bulkTiers[1]?.price || unitPrice;
    else unitPrice = product.bulkTiers[0]?.price || unitPrice;
  }

  const subtotal = unitPrice * qty;
  const gstAmount = Math.round(subtotal * (product.gstRate / 100));
  const totalAmount = subtotal + gstAmount;

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back button & Breadcrumbs */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateTo('catalogue')}
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-900 dark:hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalogue
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Catalogue</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{product.category}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-slate-900 dark:text-white">{product.brand}</span>
          </div>
        </div>

        {/* Main Product Card Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Gallery Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative h-80 md:h-96 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center overflow-hidden">
                <span className="absolute top-4 left-4 px-3 py-1 bg-brand-950 text-amber-400 text-xs font-extrabold rounded-lg uppercase tracking-wider">
                  {product.brand} OEM Direct
                </span>
                <img
                  src={images[selectedImgIndex]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105"
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`w-20 h-20 rounded-xl bg-slate-50 dark:bg-slate-950 border p-2 overflow-hidden transition-all ${
                        selectedImgIndex === idx
                          ? 'border-amber-500 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Purchase Controls */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="flex items-center gap-3 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>SKU: <strong className="text-slate-800 dark:text-slate-200">{product.sku}</strong></span>
                  <span>•</span>
                  <span>HSN: <strong className="text-slate-800 dark:text-slate-200">{product.hsn}</strong></span>
                  <span>•</span>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500 mr-1" />
                    <span className="text-slate-800 dark:text-slate-200">{product.rating}</span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price & GST Section */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-brand-900 dark:text-brand-400">
                    ₹{unitPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 line-through ml-3">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mt-1">
                    Excluding {product.gstRate}% GST (Tax Credit Available)
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-lg">
                    In Stock ({product.stock} units)
                  </span>
                </div>
              </div>

              {/* Bulk Tier Break Table */}
              {product.bulkTiers && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Volume Pricing Tiers
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {product.bulkTiers.map((tier, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border text-center transition-all ${
                          unitPrice === tier.price 
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 font-bold' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">{tier.qty}</span>
                        <span className="text-sm font-extrabold text-brand-900 dark:text-brand-400">₹{tier.price.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Actions */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Quantity (Units):
                  </span>
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-4 py-2 font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      -
                    </button>
                    <span className="px-5 py-2 font-extrabold text-sm text-slate-900 dark:text-white min-w-[3rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-4 py-2 font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal Preview */}
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Subtotal: <strong className="text-slate-900 dark:text-white font-bold">₹{subtotal.toLocaleString('en-IN')}</strong> + GST (₹{gstAmount.toLocaleString('en-IN')}) = <strong className="text-brand-900 dark:text-brand-400 font-extrabold text-sm">₹{totalAmount.toLocaleString('en-IN')}</strong>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => addToCart(product, qty)}
                    className="flex-1 py-3.5 px-6 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-extrabold rounded-xl shadow-lg shadow-brand-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <ShoppingCart className="w-5 h-5" /> Add to B2B Cart
                  </button>

                  <button
                    onClick={() => setIsSalesmanModalOpen(true)}
                    className="py-3.5 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow flex items-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Direct Sales Quote
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Technical Specs Table & Description Tabs */}
          <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">
              Technical Specifications & OEM Compliance
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {product.description}
            </p>

            {product.specs && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val], idx) => (
                      <tr 
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-950/60' : 'bg-white dark:bg-slate-900'}
                      >
                        <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 w-1/3 border border-slate-200 dark:border-slate-800">
                          {key}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium border border-slate-200 dark:border-slate-800">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Related Industrial Supplies in {product.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
