import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Trash2, ArrowLeft, ShieldCheck, FileText, 
  Building2, ArrowRight, AlertTriangle, CheckCircle2, User, Phone, MapPin, Mail, Sparkles, Tag,
  Zap, RotateCcw, Plus, AlertOctagon, PackageX, ChevronDown, ChevronUp, ShieldAlert,
  Edit2, Calendar, Check, Layers, Box, LogIn, Camera, Eye, Image as ImageIcon, X,
  ChevronLeft, ChevronRight, UploadCloud
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InvoiceModal } from './InvoiceModal';
import { ALL_INDIAN_STATES, getDistrictsByState } from '../../data/indiaStatesAndDistricts';

import { checkUnwantedContent } from '../../utils/securityUtils';

// 🛡️ Security & Performance Constants for Docket Photo Attachments
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file max
const MAX_PHOTOS_PER_ITEM = 5; // Up to 5 photos per product claim/docket

/**
 * Secure Client-Side Image Compression & Metadata Sanitization Utility
 * Validates MIME type, rasterizes via Canvas (stripping dangerous EXIF/scripts),
 * and compresses to safe JPEG ~50-80KB for fast client memory/invoice rendering.
 */
const compressImageFile = (file, maxWidth = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      return reject(new Error('Invalid file type. Only JPG, PNG, WebP image files are permitted.'));
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return reject(new Error('File exceeds maximum size limit of 10MB.'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // Clean Canvas rasterization strips hidden malicious payloads & EXIF
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Corrupt or unreadable image file.'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
  });
};

