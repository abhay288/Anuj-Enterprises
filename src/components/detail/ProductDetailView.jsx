import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, ArrowLeft, ChevronRight, Maximize2, 
  Phone, Box, Check, X, Layers, Building2, 
  ZoomIn, Info, Share2, Copy, MessageCircle, Send, Mail, Globe
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

  // Modal & Zoom States
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const imageContainerRef = useRef(null);
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  // Dynamic SEO on Product Page Mount / Selection
  useEffect(() => {
    if (product) {
      updatePageSEO({
        title: `${product.name} (Wholesale B2B) - ${product.brand}`,
        description: `Source ${product.name} from Anuj Enterprises. SKU: ${product.sku}. Tiered wholesale pricing, pack/case discounts, and official B2B supply.`,
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

  const productSlug = generateProductSlug(product);
  const productShareUrl = `${window.location.origin}${window.location.pathname}#/product/${productSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(productShareUrl);
    setIsCopied(true);
    showToast('Product link copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Anuj Enterprises`,
          text: `Check out ${product.name} (${product.brand}) on Anuj Enterprises B2B wholesale supply platform.`,
          url: productShareUrl
        });
      } catch (err) {}
    } else {
      handleCopyLink();
    }
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
            
            {/* Left Column: Image Gallery & Interactive Zoom */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Main Interactive Image Viewport */}
              <div 
                ref={imageContainerRef}
                onMouseEnter={() => setIsHoverZooming(true)}
                onMouseLeave={() => setIsHoverZooming(false)}
                onMouseMove={handleMouseMove}
                className="relative h-80 md:h-[420px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-all p-6 flex items-center justify-center overflow-hidden group cursor-crosshair"
              >
                {/* Brand Badge */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start pointer-events-none">
                  <span className="px-3 py-1 bg-brand-950 text-amber-400 text-xs font-extrabold rounded-lg uppercase tracking-wider shadow">
                    {product.brand} Authorized
                  </span>
                </div>

                {/* Fullscreen Button */}
                <div className="absolute top-4 right-4 z-10">
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

              {/* Gallery Thumbnails */}
              {images.length > 1 && (
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
              )}

            </div>

            {/* Right Column: B2B Specifications, Pack Tiers & Ordering */}
            <div className="lg:col-span-6 space-y-6">
              
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>SKU: <strong className="text-slate-800 dark:text-slate-200 font-mono">{product.sku}</strong></span>
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

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 block font-semibold">Unit Pack</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">{product.packSize || '1 Pack'}</strong>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 block font-semibold">Inner Bundle</span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">{product.bundleSize || '5 Packs'}</strong>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-400/80 dark:border-amber-900/80 shadow-sm bg-amber-500/5">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">Master Case</span>
                    <strong className="text-xs font-black text-brand-950 dark:text-amber-300">{product.caseSize || '10 Bundles'}</strong>
                  </div>
                </div>
              </div>

              {/* Stock Status Banner */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Supply & Dispatch</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Direct Manufacturer Warehouse Dispatch</span>
                </div>
                <div>
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} units available)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-500/30">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector & Action Buttons */}
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

                {/* Primary Action Buttons + Separate Share Button */}
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

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full sm:w-auto py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl shadow-sm border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors shrink-0"
                    title="Share B2B Product Listing"
                  >
                    <Share2 className="w-4 h-4 text-amber-500" />
                    <span>Share</span>
                  </button>
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

        {/* B2B Product Share Modal Popup */}
        <AnimatePresence>
          {isShareModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsShareModalOpen(false)}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Share Product</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Share wholesale catalogue link</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Product Preview Snippet */}
                <div className="flex items-center gap-3 my-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    <img src={images[0]} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{product.name}</h4>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{product.brand} • SKU: {product.sku}</span>
                  </div>
                </div>

                {/* One-Click Copy Link Bar */}
                <div className="space-y-1.5 mb-5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Product Page Link</label>
                  <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      readOnly
                      value={productShareUrl}
                      className="flex-1 bg-transparent px-2.5 text-xs text-slate-700 dark:text-slate-200 font-mono select-all focus:outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                        isCopied 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-brand-900 hover:bg-brand-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Direct Share Channels */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Share Directly Via</span>
                  <div className="grid grid-cols-4 gap-2.5">
                    {/* Official WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${product.name} (${product.brand}) on Anuj Enterprises B2B Supply: ${productShareUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-800 dark:text-white group hover:scale-105"
                      title="Share via WhatsApp"
                    >
                      <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
                        <path
                          fill="#25D366"
                          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"
                        />
                        <path
                          fill="#FFFFFF"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M17.47 14.39C17.17 14.24 15.71 13.52 15.44 13.42C15.17 13.32 14.97 13.27 14.77 13.57C14.57 13.87 14 14.54 13.83 14.74C13.65 14.94 13.48 14.97 13.18 14.82C12.88 14.67 11.92 14.35 10.78 13.34C9.89 12.55 9.29 11.57 9.12 11.27C8.95 10.97 9.1 10.81 9.25 10.66C9.39 10.53 9.55 10.31 9.7 10.14C9.85 9.97 9.9 9.84 10 9.64C10.1 9.44 10.05 9.27 9.97 9.12C9.9 8.97 9.3 7.49 9.05 6.9C8.81 6.32 8.56 6.4 8.38 6.39C8.2 6.38 8 6.38 7.8 6.38C7.6 6.38 7.28 6.46 7 6.76C6.73 7.06 5.95 7.79 5.95 9.27C5.95 10.75 7.03 12.18 7.18 12.38C7.33 12.58 9.3 15.62 12.32 16.92C13.04 17.23 13.6 17.42 14.04 17.56C14.76 17.79 15.42 17.76 15.94 17.68C16.52 17.59 17.72 16.95 17.97 16.25C18.22 15.55 18.22 14.95 18.15 14.82C18.07 14.7 17.77 14.54 17.47 14.39Z"
                        />
                      </svg>
                      <span className="text-[10px] font-bold">WhatsApp</span>
                    </a>

                    {/* Official Telegram */}
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(productShareUrl)}&text=${encodeURIComponent(`Anuj Enterprises B2B: ${product.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl bg-[#24A1DE]/10 hover:bg-[#24A1DE]/20 border border-[#24A1DE]/30 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-800 dark:text-white group hover:scale-105"
                      title="Share via Telegram"
                    >
                      <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#24A1DE" />
                        <path
                          fill="#FFFFFF"
                          d="M17.5 7.5L5.8 12L9.5 13.5L14.8 9.8L10.8 14.5L10.7 17.5L13.2 15.2L15.8 17.2L17.5 7.5Z"
                        />
                      </svg>
                      <span className="text-[10px] font-bold">Telegram</span>
                    </a>

                    {/* Official Gmail / Email */}
                    <a
                      href={`mailto:?subject=${encodeURIComponent(`B2B FMCG Sourcing Inquiry: ${product.name}`)}&body=${encodeURIComponent(`Hello,\n\nPlease find the product details for ${product.name} on Anuj Enterprises B2B platform:\n${productShareUrl}\n\nRegards,\nAnuj Enterprises Wholesale Partner`)}`}
                      className="p-3 rounded-2xl bg-[#EA4335]/10 hover:bg-[#EA4335]/20 border border-[#EA4335]/30 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-800 dark:text-white group hover:scale-105"
                      title="Share via Email"
                    >
                      <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" />
                        <path fill="#34A853" d="M22 6l-10 7L2 6v12h20V6z" opacity="0.15" />
                        <path fill="#EA4335" d="M2 6l10 7 10-7H2z" />
                        <path fill="#FBBC05" d="M2 6v12h2.5V8.5L12 13.5l7.5-5V18H22V6H2z" opacity="0.3" />
                      </svg>
                      <span className="text-[10px] font-bold">Gmail</span>
                    </a>

                    {/* Native Device Share / More Apps */}
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/15 via-brand-500/15 to-indigo-500/15 hover:from-amber-500/25 hover:to-indigo-500/25 border border-amber-400/40 dark:border-amber-500/40 flex flex-col items-center justify-center gap-1.5 transition-all text-slate-900 dark:text-white group hover:scale-105"
                      title="Share to installed apps"
                    >
                      <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
                        <circle cx="18" cy="5" r="3" fill="#6366F1" />
                        <circle cx="6" cy="12" r="3" fill="#EC4899" />
                        <circle cx="18" cy="19" r="3" fill="#F59E0B" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span className="text-[10px] font-bold">All Apps</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
