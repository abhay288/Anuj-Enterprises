import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, ShoppingCart, ArrowLeft, ChevronRight, Maximize2, 
  Phone, Sparkles, Box, Check, X, Layers, Building2, 
  TrendingDown, ShieldCheck, Truck, RefreshCw, ZoomIn, Info, Share2, Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../catalogue/ProductCard';
import { updatePageSEO } from '../../utils/seoUtils';
import { generateProductSlug } from '../../utils/slugUtils';

export const ProductDetailView = () => {
  const { 
    selectedProductId, 
    products, 
    addToCart, 
    navigateTo,
    setIsSalesmanModalOpen,
    showToast
  } = useApp();

  const product = products.find(p => p.id === selectedProductId || p.productId === selectedProductId) || products[0];
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [qty, setQty] = useState(product.minOrderQty || 1);

  // White background preview mode & Fullscreen zoom
  const [isWhiteBgMode, setIsWhiteBgMode] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const imageContainerRef = useRef(null);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  // Dynamic SEO on Product Page Mount / Selection
  useEffect(() => {
    if (product) {
      updatePageSEO({
        title: `${product.name} (Wholesale B2B) - ${product.brand}`,
        description: `Source ${product.name} from Anuj Enterprises. SKU: ${product.sku}, HSN: ${product.hsn || '19053100'}. Tiered wholesale pricing, pack/case discounts, and official GST invoice supply.`,
        image: product.image,
        url: window.location.href,
        product
      });
    }
  }, [product]);

  // Smart Related Products Algorithm (Category match + Brand match + Tag ranking)
  const relatedProducts = React.useMemo(() => {
    return products
      .filter(p => p.id !== product.id && p.productId !== product.id)
      .map(p => {
        let score = 0;
        if (p.category === product.category) score += 3;
        if (p.brand === product.brand) score += 2;
        if (p.hsn === product.hsn) score += 1;
        return { product: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 4);
  }, [products, product]);

  // Similar Brand Products (Same Company)
  const sameBrandProducts = React.useMemo(() => {
    return products
      .filter(p => p.brand === product.brand && p.id !== product.id && p.productId !== product.id)
      .slice(0, 4);
  }, [products, product]);

  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value, 10);
    setQty(isNaN(val) || val <= 0 ? '' : val);
  };

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const calculateTierPrice = (quantity) => {
    const q = parseInt(quantity) || 1;
    if (!product.bulkTiers || product.bulkTiers.length === 0) return product.price;
    if (q >= 21) return product.bulkTiers[2]?.price || product.price;
    if (q >= 6) return product.bulkTiers[1]?.price || product.price;
    return product.bulkTiers[0]?.price || product.price;
  };

  const currentUnitPrice = calculateTierPrice(qty);
  const currentTotal = currentUnitPrice * (parseInt(qty) || 1);

  const handleShareLink = () => {
    const slug = generateProductSlug(product);
    const fullUrl = `${window.location.origin}${window.location.pathname}#/product/${slug}`;
    navigator.clipboard?.writeText(fullUrl);
    showToast('Product link copied to clipboard for B2B sharing', 'success');
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigateTo('catalogue')}
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalogue
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
            <span onClick={() => navigateTo('home')} className="hover:underline cursor-pointer">Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span onClick={() => navigateTo('catalogue')} className="hover:underline cursor-pointer">Catalogue</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 dark:text-slate-300">{product.category}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-extrabold text-slate-900 dark:text-white">{product.brand}</span>
          </div>
        </div>

        {/* Main Product Display Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Image Gallery, Interactive Zoom & White Background Studio Preview */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Main Interactive Image Viewport */}
              <div 
                ref={imageContainerRef}
                onMouseEnter={() => setIsHoverZooming(true)}
                onMouseLeave={() => setIsHoverZooming(false)}
                onMouseMove={handleMouseMove}
                className={`relative h-80 md:h-[420px] rounded-2xl border transition-all p-6 flex items-center justify-center overflow-hidden group cursor-crosshair ${
                  isWhiteBgMode 
                    ? 'bg-white border-slate-300 shadow-inner' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Brand & Studio Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start pointer-events-none">
                  <span className="px-3 py-1 bg-brand-950 text-amber-400 text-xs font-extrabold rounded-lg uppercase tracking-wider shadow">
                    {product.brand} Authorized
                  </span>
                  {isWhiteBgMode && (
                    <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow">
                      <Sparkles className="w-3 h-3" /> White Background Studio Mode
                    </span>
                  )}
                </div>

                {/* Fullscreen & Share Buttons */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl shadow backdrop-blur-sm transition-transform hover:scale-105"
                    title="Copy B2B Product Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullscreenModalOpen(true)}
                    className="p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl shadow backdrop-blur-sm transition-transform hover:scale-105"
                    title="Full Screen High-Res Zoom"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Normal & Hover Zoom Image */}
                <img
                  src={images[selectedImgIndex]}
                  alt={product.name}
                  style={
                    isHoverZooming
                      ? {
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          transform: 'scale(1.8)'
                        }
                      : { transform: 'scale(1)' }
                  }
                  className="max-h-full max-w-full object-contain transition-transform duration-150 select-none"
                  onClick={() => setIsFullscreenModalOpen(true)}
                />

                {/* Zoom Helper Pill */}
                <div className="absolute bottom-3 right-3 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold bg-slate-900/70 text-white px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <ZoomIn className="w-3 h-3 text-amber-400" />
                  <span>Hover to Zoom / Click Fullscreen</span>
                </div>
              </div>

              {/* Gallery Thumbnails & White Background Switch */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                {/* Thumbnails */}
                <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border p-1.5 overflow-hidden transition-all shrink-0 ${
                        selectedImgIndex === idx
                          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>

                {/* White Background Studio Toggle */}
                <button
                  type="button"
                  onClick={() => setIsWhiteBgMode(!isWhiteBgMode)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                    isWhiteBgMode
                      ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isWhiteBgMode ? 'Standard View' : 'White Background Studio'}</span>
                </button>
              </div>

            </div>

            {/* Right Column: B2B Specifications, Pack Tiers, Pricing & Ordering */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>SKU: <strong className="text-slate-800 dark:text-slate-200 font-mono">{product.sku}</strong></span>
                  <span>•</span>
                  <span>HSN: <strong className="text-slate-800 dark:text-slate-200 font-mono">{product.hsn || '19053100'}</strong></span>
                  <span>•</span>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500 mr-1" />
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{product.rating || 5.0}</span>
                    <span className="text-slate-400 text-[11px] ml-1">({product.reviewCount || 25} B2B orders)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Structured Pack / Bundle / Case Breakdown Section */}
              <div className="bg-gradient-to-r from-slate-50 via-amber-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 rounded-2xl border border-amber-200/60 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  B2B Packaging Specifications
                </span>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  {product.packSize && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Unit Pack</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{product.packSize}</strong>
                    </div>
                  )}
                  {product.bundleSize && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Inner Bundle</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{product.bundleSize}</strong>
                    </div>
                  )}
                  {product.caseSize && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-900">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold">Master Case</span>
                      <strong className="text-amber-900 dark:text-amber-300 font-black text-sm">{product.caseSize}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock & Sourcing Status */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Supply & Dispatch</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">Direct Manufacturer Warehouse Dispatch</span>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                    In Stock ({product.stock} units available)
                  </span>
                </div>
              </div>

              {/* Quantity Selector with Direct Keyboard Input & B2B Cart Actions */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Order Quantity:
                    </span>
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, (parseInt(qty) || 1) - 1))}
                        className="px-4 py-2.5 font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={handleQtyInput}
                        onBlur={() => (!qty || qty < 1) && setQty(1)}
                        className="w-16 py-2 font-black text-xs text-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-x border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setQty((parseInt(qty) || 0) + 1)}
                        className="px-4 py-2.5 font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Packaging Unit</span>
                    <span className="text-xs font-black text-brand-900 dark:text-amber-400">{product.packSize || 'Standard Packaging'}</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => addToCart(product, parseInt(qty) || 1)}
                    className="w-full sm:flex-1 py-3.5 px-6 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-900/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add {parseInt(qty) || 1}x to B2B Order Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSalesmanModalOpen(true)}
                    className="w-full sm:w-auto py-3.5 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-colors shrink-0"
                  >
                    <Phone className="w-4 h-4" /> Field Representative
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Genuine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-900 dark:text-amber-400 shrink-0" />
                  <span>Same-Day Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>GST Tax Invoice</span>
                </div>
              </div>

            </div>
          </div>

          {/* Technical Specs Table & Product Overview */}
          <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4">
              Product Overview & Specifications
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

        {/* Fullscreen High-Res Image Preview Modal */}
        <AnimatePresence>
          {isFullscreenModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 p-6 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center"
              >
                <button
                  onClick={() => setIsFullscreenModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full hover:bg-red-500 hover:text-white transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={images[selectedImgIndex]}
                  alt={product.name}
                  className="max-h-[75vh] max-w-full object-contain rounded-2xl"
                />
                <span className="text-xs font-bold text-slate-500 mt-4">
                  {product.name} — Fullscreen Image View ({selectedImgIndex + 1} of {images.length})
                </span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Smart Related Products in Same Category */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Related Products in {product.category}
              </h3>
              <span className="text-xs text-slate-500">Ranked by category & pack relevance</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

        {/* Similar Products from the Same Brand */}
        {sameBrandProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                More Sourcing from {product.brand}
              </h3>
              <span className="text-xs text-slate-500">Authorized manufacturer range</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sameBrandProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