export const CartView = () => {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart,
    toggleCartItemPriority,
    brands,
    products,
    cartSubtotal, 
    cartTotalQty, 
    user, 
    navigateTo, 
    setIsSalesmanModalOpen,
    checkoutOrder,
    selectedCustomerForOrder,
    showToast,
    t
  } = useApp();

  // Lightbox Preview Modal State for Full Photo Inspection
  const [previewModalImage, setPreviewModalImage] = useState(null);

  // Customer Entry Flow Modes: 'quick' | 'full'
  const [customerMode, setCustomerMode] = useState('quick'); 

  // Customer Form Fields (Auto-filled from user profile or selected customer)
  const [customerName, setCustomerName] = useState(() => {
    if (selectedCustomerForOrder?.name) return selectedCustomerForOrder.name;
    if (user?.role === 'customer') return user.shopName || user.name || '';
    return '';
  });
  const [customerMobile, setCustomerMobile] = useState(() => {
    if (selectedCustomerForOrder?.mobile) return selectedCustomerForOrder.mobile;
    if (user?.role === 'customer') return user.mobile || '';
    return '';
  });
  const [customerAddress, setCustomerAddress] = useState(() => {
    if (selectedCustomerForOrder?.address) return selectedCustomerForOrder.address;
    if (user?.role === 'customer') return user.address || '';
    return '';
  });
  const [customerCity, setCustomerCity] = useState(() => {
    if (selectedCustomerForOrder?.city) return selectedCustomerForOrder.city;
    if (user?.role === 'customer') return user.city || 'Kanpur';
    return '';
  });
  const [customerState, setCustomerState] = useState(() => {
    if (selectedCustomerForOrder?.state) return selectedCustomerForOrder.state;
    if (user?.role === 'customer') return user.state || 'Uttar Pradesh';
    return '';
  });
  const [customerEmail, setCustomerEmail] = useState(() => {
    if (selectedCustomerForOrder?.email) return selectedCustomerForOrder.email;
    if (user?.role === 'customer') return user.email || '';
    return '';
  });

  // Expired Products Claim System State
  const [isExpiredOpen, setIsExpiredOpen] = useState(false);
  const [expiredItems, setExpiredItems] = useState([]);
  const [editingExpiredId, setEditingExpiredId] = useState(null);

  const [expiredCompany, setExpiredCompany] = useState('');
  const [expiredProductId, setExpiredProductId] = useState('');
  const [expiredMfdDate, setExpiredMfdDate] = useState('');
  const [expiredNoDate, setExpiredNoDate] = useState(false);
  const [expiredQty, setExpiredQty] = useState(1);
  const [expiredImages, setExpiredImages] = useState([]); // Array of clean compressed data URLs
  const [expiredImagesLoading, setExpiredImagesLoading] = useState(false);

  // Lightbox Photo Inspection Modal State
  const [previewModalImages, setPreviewModalImages] = useState([]); // Array of images in modal
  const [previewModalIndex, setPreviewModalIndex] = useState(0); // Active slide index

  const openLightbox = (imgs, startIndex = 0) => {
    const list = Array.isArray(imgs) ? imgs : [imgs].filter(Boolean);
    if (list.length === 0) return;
    setPreviewModalImages(list);
    setPreviewModalIndex(Math.min(startIndex, list.length - 1));
  };

  const handleExpiredImagesChange = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    if (expiredImages.length >= MAX_PHOTOS_PER_ITEM) {
      showToast(`⚠️ Maximum ${MAX_PHOTOS_PER_ITEM} photos reached. Remove a photo to add a new one.`, 'warning');
      return;
    }

    const filesToProcess = rawFiles.slice(0, MAX_PHOTOS_PER_ITEM - expiredImages.length);
    if (rawFiles.length > filesToProcess.length) {
      showToast(`⚠️ Only ${filesToProcess.length} additional photo(s) allowed (Max ${MAX_PHOTOS_PER_ITEM} total).`, 'info');
    }

    setExpiredImagesLoading(true);
    try {
      const processed = [];
      for (const file of filesToProcess) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
          showToast(`⚠️ Skipped "${file.name}": Only JPG, PNG, WebP allowed.`, 'warning');
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          showToast(`⚠️ Skipped "${file.name}": Exceeds 10MB limit.`, 'warning');
          continue;
        }
        const compressed = await compressImageFile(file);
        processed.push(compressed);
      }

      if (processed.length > 0) {
        setExpiredImages(prev => [...prev, ...processed].slice(0, MAX_PHOTOS_PER_ITEM));
        showToast(`✓ Attached ${processed.length} photo(s) to expired claim (Total: ${expiredImages.length + processed.length})`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to process images', 'error');
    } finally {
      setExpiredImagesLoading(false);
      e.target.value = '';
    }
  };

  const handleRemoveExpiredImage = (idxToRemove) => {
    setExpiredImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
    showToast('Photo removed', 'info');
  };

  // Available Companies derived from real database brands & products
  const companyList = useMemo(() => {
    const brandNames = (brands || []).map(b => (typeof b === 'string' ? b : b.name)).filter(Boolean);
    const productBrands = (products || []).map(p => p.brand || p.companyName).filter(Boolean);
    return Array.from(new Set([...brandNames, ...productBrands])).sort();
  }, [brands, products]);

  // Products belonging to the selected Company
  const companyProducts = useMemo(() => {
    if (!expiredCompany) return [];
    return (products || []).filter(p => {
      const b = p.brand || p.companyName || '';
      return b.toLowerCase() === expiredCompany.toLowerCase();
    });
  }, [products, expiredCompany]);

  // Selected Product Details Object
  const selectedExpiredProductObj = useMemo(() => {
    if (!expiredProductId) return null;
    return (products || []).find(p => p.id === expiredProductId || p.productId === expiredProductId) || null;
  }, [products, expiredProductId]);

  const resetExpiredForm = () => {
    setExpiredCompany('');
    setExpiredProductId('');
    setExpiredMfdDate('');
    setExpiredNoDate(false);
    setExpiredQty(1);
    setExpiredImages([]);
    setEditingExpiredId(null);
  };

  const handleOpenAddExpired = () => {
    resetExpiredForm();
    setIsExpiredOpen(true);
  };

  const handleEditExpiredItem = (item) => {
    setEditingExpiredId(item.id);
    setExpiredCompany(item.company || '');
    setExpiredProductId(item.productId || '');
    setExpiredMfdDate(item.mfdDate || '');
    setExpiredNoDate(Boolean(item.noDateAvailable));
    setExpiredQty(item.qty || 1);
    const itemImgs = Array.isArray(item.images) && item.images.length > 0 
      ? item.images 
      : item.image ? [item.image] : [];
    setExpiredImages(itemImgs);
    setIsExpiredOpen(true);
  };

  const handleSaveExpiredItem = (e) => {
    if (e) e.preventDefault();
    if (!expiredCompany) {
      showToast('⚠️ Please select a Company / Brand.', 'warning');
      return;
    }
    if (!expiredProductId || !selectedExpiredProductObj) {
      showToast('⚠️ Please select a Product from the selected company.', 'warning');
      return;
    }
    if (selectedExpiredProductObj.isNrp) {
      showToast('🚫 This product follows No Return Policy (NRP) and cannot be claimed for expiry replacement.', 'error');
      return;
    }
    if (!expiredNoDate && !expiredMfdDate) {
      showToast('⚠️ Please select an MFD Date or check "No Date Available".', 'warning');
      return;
    }
    const q = parseInt(expiredQty, 10);
    if (isNaN(q) || q <= 0) {
      showToast('⚠️ Expired Quantity must be at least 1.', 'warning');
      return;
    }

    const payload = {
      id: editingExpiredId || `EXP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      company: expiredCompany,
      productId: selectedExpiredProductObj.id || selectedExpiredProductObj.productId,
      product: selectedExpiredProductObj.name,
      sku: selectedExpiredProductObj.sku || 'SKU-FMCG',
      packInfo: selectedExpiredProductObj.packSize || selectedExpiredProductObj.caseSize || '',
      packSize: selectedExpiredProductObj.packSize || '',
      bundleSize: selectedExpiredProductObj.bundleSize || '',
      caseSize: selectedExpiredProductObj.caseSize || '',
      qty: q,
      mfdDate: expiredNoDate ? '' : expiredMfdDate,
      noDateAvailable: expiredNoDate,
      images: expiredImages,
      image: expiredImages[0] || null, // Backwards compatible with single photo
      batchOrNote: expiredNoDate ? 'No Date Available' : `MFD: ${expiredMfdDate}`
    };

    if (editingExpiredId) {
      setExpiredItems(prev => prev.map(item => item.id === editingExpiredId ? payload : item));
      showToast(`✓ Updated expired claim for ${selectedExpiredProductObj.name}`, 'success');
    } else {
      const duplicateIdx = expiredItems.findIndex(i => 
        i.productId === payload.productId && 
        i.noDateAvailable === payload.noDateAvailable && 
        i.mfdDate === payload.mfdDate
      );
      if (duplicateIdx >= 0) {
        setExpiredItems(prev => prev.map((item, idx) => idx === duplicateIdx ? { ...item, qty: item.qty + q, images: payload.images.length > 0 ? payload.images : item.images, image: payload.images[0] || item.image } : item));
        showToast(`✓ Added +${q} units to existing claim for ${selectedExpiredProductObj.name}`, 'success');
      } else {
        setExpiredItems(prev => [...prev, payload]);
        showToast(`✓ Added ${selectedExpiredProductObj.name} to expired claims`, 'success');
      }
    }
    resetExpiredForm();
    setIsExpiredOpen(false);
  };

  const handleRemoveExpiredItem = (id) => {
    setExpiredItems(prev => prev.filter(i => i.id !== id));
    showToast('Removed expired product from claim', 'info');
  };

  // Goods Return & Damage Docket State
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnItems, setReturnItems] = useState([]);
  const [editingReturnId, setEditingReturnId] = useState(null);

  const [returnCompany, setReturnCompany] = useState('');
  const [returnProductId, setReturnProductId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnNoDate, setReturnNoDate] = useState(false);
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Damaged Packaging');
  const [customReturnReason, setCustomReturnReason] = useState('');
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [returnImages, setReturnImages] = useState([]); // Array of clean compressed data URLs
  const [returnImagesLoading, setReturnImagesLoading] = useState(false);

  const handleReturnImagesChange = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    if (returnImages.length >= MAX_PHOTOS_PER_ITEM) {
      showToast(`⚠️ Maximum ${MAX_PHOTOS_PER_ITEM} photos reached. Remove a photo to add a new one.`, 'warning');
      return;
    }

    const filesToProcess = rawFiles.slice(0, MAX_PHOTOS_PER_ITEM - returnImages.length);
    if (rawFiles.length > filesToProcess.length) {
      showToast(`⚠️ Only ${filesToProcess.length} additional photo(s) allowed (Max ${MAX_PHOTOS_PER_ITEM} total).`, 'info');
    }

    setReturnImagesLoading(true);
    try {
      const processed = [];
      for (const file of filesToProcess) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
          showToast(`⚠️ Skipped "${file.name}": Only JPG, PNG, WebP allowed.`, 'warning');
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          showToast(`⚠️ Skipped "${file.name}": Exceeds 10MB limit.`, 'warning');
          continue;
        }
        const compressed = await compressImageFile(file);
        processed.push(compressed);
      }

      if (processed.length > 0) {
        setReturnImages(prev => [...prev, ...processed].slice(0, MAX_PHOTOS_PER_ITEM));
        showToast(`✓ Attached ${processed.length} photo(s) to damage docket (Total: ${returnImages.length + processed.length})`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to process images', 'error');
    } finally {
      setReturnImagesLoading(false);
      e.target.value = '';
    }
  };

  const handleRemoveReturnImage = (idxToRemove) => {
    setReturnImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
    showToast('Photo removed', 'info');
  };

  const commonDamageReasons = [
    'Damaged Packaging',
    'Broken Product',
    'Leakage',
    'Torn/Opened Pack',
    'Water Damage',
    'Transport Damage',
    'Manufacturing Damage',
    'Other (Custom Reason)'
  ];

  // Products belonging to the selected Return Company
  const returnCompanyProducts = useMemo(() => {
    if (!returnCompany) return [];
    return (products || []).filter(p => {
      const b = p.brand || p.companyName || '';
      return b.toLowerCase() === returnCompany.toLowerCase();
    });
  }, [products, returnCompany]);

  // Selected Damage Product Details Object
  const selectedReturnProductObj = useMemo(() => {
    if (!returnProductId) return null;
    return (products || []).find(p => p.id === returnProductId || p.productId === returnProductId) || null;
  }, [products, returnProductId]);

  const resetReturnForm = () => {
    setReturnCompany('');
    setReturnProductId('');
    setReturnDate('');
    setReturnNoDate(false);
    setReturnQty(1);
    setReturnImage(null);
    setReturnReason('Damaged Packaging');
    setCustomReturnReason('');
    setIsCustomReason(false);
    setEditingReturnId(null);
  };

  const handleOpenAddReturn = () => {
    resetReturnForm();
    setIsReturnOpen(true);
  };

  const handleEditReturnItem = (item) => {
    setEditingReturnId(item.id);
    setReturnCompany(item.company || '');
    setReturnProductId(item.productId || '');
    setReturnQty(item.qty || 1);
    setReturnDate(item.damageDate || item.date || item.mfdDate || '');
    setReturnNoDate(Boolean(item.noDateAvailable));
    setReturnImage(item.image || item.damageImage || null);
    if (commonDamageReasons.includes(item.reason) && item.reason !== 'Other (Custom Reason)') {
      setReturnReason(item.reason);
      setIsCustomReason(false);
      setCustomReturnReason('');
    } else {
      setReturnReason('Other (Custom Reason)');
      setIsCustomReason(true);
      setCustomReturnReason(item.reason || '');
    }
    setIsReturnOpen(true);
  };

  const handleSaveReturnItem = (e) => {
    if (e) e.preventDefault();
    if (!returnCompany) {
      showToast('⚠️ Please select a Company / Brand.', 'warning');
      return;
    }
    if (!returnProductId || !selectedReturnProductObj) {
      showToast('⚠️ Please select a Product from the selected company.', 'warning');
      return;
    }
    if (selectedReturnProductObj.isNrp) {
      showToast('🚫 This product follows No Return Policy (NRP) and cannot be added to Damage Docket.', 'error');
      return;
    }
    if (!returnNoDate && !returnDate) {
      showToast('⚠️ Please select a Damage / Return Date or check "No Date Available".', 'warning');
      return;
    }
    const q = parseInt(returnQty, 10);
    if (isNaN(q) || q <= 0) {
      showToast('⚠️ Damage Quantity must be at least 1.', 'warning');
      return;
    }

    const finalReason = (isCustomReason || returnReason === 'Other (Custom Reason)')
      ? customReturnReason.trim()
      : returnReason;

    if (!finalReason) {
      showToast('⚠️ Please provide a damage reason.', 'warning');
      return;
    }

    const payload = {
      id: editingReturnId || `RET-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      company: returnCompany,
      productId: selectedReturnProductObj.id || selectedReturnProductObj.productId,
      product: selectedReturnProductObj.name,
      sku: selectedReturnProductObj.sku || 'SKU-FMCG',
      packInfo: selectedReturnProductObj.packSize || selectedReturnProductObj.caseSize || '',
      packSize: selectedReturnProductObj.packSize || '',
      bundleSize: selectedReturnProductObj.bundleSize || '',
      caseSize: selectedReturnProductObj.caseSize || '',
      qty: q,
      reason: finalReason,
      damageDate: returnNoDate ? '' : returnDate,
      date: returnNoDate ? '' : returnDate,
      noDateAvailable: returnNoDate,
      image: returnImage || null,
      batchOrNote: returnNoDate ? 'No Date Available' : `Date: ${returnDate}`
    };

    if (editingReturnId) {
      setReturnItems(prev => prev.map(item => item.id === editingReturnId ? payload : item));
      showToast(`✓ Updated damage claim for ${selectedReturnProductObj.name}`, 'success');
    } else {
      const duplicateIdx = returnItems.findIndex(i => 
        i.productId === payload.productId && 
        i.reason.toLowerCase() === payload.reason.toLowerCase() &&
        i.noDateAvailable === payload.noDateAvailable &&
        i.damageDate === payload.damageDate
      );
      if (duplicateIdx >= 0) {
        setReturnItems(prev => prev.map((item, idx) => idx === duplicateIdx ? { ...item, qty: item.qty + q, image: payload.image || item.image } : item));
        showToast(`✓ Added +${q} units to existing damage claim for ${selectedReturnProductObj.name}`, 'success');
      } else {
        setReturnItems(prev => [...prev, payload]);
        showToast(`✓ Added ${selectedReturnProductObj.name} to damage docket`, 'success');
      }
    }
    resetReturnForm();
    setIsReturnOpen(false);
  };

  const handleRemoveReturnItem = (id) => {
    setReturnItems(prev => prev.filter(i => i.id !== id));
    showToast('Removed damage product from docket', 'info');
  };

  React.useEffect(() => {
    if (selectedCustomerForOrder) {
      setCustomerName(selectedCustomerForOrder.name || '');
      setCustomerMobile(selectedCustomerForOrder.mobile || '');
      setCustomerAddress(selectedCustomerForOrder.address || '');
      setCustomerCity(selectedCustomerForOrder.city || '');
      setCustomerState(selectedCustomerForOrder.state || '');
      setCustomerEmail(selectedCustomerForOrder.email || '');
      if (selectedCustomerForOrder.ownerName || selectedCustomerForOrder.shopOwnerName) {
        setSalesmanNameInput(selectedCustomerForOrder.ownerName || selectedCustomerForOrder.shopOwnerName || '');
      }
      if (selectedCustomerForOrder.area || selectedCustomerForOrder.city) {
        setSalesmanAreaInput(selectedCustomerForOrder.area || selectedCustomerForOrder.city || '');
      }
    } else if (user?.role === 'customer') {
      setCustomerName(user.shopName || user.name || '');
      setCustomerMobile(user.mobile || '');
      setCustomerAddress(user.address || '');
      setCustomerCity(user.city || 'Kanpur');
      setCustomerState(user.state || 'Uttar Pradesh');
      setCustomerEmail(user.email || '');
      setSalesmanNameInput(user.ownerName || user.shopOwnerName || user.name || '');
      setSalesmanAreaInput(user.area || user.city || 'Kanpur');
    }
  }, [selectedCustomerForOrder, user]);

  const [salesmanIdInput, setSalesmanIdInput] = useState(() => user?.salesmanId || '');
  const [salesmanNameInput, setSalesmanNameInput] = useState(() => {
    if (user?.role === 'salesman') return user.name || '';
    if (user?.role === 'customer') return user.ownerName || user.shopOwnerName || user.name || '';
    return '';
  });
  const [salesmanAreaInput, setSalesmanAreaInput] = useState(() => {
    if (user?.role === 'salesman') return user.region || '';
    if (user?.role === 'customer') return user.area || user.city || 'Kanpur';
    return '';
  });
  const [salesmanRouteInput, setSalesmanRouteInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'Credit' | 'Online' | 'Special'

  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityCount = cart.filter(i => i.isPriority).length;

  const handleCheckoutClick = () => {
    if (user?.role === 'guest') {
      showToast('⚠️ First need to login to place your order. Please sign in or register as customer.', 'warning');
      setIsSalesmanModalOpen(true);
      return;
    }

    if (!customerName || !customerName.trim()) {
      showToast('⚠️ Shop Name is mandatory. Please enter the Shop Name to generate invoice.', 'error');
      return;
    }

    if (!salesmanNameInput || !salesmanNameInput.trim()) {
      showToast('⚠️ Shop Owner Name is mandatory. Please enter the Shop Owner Name.', 'error');
      return;
    }

    if (!salesmanAreaInput || !salesmanAreaInput.trim()) {
      showToast('⚠️ Shop Owner Area is mandatory. Please enter the Shop Owner Area.', 'error');
      return;
    }

    const fullTextToTest = `${customerName} ${customerAddress} ${customerCity} ${customerEmail} ${salesmanNameInput} ${salesmanAreaInput} ${salesmanRouteInput}`;
    const check = checkUnwantedContent(fullTextToTest);
    if (check.hasUnwanted) {
      showToast(`🚫 Checkout Blocked: Inappropriate or prohibited words detected ("${check.matchedWord}"). Please enter valid business details.`, 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      checkoutOrder({
        customerMode,
        customerName,
        customerMobile,
        customerAddress,
        customerCity,
        customerState,
        customerEmail,
        customerType,
        shopOwnerName: salesmanNameInput.trim(),
        shopOwnerArea: salesmanAreaInput.trim(),
        shopRoute: (salesmanRouteInput || '').trim(),
        salesmanId: salesmanIdInput || user.salesmanId || 'AE-SM-001',
        salesmanName: salesmanNameInput || user.name || 'Shop Owner',
        salesmanPhone: user.phone || '+91 98765 43210',
        salesmanArea: salesmanAreaInput || 'Kanpur Mandi Area',
        salesmanRoute: salesmanRouteInput || 'Wholesale Mandi Route',
        paymentMethod: paymentMethod || 'Cash',
        expiredItems,
        returnItems
      });
    }, 600);
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-slate-800 text-brand-900 dark:text-brand-400 mx-auto flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Your B2B Cart is Currently Empty
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Explore our B2B catalogue for consumer supply, FMCG milk, beverages, personal care, and snacks with pack information & volume discounts.
            </p>
            <button
              onClick={() => navigateTo('catalogue')}
              className="px-8 py-3.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              Browse Products Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <button onClick={() => navigateTo('catalogue')} className="hover:underline flex items-center gap-1 font-bold">
                <ArrowLeft className="w-3.5 h-3.5" /> {t('back_to_products', 'Continue Shopping')}
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('cart_title', 'B2B Wholesale Cart & Order Checkout')}
              </h1>
              <span className="px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <User className="w-3.5 h-3.5 text-amber-500" />
                {user.role === 'guest' 
                  ? 'Guest Visitor Cart' 
                  : user.role === 'salesman' 
                  ? `Sales Representative Cart (${user.salesmanId || 'AE-SM-001'} — ${user.name})` 
                  : user.role === 'admin' 
                  ? 'Admin Executive Cart' 
                  : `Customer Cart (${user.name})`}
              </span>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> {t('clear_filters', 'Clear Cart')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cart Table Container */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Products Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              
              {/* Urgent Priority Counter Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-amber-500/15 via-brand-900/10 to-amber-500/10 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-slate-900/40 rounded-2xl border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
                    <Zap className="w-4 h-4 fill-slate-950" />
                  </span>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      ⚡ Urgent Priority Dispatch (Max 2 Products)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mark up to 2 high-priority SKUs for expedited warehouse picking & distinct invoice marking.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    priorityCount > 0
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {priorityCount} / 2 Urgent Selected
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Item Details</th>
                      <th className="py-3 px-4">Pack Info</th>
                      <th className="py-3 px-4 text-center">Quantity</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cart.map((item) => (
                      <tr key={item.product.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors ${
                        item.isPriority ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                      }`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className={`w-14 h-14 object-contain bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border ${
                                item.isPriority ? 'border-amber-500 ring-2 ring-amber-400/50' : 'border-slate-200 dark:border-slate-800'
                              }`}
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
                                  {item.product.brand}
                                </span>
                                {item.isPriority && (
                                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] uppercase rounded-full shadow-sm flex items-center gap-0.5">
                                    <Zap className="w-2.5 h-2.5 fill-slate-950" /> URGENT
                                  </span>
                                )}
                                {item.product.isNrp && (
                                  <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] uppercase rounded-full shadow-sm flex items-center gap-0.5" title="This product follows No Return Policy. Please inspect the product carefully at the time of delivery.">
                                    <ShieldAlert className="w-2.5 h-2.5" /> NRP
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                {item.product.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                SKU: {item.product.sku}
                              </span>

                              {/* Urgent Priority Toggle Button */}
                              <button
                                type="button"
                                onClick={() => toggleCartItemPriority(item.product.id)}
                                className={`mt-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                                  item.isPriority
                                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-400 font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-500/20 hover:text-amber-600'
                                }`}
                              >
                                <Zap className={`w-3 h-3 ${item.isPriority ? 'fill-slate-950' : ''}`} />
                                <span>{item.isPriority ? '⚡ URGENT PRIORITY (ACTIVE)' : 'Mark as Urgent (Max 2)'}</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Pack Info Column */}
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                          <div className="text-[11px] space-y-0.5">
                            {item.product.packSize && <div>Pack: <strong>{item.product.packSize}</strong></div>}
                            {item.product.bundleSize && <div>Bundle: <strong>{item.product.bundleSize}</strong></div>}
                            {item.product.caseSize && <div className="text-amber-700 dark:text-amber-400 font-bold">Case: {item.product.caseSize}</div>}
                          </div>
                        </td>

                        {/* Direct Numeric Input & Custom B2B Quantity Presets */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="inline-flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-sm">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, -1)}
                                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateCartQty(item.product.id, e.target.value, true)}
                                className="w-14 py-1 text-center font-extrabold text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-x border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, 1)}
                                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-800"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center gap-1 text-[9px]">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, 5)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold"
                                title="Add 5 units (1 Bundle)"
                              >
                                +5 Bundle
                              </button>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, 10)}
                                className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-black"
                                title="Add 10 units (1 Master Case)"
                              >
                                +10 Case
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Entry Flow & Classification Form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" /> {t('customer_details', 'Customer / Buyer Details')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('enter_customer_details', 'Enter customer or retail store name for invoice generation')}
                </p>
              </div>

              {user?.role === 'customer' && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Auto-filled from your registered store profile: <strong>{user.shopName || user.name}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('customer-dash')}
                    className="text-[11px] font-black text-amber-600 dark:text-amber-400 underline hover:text-amber-700 dark:hover:text-amber-200"
                  >
                    Edit Profile
                  </button>
                </div>
              )}

              {/* Form Input Fields */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    {t('shop_name', 'Shop Name')} <span className="text-rose-500 font-black text-sm">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t('enter_shop_name', 'Enter Shop / Store Name (e.g. Shree Ganesh Kirana)...')}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Shop Owner & Territory Details Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    {t('shop_owner_details_heading', 'Shop Owner & Territory Details (Appears on Invoice)')}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        {t('shop_owner_name', 'Shop Owner Name')} <span className="text-rose-500 font-black text-sm">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={salesmanNameInput}
                        onChange={(e) => setSalesmanNameInput(e.target.value)}
                        placeholder={t('enter_shop_owner_name', 'e.g. Ramesh Chandra / Rajesh Gupta')}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        {t('shop_owner_area', 'Shop Owner Area')} <span className="text-rose-500 font-black text-sm">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={salesmanAreaInput}
                        onChange={(e) => setSalesmanAreaInput(e.target.value)}
                        placeholder={t('enter_shop_owner_area', 'e.g. South Kanpur Central / Collectorganj')}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        {t('shop_route', 'Shop Route')} <span className="text-[10px] font-normal text-slate-400">({t('optional', 'Optional')})</span>
                      </label>
                      <input
                        type="text"
                        value={salesmanRouteInput}
                        onChange={(e) => setSalesmanRouteInput(e.target.value)}
                        placeholder={t('enter_shop_route', 'e.g. Route #4 — Civil Lines Wholesale Mandi')}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector (Cash, Credit, Online, Special) */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Payment Method Selection *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Cash', label: '💵 Cash', color: 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300' },
                      { id: 'Credit', label: '💳 Credit (Net-30)', color: 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300' },
                      { id: 'Online', label: '🌐 Online (UPI/NEFT)', color: 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' },
                      { id: 'Special', label: '⭐ Special Scheme', color: 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id)}
                        className={`p-3 rounded-2xl border-2 text-xs font-extrabold transition-all text-center ${
                          paymentMethod === p.id
                            ? `${p.color} shadow-sm ring-2 ring-amber-400`
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Expired Products Claim & Replacement Docket */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                    <AlertOctagon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      <span>Expired Products Claim & Replacement (Optional)</span>
                      {expiredItems.length > 0 && (
                        <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full shadow-sm">
                          {expiredItems.length} {expiredItems.length === 1 ? 'Product' : 'Products'} Logged
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Record expired stock returned by retailer for manufacturer credit adjustment / replacement.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isExpiredOpen) {
                      setIsExpiredOpen(false);
                      resetExpiredForm();
                    } else {
                      handleOpenAddExpired();
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  {isExpiredOpen ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" /> Collapse
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> {expiredItems.length > 0 ? '+ Add More Expired Product' : '+ Add Expired Product'}
                    </>
                  )}
                </button>
              </div>

              {/* Expired Products Entry / Edit Form */}
              {isExpiredOpen && (
                <form 
                  onSubmit={handleSaveExpiredItem} 
                  className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-rose-200 dark:border-rose-900/60 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {editingExpiredId ? 'Edit Expired Product Claim' : 'Log New Expired Product Claim'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsExpiredOpen(false); resetExpiredForm(); }}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* 1. Company Selection Dropdown */}
                    <div>
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        1. Select Company / Brand <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={expiredCompany}
                        onChange={(e) => {
                          setExpiredCompany(e.target.value);
                          setExpiredProductId('');
                        }}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">-- Select Company ({companyList.length} Available) --</option>
                        {companyList.map((comp) => (
                          <option key={comp} value={comp}>{comp}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Product Selection Dropdown */}
                    <div>
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        2. Select Expired Product <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        disabled={!expiredCompany}
                        value={expiredProductId}
                        onChange={(e) => setExpiredProductId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">
                          {!expiredCompany 
                            ? '-- First Select a Company above --' 
                            : companyProducts.length === 0 
                            ? '-- No products found for this company --' 
                            : `-- Choose Product (${companyProducts.length} Available) --`}
                        </option>
                        {companyProducts.map((prod) => (
                          <option 
                            key={prod.id || prod.productId} 
                            value={prod.id || prod.productId}
                            disabled={Boolean(prod.isNrp)}
                            className={prod.isNrp ? 'text-slate-400 bg-slate-100 dark:bg-slate-800' : ''}
                          >
                            {prod.isNrp ? '🚫 [NRP — No Return Policy] ' : ''}{prod.name} (SKU: {prod.sku || 'N/A'}) {prod.packSize ? `• Pack: ${prod.packSize}` : ''} {prod.caseSize ? `• Case: ${prod.caseSize}` : ''} {prod.isNrp ? '— (Non-Claimable)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Product Quick Info Card */}
                  {selectedExpiredProductObj && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={selectedExpiredProductObj.image} 
                          alt={selectedExpiredProductObj.name} 
                          className="w-10 h-10 object-contain rounded-lg bg-slate-50 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800"
                        />
                        <div>
                          <strong className="text-slate-900 dark:text-white block font-bold">
                            {selectedExpiredProductObj.name}
                          </strong>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            SKU: {selectedExpiredProductObj.sku} • Category: {selectedExpiredProductObj.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        {selectedExpiredProductObj.isNrp && (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] uppercase flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> 🚫 NRP (No Return Policy)
                          </span>
                        )}
                        {selectedExpiredProductObj.packSize && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                            Pack: {selectedExpiredProductObj.packSize}
                          </span>
                        )}
                        {selectedExpiredProductObj.caseSize && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900">
                            Case: {selectedExpiredProductObj.caseSize}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. Product Claim Details: MFD Date, No Date Checkbox, Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                    {/* MFD Date Picker */}
                    <div>
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        MFD Date {!expiredNoDate && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="date"
                          max={new Date().toISOString().split('T')[0]}
                          disabled={expiredNoDate}
                          required={!expiredNoDate}
                          value={expiredMfdDate}
                          onChange={(e) => setExpiredMfdDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    </div>

                    {/* No Date Available Checkbox */}
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <input
                          type="checkbox"
                          checked={expiredNoDate}
                          onChange={(e) => {
                            setExpiredNoDate(e.target.checked);
                            if (e.target.checked) setExpiredMfdDate('');
                          }}
                          className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200 select-none text-[11px]">
                          No Date Available on Pack
                        </span>
                      </label>
                    </div>

                    {/* Quantity of Expired Items */}
                    <div>
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        Quantity of Expired Items <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        required
                        value={expiredQty}
                        onChange={(e) => setExpiredQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* 4. Multi-Photo / Proof Attachment Upload */}
                  <div className="pt-1 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-rose-500" />
                        Attach Expired Pack / MFD Batch Photos
                        <span className="text-slate-400 font-normal">
                          ({expiredImages.length}/{MAX_PHOTOS_PER_ITEM} photos • Shows on Invoice)
                        </span>
                      </label>
                      {expiredImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpiredImages([])}
                          className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
                        >
                          <X className="w-3 h-3" /> Clear All Photos
                        </button>
                      )}
                    </div>

                    {/* Uploaded Photos Grid Gallery */}
                    {expiredImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-sm">
                        {expiredImages.map((img, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-square">
                            <img
                              src={img}
                              alt={`Expired proof #${idx + 1}`}
                              onClick={() => openLightbox(expiredImages, idx)}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 pointer-events-none">
                              <button
                                type="button"
                                onClick={() => openLightbox(expiredImages, idx)}
                                className="pointer-events-auto p-1.5 rounded-full bg-white/90 text-slate-900 shadow hover:bg-white transition-colors"
                                title="Zoom photo"
                              >
                                <Eye className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveExpiredImage(idx)}
                                className="pointer-events-auto p-1.5 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 transition-colors"
                                title="Delete photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}

                        {/* Add More Photos Tile if under limit */}
                        {expiredImages.length < MAX_PHOTOS_PER_ITEM && (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-rose-300 dark:border-rose-800/80 hover:border-rose-500 rounded-xl cursor-pointer p-2 text-center transition-colors bg-rose-50/40 dark:bg-rose-950/20 aspect-square group">
                            <Plus className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform mb-1" />
                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
                              + Add More
                            </span>
                            <span className="text-[8px] text-slate-400">
                              ({MAX_PHOTOS_PER_ITEM - expiredImages.length} left)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              disabled={expiredImagesLoading}
                              onChange={handleExpiredImagesChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {/* Default Upload Trigger if 0 photos */}
                    {expiredImages.length === 0 && (
                      <label className="flex items-center justify-center gap-2 p-3.5 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 rounded-xl cursor-pointer transition-colors group">
                        <UploadCloud className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                          {expiredImagesLoading ? 'Compressing & Sanitizing Photos...' : 'Click / Tap to Upload 1 or More Expired Product Photos (Max 5)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={expiredImagesLoading}
                          onChange={handleExpiredImagesChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsExpiredOpen(false); resetExpiredForm(); }}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      {editingExpiredId ? 'Update Expired Product' : 'Add Expired Product to Claim'}
                    </button>
                  </div>
                </form>
              )}

              {/* 4. Selected Products List / Table (Always Visible) */}
              {expiredItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Logged Expired Products in Claim ({expiredItems.length} Products • {expiredItems.reduce((a, b) => a + b.qty, 0)} Total Units):
                    </span>
                    {!isExpiredOpen && (
                      <button
                        type="button"
                        onClick={handleOpenAddExpired}
                        className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Add More Expired Product
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-rose-200 dark:border-rose-950 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 uppercase font-extrabold text-[10px] border-b border-rose-100 dark:border-rose-900/60">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Company / Brand</th>
                          <th className="py-2.5 px-3">Product Name & SKU</th>
                          <th className="py-2.5 px-3">Pack Details</th>
                          <th className="py-2.5 px-3">MFD Date</th>
                          <th className="py-2.5 px-3 text-center">Photo Proof</th>
                          <th className="py-2.5 px-3 text-center">Expired Qty</th>
                          <th className="py-2.5 px-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {expiredItems.map((item, idx) => {
                          const itemImgs = Array.isArray(item.images) && item.images.length > 0
                            ? item.images
                            : item.image ? [item.image] : [];

                          return (
                            <tr key={item.id || idx} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors">
                              <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-[10px] uppercase rounded-md">
                                  {item.company}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <strong className="text-slate-900 dark:text-white font-bold block">{item.product}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                                {item.packInfo || item.packSize || item.caseSize || '-'}
                              </td>
                              <td className="py-3 px-3">
                                {item.noDateAvailable ? (
                                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded">
                                    No Date Available
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                                    <Calendar className="w-3 h-3" /> {item.mfdDate}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {itemImgs.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => openLightbox(itemImgs, 0)}
                                    className="group inline-flex items-center gap-1.5 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                    title={`Click to view ${itemImgs.length} attached photo(s)`}
                                  >
                                    <div className="relative">
                                      <img
                                        src={itemImgs[0]}
                                        alt="Proof"
                                        className="w-9 h-9 object-cover rounded-md border border-rose-300 dark:border-rose-800 group-hover:scale-105 transition-transform"
                                      />
                                      {itemImgs.length > 1 && (
                                        <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-rose-600 text-white font-black text-[9px] rounded-full shadow">
                                          +{itemImgs.length - 1}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 group-hover:underline">
                                      {itemImgs.length} Photo{itemImgs.length > 1 ? 's' : ''}
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No Photo</span>
                                )}
                              </td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2.5 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-black rounded-lg text-xs">
                                {item.qty} Units
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditExpiredItem(item)}
                                  className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-amber-400 transition-colors"
                                  title="Edit Expired Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExpiredItem(item.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Remove from Claim"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ); })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : !isExpiredOpen && (
                <p className="text-xs text-slate-400 italic">No expired claims recorded for this order.</p>
              )}
            </div>

            {/* Return Goods & Damage Docket */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      <span>Goods Return & Damage Docket (Optional)</span>
                      {returnItems.length > 0 && (
                        <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-black rounded-full shadow-sm">
                          {returnItems.length} {returnItems.length === 1 ? 'Product' : 'Products'} Logged
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Record damaged boxes, leakages, or unsellable stock sent back by merchant.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isReturnOpen) {
                      setIsReturnOpen(false);
                      resetReturnForm();
                    } else {
                      handleOpenAddReturn();
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60 transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  {isReturnOpen ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" /> Collapse
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> {returnItems.length > 0 ? '+ Add More Damage Product' : '+ Add Damage Product'}
                    </>
                  )}
                </button>
              </div>

              {/* Damage Item Input Form */}
              {isReturnOpen && (
                <form 
                  onSubmit={handleSaveReturnItem} 
                  className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {editingReturnId ? 'Edit Damage Product Docket' : 'Log New Damage Product Docket'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setIsReturnOpen(false); resetReturnForm(); }}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* 1. Company Selection Dropdown */}
                    <div>
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        1. Select Company / Brand <span className="text-orange-500">*</span>
                      </label>
                      <select
                        required
                        value={returnCompany}
                        onChange={(e) => {
                          setReturnCompany(e.target.value);
                          setReturnProductId('');
                        }}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- Select Company ({companyList.length} Available) --</option>
                        {companyList.map((comp) => (
                          <option key={comp} value={comp}>{comp}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Product Selection Dropdown */}
                    <div>
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        2. Select Damage Product <span className="text-orange-500">*</span>
                      </label>
                      <select
                        required
                        disabled={!returnCompany}
                        value={returnProductId}
                        onChange={(e) => setReturnProductId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">
                          {!returnCompany 
                            ? '-- First Select a Company above --' 
                            : returnCompanyProducts.length === 0 
                            ? '-- No products found for this company --' 
                            : `-- Choose Product (${returnCompanyProducts.length} Available) --`}
                        </option>
                        {returnCompanyProducts.map((prod) => (
                          <option 
                            key={prod.id || prod.productId} 
                            value={prod.id || prod.productId}
                            disabled={Boolean(prod.isNrp)}
                            className={prod.isNrp ? 'text-slate-400 bg-slate-100 dark:bg-slate-800' : ''}
                          >
                            {prod.isNrp ? '🚫 [NRP — No Return Policy] ' : ''}{prod.name} (SKU: {prod.sku || 'N/A'}) {prod.packSize ? `• Pack: ${prod.packSize}` : ''} {prod.caseSize ? `• Case: ${prod.caseSize}` : ''} {prod.isNrp ? '— (Non-Claimable)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Product Quick Info Card */}
                  {selectedReturnProductObj && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={selectedReturnProductObj.image} 
                          alt={selectedReturnProductObj.name} 
                          className="w-10 h-10 object-contain rounded-lg bg-slate-50 dark:bg-slate-950 p-0.5 border border-slate-200 dark:border-slate-800"
                        />
                        <div>
                          <strong className="text-slate-900 dark:text-white block font-bold">
                            {selectedReturnProductObj.name}
                          </strong>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            SKU: {selectedReturnProductObj.sku} • Category: {selectedReturnProductObj.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        {selectedReturnProductObj.isNrp && (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] uppercase flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> 🚫 NRP (No Return Policy)
                          </span>
                        )}
                        {selectedReturnProductObj.packSize && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                            Pack: {selectedReturnProductObj.packSize}
                          </span>
                        )}
                        {selectedReturnProductObj.caseSize && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900">
                            Case: {selectedReturnProductObj.caseSize}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. Damage Details: Date / No Date, Quantity and Damage Reason */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                    {/* Damage / Incident Date */}
                    <div>
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        Damage / Incident Date {!returnNoDate && <span className="text-orange-500">*</span>}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="date"
                          max={new Date().toISOString().split('T')[0]}
                          disabled={returnNoDate}
                          required={!returnNoDate}
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* No Date Available Checkbox */}
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <input
                          type="checkbox"
                          checked={returnNoDate}
                          onChange={(e) => {
                            setReturnNoDate(e.target.checked);
                            if (e.target.checked) setReturnDate('');
                          }}
                          className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200 select-none text-[11px]">
                          No Date Available
                        </span>
                      </label>
                    </div>

                    {/* Quantity of Damaged Items */}
                    <div>
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                        Quantity of Damaged Items <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        required
                        value={returnQty}
                        onChange={(e) => setReturnQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* Damage Reason Selector */}
                  <div className="pt-1 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300">
                        Damage Reason <span className="text-orange-500">*</span>
                      </label>
                      {!isCustomReason && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomReason(true);
                            setReturnReason('Other (Custom Reason)');
                          }}
                          className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Add Custom Reason
                        </button>
                      )}
                    </div>

                    {!isCustomReason ? (
                      <select
                        required
                        value={returnReason}
                        onChange={(e) => {
                          setReturnReason(e.target.value);
                          if (e.target.value === 'Other (Custom Reason)') {
                            setIsCustomReason(true);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {commonDamageReasons.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            required
                            autoFocus
                            value={customReturnReason}
                            onChange={(e) => setCustomReturnReason(e.target.value)}
                            placeholder="Type specific damage reason (e.g. Seal broken during transport)"
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomReason(false);
                            setReturnReason(commonDamageReasons[0]);
                            setCustomReturnReason('');
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-600 underline font-semibold block"
                        >
                          ← Choose from standard damage list instead
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4. Multi-Photo / Proof Attachment Upload */}
                  <div className="pt-1 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold uppercase text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-orange-500" />
                        Attach Damaged Product Photos
                        <span className="text-slate-400 font-normal">
                          ({returnImages.length}/{MAX_PHOTOS_PER_ITEM} photos • Shows on Invoice)
                        </span>
                      </label>
                      {returnImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setReturnImages([])}
                          className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5"
                        >
                          <X className="w-3 h-3" /> Clear All Photos
                        </button>
                      )}
                    </div>

                    {/* Uploaded Photos Grid Gallery */}
                    {returnImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/60 rounded-2xl shadow-sm">
                        {returnImages.map((img, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-square">
                            <img
                              src={img}
                              alt={`Damage proof #${idx + 1}`}
                              onClick={() => openLightbox(returnImages, idx)}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 pointer-events-none">
                              <button
                                type="button"
                                onClick={() => openLightbox(returnImages, idx)}
                                className="pointer-events-auto p-1.5 rounded-full bg-white/90 text-slate-900 shadow hover:bg-white transition-colors"
                                title="Zoom photo"
                              >
                                <Eye className="w-3.5 h-3.5 text-orange-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveReturnImage(idx)}
                                className="pointer-events-auto p-1.5 rounded-full bg-orange-600 text-white shadow hover:bg-orange-700 transition-colors"
                                title="Delete photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}

                        {/* Add More Photos Tile if under limit */}
                        {returnImages.length < MAX_PHOTOS_PER_ITEM && (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-orange-300 dark:border-orange-800/80 hover:border-orange-500 rounded-xl cursor-pointer p-2 text-center transition-colors bg-orange-50/40 dark:bg-orange-950/20 aspect-square group">
                            <Plus className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform mb-1" />
                            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300">
                              + Add More
                            </span>
                            <span className="text-[8px] text-slate-400">
                              ({MAX_PHOTOS_PER_ITEM - returnImages.length} left)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              disabled={returnImagesLoading}
                              onChange={handleReturnImagesChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {/* Default Upload Trigger if 0 photos */}
                    {returnImages.length === 0 && (
                      <label className="flex items-center justify-center gap-2 p-3.5 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-600 rounded-xl cursor-pointer transition-colors group">
                        <UploadCloud className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                          {returnImagesLoading ? 'Compressing & Sanitizing Photos...' : 'Click / Tap to Upload 1 or More Damaged Product Photos (Max 5)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={returnImagesLoading}
                          onChange={handleReturnImagesChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsReturnOpen(false); resetReturnForm(); }}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      {editingReturnId ? 'Update Damage Product' : 'Add Damage Product to Docket'}
                    </button>
                  </div>
                </form>
              )}

              {/* 4. Selected Products List / Table (Always Visible) */}
              {returnItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Logged Damage Products in Docket ({returnItems.length} Products • {returnItems.reduce((a, b) => a + b.qty, 0)} Total Units):
                    </span>
                    {!isReturnOpen && (
                      <button
                        type="button"
                        onClick={handleOpenAddReturn}
                        className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Add More Damage Product
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-orange-200 dark:border-orange-950 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-orange-50/80 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300 uppercase font-extrabold text-[10px] border-b border-orange-100 dark:border-orange-900/60">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Company / Brand</th>
                          <th className="py-2.5 px-3">Product Name & SKU</th>
                          <th className="py-2.5 px-3">Pack Details</th>
                          <th className="py-2.5 px-3">Damage Date</th>
                          <th className="py-2.5 px-3 text-center">Photo Proof</th>
                          <th className="py-2.5 px-3">Damage Reason</th>
                          <th className="py-2.5 px-3 text-center">Damage Qty</th>
                          <th className="py-2.5 px-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {returnItems.map((item, idx) => {
                          const itemImgs = Array.isArray(item.images) && item.images.length > 0
                            ? item.images
                            : item.image ? [item.image] : [];

                          return (
                            <tr key={item.id || idx} className="hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-colors">
                              <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-[10px] uppercase rounded-md">
                                  {item.company}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <strong className="text-slate-900 dark:text-white font-bold block">{item.product}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                                {item.packInfo || item.packSize || item.caseSize || '-'}
                              </td>
                              <td className="py-3 px-3 text-xs">
                                {item.damageDate || item.date ? (
                                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 font-mono text-[11px]">
                                    <Calendar className="w-3 h-3 text-orange-500" />
                                    {item.damageDate || item.date}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                                    No Date
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {itemImgs.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => openLightbox(itemImgs, 0)}
                                    className="group inline-flex items-center gap-1.5 p-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
                                    title={`Click to view ${itemImgs.length} attached photo(s)`}
                                  >
                                    <div className="relative">
                                      <img
                                        src={itemImgs[0]}
                                        alt="Proof"
                                        className="w-9 h-9 object-cover rounded-md border border-orange-300 dark:border-orange-800 group-hover:scale-105 transition-transform"
                                      />
                                      {itemImgs.length > 1 && (
                                        <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-orange-600 text-white font-black text-[9px] rounded-full shadow">
                                          +{itemImgs.length - 1}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 group-hover:underline">
                                      {itemImgs.length} Photo{itemImgs.length > 1 ? 's' : ''}
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No Photo</span>
                                )}
                              </td>
                            <td className="py-3 px-3">
                              <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 text-[11px] font-bold rounded-lg border border-orange-200 dark:border-orange-900 flex items-center gap-1.5 w-fit">
                                <AlertTriangle className="w-3 h-3 text-orange-600 shrink-0" />
                                {item.reason}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2.5 py-1 bg-orange-500/10 text-orange-700 dark:text-orange-300 font-black rounded-lg text-xs">
                                {item.qty} Units
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditReturnItem(item)}
                                  className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-amber-400 transition-colors"
                                  title="Edit Damage Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveReturnItem(item.id)}
                                  className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors"
                                  title="Remove from Docket"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ); })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : !isReturnOpen && (
                <p className="text-xs text-slate-400 italic">No return items recorded for this order.</p>
              )}
            </div>

          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 sticky top-24">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order & Collection Summary
              </h3>

              {/* Order Summary Status Displays */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-600 dark:text-slate-400">ORDER TYPE</span>
                  <span className="px-2.5 py-0.5 bg-brand-900 text-white font-extrabold text-[10px] rounded uppercase">Offline Collection</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-600 dark:text-slate-400">PAYMENT METHOD</span>
                  <span className="font-black text-amber-700 dark:text-amber-400 uppercase">{paymentMethod}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Total Items Quantity</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{cartTotalQty} Units</span>
                </div>

                {/* Priority items count */}
                {priorityCount > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-extrabold">
                    <span>⚡ Urgent Priority Items</span>
                    <span>{priorityCount} SKUs</span>
                  </div>
                )}

                {/* Expired items count */}
                {expiredItems.length > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-extrabold">
                    <span>⚠️ Expired Claims</span>
                    <span>{expiredItems.length} Products</span>
                  </div>
                )}

                {/* Return items count */}
                {returnItems.length > 0 && (
                  <div className="flex justify-between text-orange-600 dark:text-orange-400 font-extrabold">
                    <span>🔄 Goods Return Claims</span>
                    <span>{returnItems.length} Products</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Total Order Units</span>
                  <span className="font-black text-base text-brand-900 dark:text-amber-400">{cartTotalQty} Units</span>
                </div>
              </div>

              {/* Guest Login Required Notice */}
              {user?.role === 'guest' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                    <User className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>First Need to Login to Place Your Order</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Please sign in to your customer account or register as a retailer to confirm your order and generate your official B2B invoice.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSalesmanModalOpen(true)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login / Register to Place Order</span>
                  </button>
                </div>
              )}

              {/* Checkout Action Button */}
              <button
                onClick={handleCheckoutClick}
                disabled={isSubmitting}
                className={`w-full py-3.5 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] ${
                  user?.role === 'guest'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : 'bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white shadow-brand-900/30'
                }`}
              >
                <span>{user?.role === 'guest' ? 'First Need to Login to Place Order' : 'Confirm Order & Generate Invoice'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Lightbox Full Photo Interactive Gallery Modal */}
      <AnimatePresence>
        {previewModalImages && previewModalImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModalImages([])}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                      Attached Claim / Damage Photo Proof
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Photo {previewModalIndex + 1} of {previewModalImages.length}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModalImages([])}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image Display Area with Left/Right Arrows */}
              <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[62vh] overflow-hidden p-4">
                <img
                  src={previewModalImages[previewModalIndex] || previewModalImages[0]}
                  alt={`Proof #${previewModalIndex + 1}`}
                  className="max-h-[58vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                />

                {/* Left Arrow Button */}
                {previewModalImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPreviewModalIndex(prev => (prev > 0 ? prev - 1 : previewModalImages.length - 1))}
                    className="absolute left-3 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right Arrow Button */}
                {previewModalImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPreviewModalIndex(prev => (prev < previewModalImages.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white shadow-lg backdrop-blur-sm transition-all hover:scale-110"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Bottom Thumbnail Selector Strip & Note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2">
                {previewModalImages.length > 1 && (
                  <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                    {previewModalImages.map((thumb, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewModalIndex(idx)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 aspect-square w-12 h-12 ${
                          idx === previewModalIndex
                            ? 'border-brand-600 dark:border-amber-400 scale-105 shadow-md'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-center text-[11px] text-slate-500 font-medium">
                  Verified high-resolution client attachment for offline docket inspection & invoice billing.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Viewer Modal */}
      <InvoiceModal />
    </div>
  );
};
