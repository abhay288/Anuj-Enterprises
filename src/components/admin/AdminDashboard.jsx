import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Layers, Award, 
  AlertTriangle, FileText, Settings, LogOut, Plus, Search, Edit2, 
  Trash2, UploadCloud, Download, Eye, CheckCircle2, TrendingUp, 
  DollarSign, X, Check, Copy, Sparkles, Shield, UserCheck, Key,
  Calendar, RefreshCw, BarChart3, PieChart as PieChartIcon, 
  Store, Clock, AlertCircle, ArrowUpRight, ArrowDownRight, PackageCheck,
  PackageX, ShieldAlert, ArrowRight, PackagePlus, History, SlidersHorizontal,
  RotateCcw, Megaphone, Radio, User, Zap, AlertOctagon, Scale, ShieldCheck,
  BookOpen, FileCheck, HelpCircle, PauseCircle, PlayCircle, Trophy, Flame, Crown, Medal, Target
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { analyticsService } from '../../services/analyticsService';
import { inventoryService } from '../../services/inventoryService';
import { AdminPasswordModal } from './AdminPasswordModal';
import { 
  exportOrdersCSV, 
  exportProductsCSV, 
  exportSalesmenCSV, 
  exportInventoryReportCSV,
  exportCustomersCSV
} from '../../utils/csvExportUtils';

const CHART_COLORS = ['#1e3a8a', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const AdminDashboard = () => {
  const { 
    products, 
    categories, 
    brands, 
    salesmen, 
    orders, 
    customers, 
    saveCustomer,
    updateCustomer,
    deleteCustomer,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    duplicateProduct,
    toggleProductFeatured,
    toggleProductNew,
    toggleProductStatus,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    toggleSalesmanStatus,
    resetSalesmanPassword,
    addCategory,
    deleteCategory,
    addBrand,
    deleteBrand,
    openInvoiceModal, 
    restockProduct,
    adjustProductStock,
    updateProductThreshold,
    headlineConfig,
    updateHeadlineConfig,
    legalPolicies,
    updateLegalPolicy,
    resetLegalPolicies,
    navigateTo,
    logout, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'inventory' | 'products' | 'orders' | 'salesmen' | 'categories' | 'reports' | 'announcement' | 'policies'
  
  // Legal Policy Editor State
  const [selectedPolicyKey, setSelectedPolicyKey] = useState('privacy'); // 'privacy' | 'terms' | 'returns'
  const [policyForm, setPolicyForm] = useState(() => legalPolicies?.[selectedPolicyKey] || {});

  useEffect(() => {
    if (legalPolicies?.[selectedPolicyKey]) {
      setPolicyForm(JSON.parse(JSON.stringify(legalPolicies[selectedPolicyKey])));
    }
  }, [selectedPolicyKey, legalPolicies]);

  // Headline Announcement Form State
  const [headlineForm, setHeadlineForm] = useState({
    isVisible: headlineConfig?.isVisible ?? true,
    tag: headlineConfig?.tag || 'WHOLESALE UPDATE',
    text: headlineConfig?.text || '⚡ Special FMCG Sourcing Alert: Fresh Amul & Nestlé batches arrived at Kanpur Central Hub with same-day dispatch! Order Booking: +91 88876 83782',
    variant: headlineConfig?.variant || 'amber'
  });

  useEffect(() => {
    if (headlineConfig) {
      setHeadlineForm({
        isVisible: headlineConfig.isVisible ?? true,
        tag: headlineConfig.tag || 'WHOLESALE UPDATE',
        text: headlineConfig.text || '',
        variant: headlineConfig.variant || 'amber'
      });
    }
  }, [headlineConfig]);

  const handleSaveHeadline = (e) => {
    e.preventDefault();
    updateHeadlineConfig(headlineForm);
  };
  const [timeframe, setTimeframe] = useState('30d'); // 'today' | '7d' | '30d' | '90d' | 'month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [serverAnalytics, setServerAnalytics] = useState(null);

  // Modals & Forms
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddSalesmanOpen, setIsAddSalesmanOpen] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [custForm, setCustForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    pincode: '208001',
    classification: 'NORMAL',
    password: 'Cust@123'
  });

  // Restock / Inventory Modals
  const [restockTarget, setRestockTarget] = useState(null);
  const [restockQty, setRestockQty] = useState(50);
  const [restockReason, setRestockReason] = useState('Procurement Warehouse Stock Inbound');

  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustCount, setAdjustCount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Physical Stock Audit Count Adjustment');

  const [thresholdTarget, setThresholdTarget] = useState(null);
  const [thresholdVal, setThresholdVal] = useState(20);

  // Inventory Audit Logs State
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [logFilterType, setLogFilterType] = useState('ALL');

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newCompanyInput, setNewCompanyInput] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Product Form State
  const [prodForm, setProdForm] = useState({
    name: '',
    brand: 'Amul',
    category: 'Food & Beverages',
    sku: '',
    hsn: '19053100',
    price: 1200,
    stock: 100,
    lowStockThreshold: 20,
    packSize: '1 Unit',
    bundleSize: '5 Units',
    caseSize: '10 Units',
    isFeatured: true,
    isNew: true,
    isNrp: false,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'],
    description: 'High-margin enterprise B2B product item.'
  });

  // Salesman Form State
  const [salesmanForm, setSalesmanForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: 'Sales@123',
    region: 'Central UP (Kanpur HQ)'
  });

  const [salesmanPasswordTarget, setSalesmanPasswordTarget] = useState(null);
  const [salesmanToDelete, setSalesmanToDelete] = useState(null);

  // Cloudinary Image Upload State (Max 3 Photos, Max 2MB per photo)
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleProductImageFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentImages = prodForm.images || (prodForm.image ? [prodForm.image] : []);
    
    // 1. Strict 3 Photos Boundation
    if (currentImages.length >= 3) {
      showToast('Maximum 3 photos allowed per product. Please delete a photo first.', 'warning');
      return;
    }

    const availableSlots = 3 - currentImages.length;
    const filesToUpload = files.slice(0, availableSlots);

    // 2. Strict 2MB Size Boundation
    const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        showToast(`"${file.name}" is not a valid image. Please select PNG, JPG, or WEBP.`, 'error');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        showToast(`"${file.name}" is ${sizeMb}MB! Maximum allowed size is 2MB. Please compress or resize.`, 'error');
        return;
      }
    }

    setIsImageUploading(true);
    setUploadProgress(20);

    try {
      const uploadedUrls = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const res = await uploadToCloudinary(file, (prog) => {
          const stepProg = Math.round(((i + prog / 100) / filesToUpload.length) * 100);
          setUploadProgress(stepProg);
        });
        if (res?.url) {
          uploadedUrls.push(res.url);
        }
      }

      if (uploadedUrls.length > 0) {
        const combined = [...currentImages, ...uploadedUrls].slice(0, 3);
        setProdForm(prev => ({
          ...prev,
          images: combined,
          image: combined[0] || prev.image
        }));
        showToast(`${uploadedUrls.length} photo(s) uploaded to Cloudinary CDN successfully!`, 'success');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Upload error. Please check network connection.', 'error');
    } finally {
      setIsImageUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleRemoveProductImage = (indexToRemove) => {
    const currentImages = prodForm.images || [prodForm.image];
    const filtered = currentImages.filter((_, idx) => idx !== indexToRemove);
    setProdForm(prev => ({
      ...prev,
      images: filtered,
      image: filtered[0] || ''
    }));
    showToast('Photo removed', 'info');
  };

  const [prodSearch, setProdSearch] = useState('');
  const [salesmanSearch, setSalesmanSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL'); // 'ALL' | 'URGENT' | 'EXPIRED' | 'RETURN'
  const [orderDateFilter, setOrderDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | '7D' | 'MONTH' | 'CUSTOM'
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');

  // Fetch Server Analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const params = { timeframe };
        if (timeframe === 'custom' && customStartDate && customEndDate) {
          params.startDate = customStartDate;
          params.endDate = customEndDate;
        }
        const res = await analyticsService.getDashboardAnalytics(params);
        if (res.data) setServerAnalytics(res.data);
      } catch (e) {
        console.log('Using client fallback analytics');
      }
    };
    fetchAnalytics();
  }, [timeframe, customStartDate, customEndDate, orders.length, products.length]);

  // Fetch Inventory Logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await inventoryService.getInventoryLogs({ limit: 40 });
        if (res.data?.logs) setInventoryLogs(res.data.logs);
      } catch (e) {
        // Mock fallback audit logs if offline
        setInventoryLogs([
          {
            _id: 'log-1',
            sku: 'AML-MLK-1L-12',
            productName: 'Amul Taaza Toned Milk 1L Tetra Pak',
            changeType: 'STOCK_ADDED',
            quantityChange: 100,
            previousStock: 40,
            newStock: 140,
            reason: 'Weekly Procurement Supply',
            adminName: 'Managing Director',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'log-2',
            sku: 'HUL-DOV-125G-36',
            productName: 'Dove Cream Beauty Bathing Soap 125g',
            changeType: 'ORDER_DEDUCTION',
            quantityChange: -10,
            previousStock: 50,
            newStock: 40,
            reason: 'Order deduction for Reliance Retail',
            adminName: 'Rajesh Kumar (Salesman)',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
          }
        ]);
      }
    };
    if (activeTab === 'inventory') {
      fetchLogs();
    }
  }, [activeTab, products]);

  // Derived Real Database Calculations
  const biData = useMemo(() => {
    const now = new Date();
    
    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.date || o.createdAt);
      if (timeframe === 'today') return orderDate.toDateString() === now.toDateString();
      if (timeframe === '7d') {
        const d = new Date(); d.setDate(now.getDate() - 7); return orderDate >= d;
      }
      if (timeframe === '30d') {
        const d = new Date(); d.setDate(now.getDate() - 30); return orderDate >= d;
      }
      if (timeframe === '90d') {
        const d = new Date(); d.setDate(now.getDate() - 90); return orderDate >= d;
      }
      if (timeframe === 'month') return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      if (timeframe === 'custom' && customStartDate && customEndDate) {
        const s = new Date(customStartDate);
        const e = new Date(customEndDate);
        e.setHours(23, 59, 59, 999);
        return orderDate >= s && orderDate <= e;
      }
      return true;
    });

    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(o => !o.status || o.status.toUpperCase().includes('PENDING') || o.status.toUpperCase().includes('PROCESS')).length;
    const completedOrders = filteredOrders.filter(o => o.status && (o.status.toUpperCase().includes('INVOICE') || o.status.toUpperCase().includes('CONFIRM') || o.status.toUpperCase().includes('DELIVER'))).length;
    const cancelledOrders = filteredOrders.filter(o => o.status && o.status.toUpperCase().includes('CANCEL')).length;

    const totalProducts = products.length;
    const inStockCount = products.filter(p => p.stock > (p.lowStockThreshold || 20)).length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 20)).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const activeSalesmenCount = salesmen.filter(s => s.status === 'Active').length;

    // Trend
    const trendMap = {};
    for (const o of filteredOrders) {
      const d = o.date || new Date(o.createdAt).toISOString().split('T')[0];
      const units = o.totalQuantity || o.items?.reduce((acc, i) => acc + (i.qty || i.quantity || 0), 0) || 0;
      if (!trendMap[d]) trendMap[d] = { date: d, ordersCount: 0, totalQuantity: 0 };
      trendMap[d].ordersCount += 1;
      trendMap[d].totalQuantity += units;
    }
    const orderTrend = Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Categories
    const categoryMap = {};
    for (const o of filteredOrders) {
      for (const i of (o.items || [])) {
        const cat = i.category || i.categoryName || 'Food & Beverages';
        if (!categoryMap[cat]) categoryMap[cat] = { category: cat, ordersCount: 0, totalQuantity: 0 };
        categoryMap[cat].ordersCount += 1;
        categoryMap[cat].totalQuantity += (i.qty || i.quantity || 0);
      }
    }
    const categoryAnalytics = Object.values(categoryMap).sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Companies
    const companyMap = {};
    for (const o of filteredOrders) {
      for (const i of (o.items || [])) {
        const comp = i.brand || i.company || i.companyName || 'Amul';
        if (!companyMap[comp]) companyMap[comp] = { company: comp, ordersCount: 0, totalQuantity: 0 };
        companyMap[comp].ordersCount += 1;
        companyMap[comp].totalQuantity += (i.qty || i.quantity || 0);
      }
    }
    const companyAnalytics = Object.values(companyMap).sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Stock Risk Products
    const stockRiskProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 20)).sort((a, b) => a.stock - b.stock);

    // Salesman Performance Analytics (Who sold the most)
    const salesmanMap = {};
    salesmen.forEach(s => {
      salesmanMap[s.id] = {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        region: s.region || 'UP Central (Kanpur HQ)',
        status: s.status || 'Active',
        ordersCount: 0,
        totalQuantity: 0,
        totalRevenue: 0,
        completedOrders: 0
      };
    });

    for (const o of filteredOrders) {
      const sId = o.salesmanId || o.createdBy;
      const sName = o.salesmanName || (sId && salesmen.find(s => s.id === sId)?.name) || 'Direct / Store Order';
      const key = sId || sName;

      if (!salesmanMap[key]) {
        salesmanMap[key] = {
          id: sId || `SM-${key.replace(/\s+/g, '-').toLowerCase()}`,
          name: sName,
          email: o.salesmanEmail || '',
          phone: o.salesmanPhone || '',
          region: o.salesmanRegion || 'Territory Sales',
          status: 'Active',
          ordersCount: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          completedOrders: 0
        };
      }

      const units = Number(o.totalQuantity || o.items?.reduce((acc, i) => acc + Number(i.qty || i.quantity || 0), 0) || 0);
      const rev = Number(o.grandTotal || o.totalAmount || o.subtotal || 0);

      salesmanMap[key].ordersCount += 1;
      salesmanMap[key].totalQuantity += units;
      salesmanMap[key].totalRevenue += rev;
      if (o.status && (o.status.toUpperCase().includes('INVOICE') || o.status.toUpperCase().includes('CONFIRM') || o.status.toUpperCase().includes('DELIVER'))) {
        salesmanMap[key].completedOrders += 1;
      }
    }

    const salesmanAnalytics = Object.values(salesmanMap).sort((a, b) => (b.totalQuantity - a.totalQuantity) || (b.totalRevenue - a.totalRevenue));
    const topSalesman = salesmanAnalytics.find(s => s.totalQuantity > 0 || s.ordersCount > 0) || salesmanAnalytics[0] || null;

    // Product Performance Analytics (Which product sold the most)
    const productMap = {};
    for (const o of filteredOrders) {
      for (const item of (o.items || [])) {
        const pId = item.id || item.productId || item.sku || item.name;
        const name = item.name || 'FMCG Product';
        const sku = item.sku || 'SKU-GEN';
        const brand = item.brand || item.company || item.companyName || 'General FMCG';
        const category = item.category || item.categoryName || 'FMCG';
        const qty = Number(item.qty || item.quantity || 0);
        const price = Number(item.price || 0);
        const rev = Number(item.subtotal || item.total || (qty * price) || 0);

        if (!productMap[pId]) {
          const catalogItem = products.find(p => p && (p.id === item.id || p.sku === item.sku || (item.name && p.name && String(p.name).toLowerCase() === String(item.name).toLowerCase())));
          productMap[pId] = {
            id: pId,
            name: catalogItem?.name || name,
            sku: catalogItem?.sku || sku,
            brand: catalogItem?.brand || brand,
            category: catalogItem?.category || category,
            image: catalogItem?.image || item.image || '',
            price: catalogItem?.price || price,
            stock: catalogItem?.stock ?? null,
            unitsSold: 0,
            totalRevenue: 0,
            ordersCount: 0
          };
        }

        productMap[pId].unitsSold += qty;
        productMap[pId].totalRevenue += (rev || (qty * (productMap[pId].price || 0)));
        productMap[pId].ordersCount += 1;
      }
    }

    const productAnalytics = Object.values(productMap).sort((a, b) => (b.unitsSold - a.unitsSold) || (b.totalRevenue - a.totalRevenue));
    const topProduct = productAnalytics.find(p => p.unitsSold > 0) || productAnalytics[0] || null;

    return {
      kpis: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalProducts,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        activeSalesmenCount
      },
      orderTrend: serverAnalytics?.orderTrend?.length ? serverAnalytics.orderTrend : orderTrend,
      categoryAnalytics: serverAnalytics?.categoryAnalytics?.length ? serverAnalytics.categoryAnalytics : categoryAnalytics,
      companyAnalytics: serverAnalytics?.companyAnalytics?.length ? serverAnalytics.companyAnalytics : companyAnalytics,
      salesmanAnalytics,
      topSalesman,
      productAnalytics,
      topProduct,
      stockRiskProducts
    };
  }, [orders, products, salesmen, timeframe, customStartDate, customEndDate, serverAnalytics]);

  const filteredInventoryProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter(p => {
      if (!p) return false;
      if (!inventorySearch || !inventorySearch.trim()) return true;
      const q = inventorySearch.toLowerCase().trim();
      const pName = String(p.name || '').toLowerCase();
      const pSku = String(p.sku || '').toLowerCase();
      const pBrand = String(p.brand || '').toLowerCase();
      return pName.includes(q) || pSku.includes(q) || pBrand.includes(q);
    });
  }, [products, inventorySearch]);

  const filteredLogs = useMemo(() => {
    if (logFilterType === 'ALL') return inventoryLogs;
    return inventoryLogs.filter(l => l.changeType === logFilterType);
  }, [inventoryLogs, logFilterType]);

  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    return list.filter(c => {
      if (!c) return false;
      if (!customerSearch || !customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase().trim();
      const name = String(c.name || '').toLowerCase();
      const email = String(c.email || '').toLowerCase();
      const mobile = String(c.mobile || '');
      const city = String(c.city || '').toLowerCase();
      const customerId = String(c.customerId || c.id || '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        city.includes(q) ||
        customerId.includes(q)
      );
    });
  }, [customers, customerSearch]);

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockTarget) return;
    await restockProduct(restockTarget.id, restockQty, restockReason);
    setRestockTarget(null);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustTarget) return;
    await adjustProductStock(adjustTarget.id, adjustCount, adjustReason);
    setAdjustTarget(null);
  };

  const handleThresholdSubmit = async (e) => {
    e.preventDefault();
    if (!thresholdTarget) return;
    await updateProductThreshold(thresholdTarget.id, thresholdVal);
    setThresholdTarget(null);
  };

  const handleSaveProduct = (statusOverride = null) => {
    const finalImages = (prodForm.images && prodForm.images.length > 0 ? prodForm.images : [prodForm.image]).filter(Boolean).slice(0, 3);
    const finalForm = {
      ...prodForm,
      image: finalImages[0] || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      gallery: finalImages,
      images: finalImages,
      status: statusOverride || prodForm.status
    };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...finalForm });
      setEditingProduct(null);
    } else {
      addProduct(finalForm);
    }
    setIsAddProductOpen(false);
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    const productImages = (product.gallery && product.gallery.length > 0 
      ? product.gallery 
      : (product.images && product.images.length > 0 ? product.images : [product.image])
    ).filter(Boolean).slice(0, 3);

    setProdForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      sku: product.sku,
      hsn: product.hsn || '19053100',
      price: product.price || 0,
      stock: product.stock ?? 100,
      packSize: product.packSize || '1 Unit',
      bundleSize: product.bundleSize || '5 Units',
      caseSize: product.caseSize || '10 Units',
      isFeatured: product.isFeatured ?? true,
      isNew: product.isNew ?? false,
      isNrp: product.isNrp ?? false,
      status: product.status || 'Published',
      image: productImages[0] || product.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      images: productImages.length > 0 ? productImages : ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'],
      description: product.description
    });
    setIsAddProductOpen(true);
  };

  const handleSaveSalesman = (e) => {
    e.preventDefault();
    if (editingSalesman) {
      updateSalesman({ ...editingSalesman, ...salesmanForm });
      setEditingSalesman(null);
    } else {
      addSalesman(salesmanForm);
    }
    setIsAddSalesmanOpen(false);
    setSalesmanForm({ 
      id: '', 
      name: '', 
      email: '', 
      phone: '', 
      password: 'Sales@123',
      region: 'Central UP (Kanpur HQ)' 
    });
  };

  const handleSetSalesmanPassword = (e) => {
    e.preventDefault();
    if (!salesmanPasswordTarget || !customSalesmanPassword.trim()) return;
    resetSalesmanPassword(salesmanPasswordTarget.id, customSalesmanPassword.trim());
    setSalesmanPasswordTarget(null);
  };

  const handleSaveCustomerSubmit = (e) => {
    e.preventDefault();
    if (!custForm.name || !custForm.name.trim()) return;
    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        ...custForm
      });
      setEditingCustomer(null);
    } else {
      saveCustomer(custForm);
    }
    setIsAddCustomerOpen(false);
    setCustForm({
      name: '',
      mobile: '',
      email: '',
      address: '',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      pincode: '208001',
      classification: 'NORMAL',
      password: 'Cust@123'
    });
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Command Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block">
                Enterprise Business Intelligence & Warehouse Governance
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Managing Director Command Center
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs rounded-xl border border-amber-500/30 hover:border-amber-500/60 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Key className="w-4 h-4 text-amber-400" /> Change Password
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Global Date Filtering Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Analytics Timeframe:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                  timeframe === t.id
                    ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}

            {timeframe === 'custom' && (
              <div className="flex items-center gap-2 pl-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Layout Grid: Sidebar Navigation + Main Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
          
          {/* Left Sidebar Navigation (Sticky & Independent Scroll) */}
          <aside className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto space-y-1 self-start z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2 block">
              BI Modules
            </span>

            {[
              { id: 'analytics', label: 'Executive Dashboard', icon: LayoutDashboard },
              { id: 'customers', label: 'Registered Customers / Users', icon: UserCheck },
              { id: 'announcement', label: 'Floating Headline Bar', icon: Megaphone },
              { id: 'policies', label: 'Legal Policies Editor', icon: Scale },
              { id: 'products', label: 'Products Master (CRUD)', icon: Package },
              { id: 'orders', label: 'Orders & Invoices', icon: ShoppingBag },
              { id: 'salesmen', label: 'Sales Force Roster', icon: Users },
              { id: 'categories', label: 'Categories & Brands', icon: Layers },
              { id: 'reports', label: 'Reports & Export Center', icon: FileText }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-brand-900 text-white dark:bg-brand-600 shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Right Main Content Area (Scrolls Independently) */}
          <main className="lg:col-span-9 space-y-6 min-w-0">
            
            {/* ================= TAB 1: EXECUTIVE ANALYTICS DASHBOARD ================= */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                
                {/* Active Floating Headline Announcement Quick Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-slate-900/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase bg-amber-500 text-slate-950 shrink-0 flex items-center gap-1 shadow-sm">
                      <Megaphone className="w-3 h-3" />
                      {headlineConfig?.tag || 'ANNOUNCEMENT'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {headlineConfig?.isVisible ? headlineConfig?.text : 'Headline Announcement is currently disabled.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('announcement')}
                      className="px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Broadcast
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Total Orders</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white block">{biData.kpis.totalOrders}</span>
                    <span className="text-[10px] font-bold text-slate-500 block mt-1">Live database count</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Pending Orders</span>
                    <span className="text-2xl font-black text-amber-500 block">{biData.kpis.pendingOrders}</span>
                    <span className="text-[10px] text-amber-600 block mt-1">Awaiting fulfillment</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Completed / Invoiced</span>
                    <span className="text-2xl font-black text-emerald-600 block">{biData.kpis.completedOrders}</span>
                    <span className="text-[10px] text-emerald-600 block mt-1">Invoices generated</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Catalog SKUs</span>
                    <span className="text-2xl font-black text-brand-600 dark:text-amber-400 block">{products.length}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Active products</span>
                  </div>
                </div>



                {/* Order Volume Trend Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-900 dark:text-amber-400" />
                    Order Volume Trend
                  </h3>

                  {biData.orderTrend.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed rounded-2xl">
                      <Clock className="w-8 h-8 text-slate-300 mb-2" />
                      No order records booked within the selected date timeframe.
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={biData.orderTrend}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip />
                          <Bar dataKey="totalQuantity" name="Units Sourced" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="ordersCount" name="Orders Count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Performance Rankings: Top Selling Products */}
                <div>
                  {/* Top Selling Products Leaderboard */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Package className="w-4 h-4 text-emerald-500" />
                          Top Selling Products
                        </h3>
                        <p className="text-[11px] text-slate-400">Ranked by total units sold across wholesale orders</p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                        {biData.productAnalytics?.length || 0} SKUs
                      </span>
                    </div>

                    {biData.productAnalytics && biData.productAnalytics.length > 0 ? (
                      <div className="space-y-3">
                        {biData.productAnalytics.slice(0, 6).map((p, idx) => {
                          const maxUnits = Math.max(...biData.productAnalytics.map(pr => pr.unitsSold), 1);
                          const pct = Math.round((p.unitsSold / maxUnits) * 100);
                          const isTop = idx === 0 && p.unitsSold > 0;

                          return (
                            <div
                              key={p.id || idx}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                isTop
                                  ? 'bg-emerald-500/5 border-emerald-500/30'
                                  : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                      idx === 0
                                        ? 'bg-emerald-500 text-slate-950'
                                        : idx === 1
                                        ? 'bg-slate-300 text-slate-900'
                                        : idx === 2
                                        ? 'bg-amber-700/80 text-white'
                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                      {p.name}
                                      {isTop && <Flame className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 truncate block">
                                      {p.brand} • SKU: {p.sku}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                                    {p.unitsSold.toLocaleString()} Units
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                                    {p.category}
                                  </span>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isTop ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-emerald-600 dark:bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.max(pct, p.unitsSold > 0 ? 5 : 0)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">No product sale data recorded yet.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ================= TAB: REGISTERED CUSTOMERS / USERS DIRECTORY ================= */}
            {/* ================= TAB: REGISTERED CUSTOMERS / USERS DIRECTORY ================= */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                {/* Customer Analytics KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Total Registered Users
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {(Array.isArray(customers) ? customers : []).length} Accounts
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-600 block mt-1">Live Database Roster</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Kanpur HQ Territory
                    </span>
                    <span className="text-2xl font-black text-amber-500">
                      {(Array.isArray(customers) ? customers : []).filter(c => c && String(c.city || '').toLowerCase().includes('kanpur')).length} Stores
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-600 block mt-1">Primary Wholesale Mandi</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Normal Customer Status
                    </span>
                    <span className="text-2xl font-black text-emerald-600">
                      {(Array.isArray(customers) ? customers : []).filter(c => c && (!c.classification || c.classification === 'NORMAL')).length} Retailers
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-400 block mt-1">Verified Standard Buying</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Special Classifications
                    </span>
                    <span className="text-2xl font-black text-brand-900 dark:text-amber-400">
                      {(Array.isArray(customers) ? customers : []).filter(c => c && (c.classification === 'DAMAGE' || c.classification === 'EXPIRY')).length} Stores
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-400 block mt-1">Damage / Expiry Accounts</span>
                  </div>
                </div>

                {/* Customer Master Search & Action Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-amber-500" />
                        Registered Customers & User Accounts Directory
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Full view of registered retail stores, user accounts, delivery locations, and contact details.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setEditingCustomer(null);
                          setCustForm({
                            name: '',
                            mobile: '',
                            email: '',
                            address: '',
                            city: 'Kanpur',
                            state: 'Uttar Pradesh',
                            pincode: '208001',
                            classification: 'NORMAL',
                            password: 'Cust@123'
                          });
                          setIsAddCustomerOpen(true);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Registered Customer / User
                      </button>
                      <button
                        onClick={() => exportCustomersCSV(customers || [])}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" /> Export Users Excel (.XLSX)
                      </button>
                    </div>
                  </div>

                  {/* Search Input Bar */}
                  <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search customer name, email, mobile, city, ID..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    {customerSearch && (
                      <button
                        onClick={() => setCustomerSearch('')}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Customer Directory Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-extrabold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Customer ID / Retail Store</th>
                          <th className="py-3 px-4">Contact Info (Mobile & Email)</th>
                          <th className="py-3 px-4">Delivery Address & City</th>
                          <th className="py-3 px-4 text-center">Classification</th>
                          <th className="py-3 px-4 text-center">Total Orders</th>
                          <th className="py-3 px-4 text-center">Direct Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.map(cust => {
                            if (!cust) return null;
                            const custName = cust.name || cust.email || cust.mobile || 'Registered Customer';
                            const custId = cust.customerId || cust.id || 'CUST-000';
                            const custOrdersCount = (Array.isArray(orders) ? orders : []).filter(o => 
                              o && (
                                (o.customerName && custName && String(o.customerName).toLowerCase() === String(custName).toLowerCase()) ||
                                (o.customerId && String(o.customerId) === String(custId))
                              )
                            ).length;

                            return (
                              <tr key={cust.id || cust.customerId || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/20 shrink-0">
                                      <Store className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <strong className="block text-slate-900 dark:text-white font-extrabold text-xs">
                                        {custName}
                                      </strong>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        ID: {custId}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <div className="text-slate-900 dark:text-white font-bold flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span>{cust.mobile || 'No Mobile'}</span>
                                    </div>
                                    {cust.email && (
                                      <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                                        <span className="text-slate-400">✉</span> {cust.email}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-slate-900 dark:text-white block">
                                      {cust.city || 'Kanpur'}, {cust.state || 'Uttar Pradesh'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                                      {cust.address || 'Standard Delivery Location'}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                    cust.classification === 'DAMAGE'
                                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                      : cust.classification === 'EXPIRY'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  }`}>
                                    {cust.classification || 'NORMAL'}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    {custOrdersCount} Orders
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    {cust.mobile && (
                                      <a
                                        href={`https://api.whatsapp.com/send?phone=${String(cust.mobile).replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg transition-colors"
                                        title="WhatsApp Chat"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    <button
                                      onClick={() => {
                                        setEditingCustomer(cust);
                                        setCustForm({
                                          id: cust.id || cust.customerId,
                                          customerId: cust.customerId || cust.id,
                                          name: cust.name || '',
                                          mobile: cust.mobile || '',
                                          email: cust.email || '',
                                          address: cust.address || '',
                                          city: cust.city || 'Kanpur',
                                          state: cust.state || 'Uttar Pradesh',
                                          pincode: cust.pincode || '208001',
                                          classification: cust.classification || 'NORMAL',
                                          password: cust.password || 'Cust@123'
                                        });
                                        setIsAddCustomerOpen(true);
                                      }}
                                      className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-slate-950 rounded-lg transition-colors"
                                      title="Edit Customer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete customer account "${custName}"?`)) {
                                          deleteCustomer(cust.id || cust.customerId);
                                        }
                                      }}
                                      className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-colors"
                                      title="Delete Customer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveTab('orders');
                                      }}
                                      className="px-2 py-1 bg-brand-900 hover:bg-brand-800 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm"
                                    >
                                      <Eye className="w-3 h-3" /> Orders
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-slate-400 font-bold">
                              No registered customers found matching "{customerSearch}".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: PRODUCTS MASTER ================= */}
            {activeTab === 'products' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative flex-1 max-w-xs w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      placeholder="Search SKU, Brand, Title..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportProductsCSV(products)}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" /> Export Catalog Excel (.XLSX)
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProdForm({
                          name: '', brand: brands[0]?.name || 'Amul', category: categories[0]?.name || 'Food & Beverages',
                          sku: '', hsn: '19053100', price: 1200, stock: 100, lowStockThreshold: 20,
                          packSize: '1 Unit', bundleSize: '5 Units', caseSize: '10 Units',
                          isFeatured: true, isNew: true, status: 'Published',
                          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
                          description: 'High-margin B2B product.'
                        });
                        setIsAddProductOpen(true);
                      }}
                      className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add Product Record
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Product & SKU</th>
                        <th className="py-3 px-4">Brand</th>
                        <th className="py-3 px-4">Pack Info</th>
                        <th className="py-3 px-4 text-center">Badges</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {products.filter(p => !prodSearch || p.name.toLowerCase().includes(prodSearch.toLowerCase()) || p.sku.toLowerCase().includes(prodSearch.toLowerCase())).map(prod => (
                        <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={prod.image} alt={prod.name} className="w-10 h-10 object-contain bg-slate-50 rounded-lg border shrink-0" />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">{prod.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold">{prod.brand}</td>
                          <td className="py-3 px-4 text-[10px] text-slate-500">
                            <div>Pack: <strong>{prod.packSize || '1 Unit'}</strong></div>
                            <div>Case: <strong>{prod.caseSize || '10 Units'}</strong></div>
                          </td>
                          <td className="py-3 px-4 text-center space-x-1">
                            <button
                              onClick={() => toggleProductFeatured(prod.id)}
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${prod.isFeatured ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                            >
                              Featured
                            </button>
                            <button
                              onClick={() => toggleProductNew(prod.id)}
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${prod.isNew ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'}`}
                            >
                              New
                            </button>
                            <button
                              onClick={() => updateProduct({ ...prod, isNrp: !prod.isNrp })}
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${prod.isNrp ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                              title="Toggle No Return Policy (NRP)"
                            >
                              NRP
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleProductStatus(prod.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${prod.status === 'Published' ? 'bg-brand-100 text-brand-900' : 'bg-slate-200 text-slate-700'}`}
                            >
                              {prod.status || 'Published'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center space-x-1">
                            <button onClick={() => handleEditProductClick(prod)} className="p-1.5 text-slate-400 hover:text-amber-500" title="Edit Product">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteProduct(prod.id)} className="p-1.5 text-slate-400 hover:text-red-600" title="Delete Product">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 4: ORDERS & INVOICES ================= */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative flex-1 max-w-xs w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search Invoice #, Customer..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  {/* Filter Chips for Urgent, Expired, and Return Orders */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {[
                      { id: 'ALL', label: 'All Invoices', count: orders.length },
                      { id: 'URGENT', label: '⚡ Urgent Priority', count: orders.filter(o => o.hasUrgentItems || o.items?.some(i => i.isPriority)).length },
                      { id: 'EXPIRED', label: '⚠️ Expired Claims', count: orders.filter(o => (o.expiredItems && o.expiredItems.length > 0) || o.hasExpiredItems).length },
                      { id: 'RETURN', label: '🔄 Return Claims', count: orders.filter(o => (o.returnItems && o.returnItems.length > 0) || o.hasReturnItems).length }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setOrderTypeFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                          orderTypeFilter === f.id
                            ? 'bg-brand-900 text-white dark:bg-brand-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          orderTypeFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => exportOrdersCSV(orders)}
                    className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" /> Export Orders Excel (.XLSX)
                  </button>
                </div>

                {/* Interactive Date Range & Timeframe Filter Sub-Bar */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Filter Invoices by Date System:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'ALL', label: 'All Dates' },
                      { id: 'TODAY', label: 'Today' },
                      { id: 'YESTERDAY', label: 'Yesterday' },
                      { id: '7D', label: 'Last 7 Days' },
                      { id: 'MONTH', label: 'This Month' },
                      { id: 'CUSTOM', label: 'Custom Date Range' }
                    ].map(df => (
                      <button
                        key={df.id}
                        type="button"
                        onClick={() => setOrderDateFilter(df.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          orderDateFilter === df.id
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-extrabold'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {df.label}
                      </button>
                    ))}

                    {orderDateFilter === 'CUSTOM' && (
                      <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-700">
                        <input
                          type="date"
                          value={orderStartDate}
                          onChange={(e) => setOrderStartDate(e.target.value)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="date"
                          value={orderEndDate}
                          onChange={(e) => setOrderEndDate(e.target.value)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Invoice #</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Customer & Flags</th>
                        <th className="py-3.5 px-4">Representative</th>
                        <th className="py-3.5 px-4 text-center">Items</th>
                        <th className="py-3.5 px-4 text-center">Special Dockets</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders
                        .filter(o => {
                          if (orderTypeFilter === 'URGENT') return o.hasUrgentItems || o.items?.some(i => i.isPriority);
                          if (orderTypeFilter === 'EXPIRED') return (o.expiredItems && o.expiredItems.length > 0) || o.hasExpiredItems;
                          if (orderTypeFilter === 'RETURN') return (o.returnItems && o.returnItems.length > 0) || o.hasReturnItems;
                          return true;
                        })
                        .filter(o => {
                          if (orderDateFilter === 'ALL') return true;
                          if (!o.date) return true;
                          const oDateStr = String(o.date).split('T')[0];
                          const todayStr = new Date().toISOString().split('T')[0];

                          if (orderDateFilter === 'TODAY') {
                            return oDateStr === todayStr;
                          }
                          if (orderDateFilter === 'YESTERDAY') {
                            const yest = new Date();
                            yest.setDate(yest.getDate() - 1);
                            return oDateStr === yest.toISOString().split('T')[0];
                          }
                          if (orderDateFilter === '7D') {
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                            return new Date(oDateStr) >= sevenDaysAgo;
                          }
                          if (orderDateFilter === 'MONTH') {
                            const now = new Date();
                            const oD = new Date(oDateStr);
                            return oD.getMonth() === now.getMonth() && oD.getFullYear() === now.getFullYear();
                          }
                          if (orderDateFilter === 'CUSTOM') {
                            if (orderStartDate && oDateStr < orderStartDate) return false;
                            if (orderEndDate && oDateStr > orderEndDate) return false;
                            return true;
                          }
                          return true;
                        })
                        .filter(o => !orderSearch || (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(orderSearch.toLowerCase())) || (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())))
                        .map(order => {
                          const hasUrgent = order.hasUrgentItems || order.items?.some(i => i.isPriority);
                          const expCount = order.expiredItems?.length || 0;
                          const retCount = order.returnItems?.length || 0;

                          // Format Date, Day, Time & Timestamp
                          let dObj = new Date();
                          if (order.timestamp) {
                            dObj = new Date(order.timestamp);
                          } else if (order.date) {
                            dObj = new Date(order.date.includes('T') ? order.date : `${order.date}T12:00:00`);
                          }
                          if (isNaN(dObj.getTime())) dObj = new Date();

                          const dayStr = order.day || dObj.toLocaleDateString('en-US', { weekday: 'short' });
                          const timeStr = order.time || dObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                          return (
                            <tr key={order.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/40 ${
                              hasUrgent ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                            }`}>
                              <td className="py-3.5 px-4">
                                <span className="font-mono font-bold text-brand-900 dark:text-brand-400 block">
                                  {order.invoiceNumber || order.id}
                                </span>
                                {hasUrgent && (
                                  <span className="mt-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase inline-flex items-center gap-0.5 shadow-sm">
                                    <Zap className="w-2.5 h-2.5 fill-slate-950" /> URGENT
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                <strong className="block text-xs font-extrabold">{order.date} ({dayStr})</strong>
                                <span className="text-[10px] text-slate-400 block font-semibold">🕒 {timeStr}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <strong className="text-slate-900 dark:text-white font-bold block">{order.customerName}</strong>
                                <span className="text-[10px] text-slate-400 font-medium">{order.customerType || 'Normal Customer'}</span>
                              </td>
                              <td className="py-3.5 px-4 font-medium">{order.salesmanName || order.salesmanId}</td>
                              <td className="py-3.5 px-4 text-center font-bold">
                                <div>{order.items?.length || 0} SKUs</div>
                                <span className="text-[10px] text-slate-400 font-normal">({order.totalQuantity || 0} units)</span>
                              </td>
                              <td className="py-3.5 px-4 text-center space-y-1">
                                {expCount > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-extrabold text-[9px] uppercase inline-flex items-center gap-0.5 mx-auto">
                                    <AlertOctagon className="w-2.5 h-2.5" /> {expCount} Expired
                                  </span>
                                )}
                                {retCount > 0 && (
                                  <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-extrabold text-[9px] uppercase inline-flex items-center gap-0.5 mx-auto">
                                    <RotateCcw className="w-2.5 h-2.5" /> {retCount} Returns
                                  </span>
                                )}
                                {expCount === 0 && retCount === 0 && (
                                  <span className="text-[10px] text-slate-400 font-mono">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => openInvoiceModal(order)}
                                  className="px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-400" /> View Invoice
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 5: SALES FORCE ROSTER ================= */}
            {activeTab === 'salesmen' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative flex-1 max-w-xs w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={salesmanSearch}
                      onChange={(e) => setSalesmanSearch(e.target.value)}
                      placeholder="Search name, phone, ID..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportSalesmenCSV(salesmen)}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" /> Export Roster Excel (.XLSX)
                    </button>
                    <button
                      onClick={() => {
                        setEditingSalesman(null);
                        setSalesmanForm({ 
                          id: `AE-SM-00${salesmen.length + 1}`, 
                          name: '', 
                          email: '', 
                          phone: '', 
                          password: 'Sales@123',
                          region: 'Central UP (Kanpur HQ)' 
                        });
                        setIsAddSalesmanOpen(true);
                      }}
                      className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Salesman Account
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Salesman ID</th>
                        <th className="py-3 px-4">Representative</th>
                        <th className="py-3 px-4">Contact Info</th>
                        <th className="py-3 px-4">Territory</th>
                        <th className="py-3 px-4">Password</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {salesmen.filter(s => !salesmanSearch || s.name.toLowerCase().includes(salesmanSearch.toLowerCase()) || s.id.toLowerCase().includes(salesmanSearch.toLowerCase())).map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                          <td className="py-3 px-4 font-mono font-bold text-brand-900 dark:text-brand-400">{s.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                          <td className="py-3 px-4 text-[11px] text-slate-500">
                            <div>{s.phone}</div>
                            <div>{s.email}</div>
                          </td>
                          <td className="py-3 px-4 font-medium">{s.region}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {s.password || 'Sales@123'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                                s.status === 'Active' 
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                              {s.status === 'Active' ? 'Active' : 'Paused'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Pause / Resume ID Button */}
                              <button
                                type="button"
                                onClick={() => toggleSalesmanStatus(s.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors border ${
                                  s.status === 'Active'
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                                }`}
                                title={s.status === 'Active' ? 'Pause this Salesman ID' : 'Resume this Salesman ID'}
                              >
                                {s.status === 'Active' ? (
                                  <>
                                    <PauseCircle className="w-3 h-3 text-amber-600" />
                                    <span>Pause ID</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-3 h-3 text-emerald-600" />
                                    <span>Resume ID</span>
                                  </>
                                )}
                              </button>

                              {/* Set Password Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSalesmanPasswordTarget(s);
                                  setCustomSalesmanPassword(s.password || 'Sales@123');
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors border border-slate-200 dark:border-slate-700"
                                title="Set or change password for this salesman"
                              >
                                <Key className="w-3 h-3 text-amber-500" />
                                <span>Password</span>
                              </button>

                              {/* Delete Salesman ID Button */}
                              <button
                                type="button"
                                onClick={() => setSalesmanToDelete(s)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors border border-rose-200 dark:border-rose-900/50"
                                title="Permanently delete this salesman account"
                              >
                                <Trash2 className="w-3 h-3 text-rose-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 6: CATEGORIES & BRANDS ================= */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Categories Master */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    Product Categories ({categories.length})
                  </h3>

                  <form onSubmit={(e) => { e.preventDefault(); if (newCategoryInput.trim()) { addCategory(newCategoryInput.trim()); setNewCategoryInput(''); } }} className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="New Category Name..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs"
                    />
                    <button type="submit" className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold">
                      Add
                    </button>
                  </form>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
                    {categories.map(c => (
                      <div key={c.id || c.name} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                        <button onClick={() => deleteCategory(c.id || c._id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Companies / Brands Master */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-500" />
                    Authorized Companies / Brands ({brands.length})
                  </h3>

                  <form onSubmit={(e) => { e.preventDefault(); if (newCompanyInput.trim()) { addBrand(newCompanyInput.trim()); setNewCompanyInput(''); } }} className="flex gap-2">
                    <input
                      type="text"
                      value={newCompanyInput}
                      onChange={(e) => setNewCompanyInput(e.target.value)}
                      placeholder="New Company / Brand Name..."
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs"
                    />
                    <button type="submit" className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold">
                      Add
                    </button>
                  </form>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
                    {brands.map(b => (
                      <div key={b.id || b.name} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{b.name}</span>
                        <button onClick={() => deleteBrand(b.id || b._id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ================= TAB 7: REPORTS & EXPORT CENTER ================= */}
            {activeTab === 'reports' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    Business Reports & Microsoft Excel (.XLSX) Export Center
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Generate instant, auto-formatted Microsoft Excel workbooks for audit, accounting, and inventory tracking.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Orders & Invoices Export</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Complete record of {orders.length} order invoices & collections</p>
                    </div>
                    <button
                      onClick={() => exportOrdersCSV(orders)}
                      className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Excel (.XLSX)
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Product Catalogue Master</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">All {products.length} SKUs with packaging details</p>
                    </div>
                    <button
                      onClick={() => exportProductsCSV(products)}
                      className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Excel (.XLSX)
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Sales Force Performance Roster</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Roster of {salesmen.length} sales representatives and territories</p>
                    </div>
                    <button
                      onClick={() => exportSalesmenCSV(salesmen)}
                      className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Excel (.XLSX)
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Inventory Stock Risk Report</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Current warehouse stock levels and replenishment alerts</p>
                    </div>
                    <button
                      onClick={() => exportInventoryReportCSV(products)}
                      className="px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Excel (.XLSX)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 8: FLOATING HEADLINE & ANNOUNCEMENT BAR ================= */}
            {activeTab === 'announcement' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                
                {/* Header & Status Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-500" />
                      Floating Banner Settings
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure the live announcement text bar shown under the main navbar.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHeadlineForm(prev => ({ ...prev, isVisible: !prev.isVisible }))}
                    className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-sm ${
                      headlineForm.isVisible
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{headlineForm.isVisible ? '● Live on Website' : '○ Disabled'}</span>
                  </button>
                </div>

                {/* Live Banner Preview */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">Live Website Banner Preview:</span>
                  <div className={`p-3 rounded-2xl border ${
                    headlineForm.variant === 'blue'
                      ? 'bg-blue-50/80 dark:bg-slate-950 border-blue-200 dark:border-blue-900/60'
                      : headlineForm.variant === 'emerald'
                      ? 'bg-emerald-50/80 dark:bg-slate-950 border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-amber-50/80 dark:bg-slate-950 border-amber-200 dark:border-amber-900/60'
                  } flex items-center justify-between gap-3`}>
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider shrink-0 ${
                        headlineForm.variant === 'blue'
                          ? 'bg-blue-600 text-white'
                          : headlineForm.variant === 'emerald'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}>
                        {headlineForm.tag || 'ANNOUNCEMENT'}
                      </span>
                      
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {headlineForm.text || 'No announcement message entered...'}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {headlineForm.isVisible ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSaveHeadline} className="space-y-4 pt-1">
                  
                  {/* Preset Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Quick Templates:</span>
                    {[
                      { title: "Dairy Restock", tag: "WHOLESALE UPDATE", variant: "amber", text: "⚡ Special FMCG Sourcing Alert: Fresh Amul & Nestlé milk batches arrived at Kanpur Central Hub with same-day dispatch!" },
                      { title: "Dispatch Hours", tag: "DISPATCH NOTICE", variant: "blue", text: "📢 Notice: Kanpur Central Dispatch Hub active Monday–Saturday 8:00 AM to 8:00 PM for all Retail Store Replenishment orders." },
                      { title: "Stock Alert", tag: "STOCK ALERT", variant: "amber", text: "🍫 Special Stock Arrival: Cadbury Dairy Milk & Britannia Good Day wholesale case lots ready for immediate invoicing." },
                      { title: "Express Shipping", tag: "FAST DISPATCH", variant: "emerald", text: "🚛 Wholesale Express: Same-day order dispatch available for registered retail merchants across Uttar Pradesh." }
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setHeadlineForm({
                          isVisible: true,
                          tag: tpl.tag,
                          variant: tpl.variant,
                          text: tpl.text
                        })}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Badge Label */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Badge Tag
                      </label>
                      <input
                        type="text"
                        required
                        value={headlineForm.tag}
                        onChange={(e) => setHeadlineForm({ ...headlineForm, tag: e.target.value })}
                        placeholder="ANNOUNCEMENT"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Color Theme */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Color Theme
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'amber', label: 'Amber Gold', active: 'bg-amber-500 text-slate-950 border-amber-500' },
                          { id: 'blue', label: 'Brand Blue', active: 'bg-blue-600 text-white border-blue-600' },
                          { id: 'emerald', label: 'Emerald Green', active: 'bg-emerald-600 text-white border-emerald-600' },
                        ].map(v => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setHeadlineForm({ ...headlineForm, variant: v.id })}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                              headlineForm.variant === v.id
                                ? `${v.active} shadow-sm font-black`
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                        Announcement Message
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {headlineForm.text.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={headlineForm.text}
                      onChange={(e) => setHeadlineForm({ ...headlineForm, text: e.target.value })}
                      placeholder="Type banner text message here..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors"
                    >
                      <Megaphone className="w-4 h-4 text-amber-400" />
                      <span>Save & Publish Banner</span>
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* ================= TAB 9: LEGAL & POLICY CONTENT EDITOR ================= */}
            {activeTab === 'policies' && (
              <div className="space-y-6">
                
                {/* Header Management Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Scale className="w-5 h-5 text-amber-500" />
                        Legal & Compliance Policy Content Editor
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Edit and publish real-time statutory B2B trade policies (Privacy Policy, Terms of Supply, Return & Replacement Policy).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const targetView = selectedPolicyKey === 'terms' ? 'terms-of-supply' : selectedPolicyKey === 'returns' ? 'return-policy' : 'privacy-policy';
                          navigateTo(targetView);
                        }}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Preview Live Page</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset all legal policies back to standard statutory defaults?')) {
                            resetLegalPolicies();
                          }
                        }}
                        className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 hover:text-red-700 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </div>

                  {/* Policy Switcher Tabs */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {[
                      { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, sub: 'B2B Data Encryption & Security' },
                      { id: 'terms', label: 'Terms of Supply', icon: FileText, sub: 'Wholesale Trade & Credit Terms' },
                      { id: 'returns', label: 'Return & Claims Policy', icon: RotateCcw, sub: 'OEM Guarantee & Expiry Dockets' }
                    ].map(p => {
                      const Icon = p.icon;
                      const isSelected = selectedPolicyKey === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPolicyKey(p.id)}
                          className={`flex-1 min-w-[200px] p-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-3 border ${
                            isSelected
                              ? 'bg-brand-900 text-white dark:bg-brand-700 border-brand-900 shadow-md scale-[1.01]'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="block text-xs font-bold">{p.label}</span>
                            <span className={`text-[10px] font-normal block ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                              {p.sub}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Editor Body */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateLegalPolicy(selectedPolicyKey, policyForm);
                  }}
                  className="space-y-6 text-xs"
                >
                  
                  {/* Meta Information Card */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      1. Document Metadata & Identification
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                          Document Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={policyForm.title || ''}
                          onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                          Framework / Subtitle Description
                        </label>
                        <input
                          type="text"
                          value={policyForm.subtitle || ''}
                          onChange={(e) => setPolicyForm({ ...policyForm, subtitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                          Version String
                        </label>
                        <input
                          type="text"
                          value={policyForm.version || ''}
                          onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                          Last Updated Date
                        </label>
                        <input
                          type="text"
                          value={policyForm.lastUpdated || ''}
                          onChange={(e) => setPolicyForm({ ...policyForm, lastUpdated: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                          placeholder="August 2026"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                          Governing Jurisdiction
                        </label>
                        <input
                          type="text"
                          value={policyForm.jurisdiction || ''}
                          onChange={(e) => setPolicyForm({ ...policyForm, jurisdiction: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                          placeholder="Kanpur Jurisdiction, Uttar Pradesh"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                        Executive Commercial Summary *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={policyForm.summary || ''}
                        onChange={(e) => setPolicyForm({ ...policyForm, summary: e.target.value })}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Section-by-Section Editor */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-amber-500" />
                        2. Policy Clauses & Operational Sections ({policyForm.sections?.length || 0})
                      </h4>

                      <button
                        type="button"
                        onClick={() => {
                          const nextNum = (policyForm.sections?.length || 0) + 1;
                          const newSec = {
                            id: `sec-${Date.now()}`,
                            number: String(nextNum),
                            heading: `New Policy Clause §${nextNum}`,
                            content: 'Describe the commercial terms or operational standard for this policy clause.',
                            keyPoints: ['Clause operational point 1', 'Clause operational point 2']
                          };
                          setPolicyForm({
                            ...policyForm,
                            sections: [...(policyForm.sections || []), newSec]
                          });
                        }}
                        className="px-3.5 py-1.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Add New Clause</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {policyForm.sections?.map((sec, secIdx) => (
                        <div
                          key={sec.id || secIdx}
                          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4"
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-mono font-black text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                                §{sec.number || secIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={sec.heading || ''}
                                onChange={(e) => {
                                  const updatedSecs = [...policyForm.sections];
                                  updatedSecs[secIdx].heading = e.target.value;
                                  setPolicyForm({ ...policyForm, sections: updatedSecs });
                                }}
                                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-extrabold text-xs text-slate-900 dark:text-white"
                                placeholder="Section Heading..."
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete clause "${sec.heading}"?`)) {
                                  const updatedSecs = policyForm.sections.filter((_, i) => i !== secIdx);
                                  setPolicyForm({ ...policyForm, sections: updatedSecs });
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Delete this clause"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Clause Content / Paragraph</label>
                            <textarea
                              rows={3}
                              value={sec.content || ''}
                              onChange={(e) => {
                                const updatedSecs = [...policyForm.sections];
                                updatedSecs[secIdx].content = e.target.value;
                                setPolicyForm({ ...policyForm, sections: updatedSecs });
                              }}
                              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs leading-relaxed"
                              placeholder="Clause full text..."
                            />
                          </div>

                          {/* Key Points Sub-List */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-500">Key Highlights / Bullet Items</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedSecs = [...policyForm.sections];
                                  if (!updatedSecs[secIdx].keyPoints) updatedSecs[secIdx].keyPoints = [];
                                  updatedSecs[secIdx].keyPoints.push('New key highlight point');
                                  setPolicyForm({ ...policyForm, sections: updatedSecs });
                                }}
                                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                              >
                                + Add Bullet Point
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {sec.keyPoints?.map((kp, kpIdx) => (
                                <div key={kpIdx} className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <input
                                    type="text"
                                    value={kp}
                                    onChange={(e) => {
                                      const updatedSecs = [...policyForm.sections];
                                      updatedSecs[secIdx].keyPoints[kpIdx] = e.target.value;
                                      setPolicyForm({ ...policyForm, sections: updatedSecs });
                                    }}
                                    className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedSecs = [...policyForm.sections];
                                      updatedSecs[secIdx].keyPoints.splice(kpIdx, 1);
                                      setPolicyForm({ ...policyForm, sections: updatedSecs });
                                    }}
                                    className="text-slate-400 hover:text-red-500 p-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Optional Alert Note Input */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">
                              Optional Alert / Warning Notice (Highlighted in Red Box)
                            </label>
                            <input
                              type="text"
                              value={sec.alertNote || ''}
                              onChange={(e) => {
                                const updatedSecs = [...policyForm.sections];
                                updatedSecs[secIdx].alertNote = e.target.value;
                                setPolicyForm({ ...policyForm, sections: updatedSecs });
                              }}
                              className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-red-600 dark:text-red-400"
                              placeholder="e.g. Legal Venue Notice: All proceedings must be served in Kanpur Jurisdiction..."
                            />
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-brand-900/30 flex items-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Save & Publish {policyForm.title || 'Policy'} Changes</span>
                    </button>
                  </div>

                </form>

              </div>
            )}

          </main>

        </div>

      </div>

      {/* Incremental Restock Modal */}
      <AnimatePresence>
        {restockTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-amber-500" />
                  Procurement Restock: {restockTarget.name}
                </h3>
                <button onClick={() => setRestockTarget(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Stock:</span>
                    <strong className="text-slate-900 dark:text-white font-black">{restockTarget.stock} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Restock Addition:</span>
                    <strong className="text-emerald-600 font-black">+{restockQty || 0} units</strong>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-extrabold">
                    <span>New Warehouse Total:</span>
                    <span className="text-brand-900 dark:text-amber-400 font-black text-sm">
                      {restockTarget.stock + (parseInt(restockQty, 10) || 0)} units
                    </span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Quick Addition Presets</label>
                  <div className="flex gap-1.5">
                    {[25, 50, 100, 250, 500].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setRestockQty(qty)}
                        className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                          restockQty === qty
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Custom Restock Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(parseInt(e.target.value, 10) || '')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Procurement Reason / Notes</label>
                  <input
                    type="text"
                    required
                    value={restockReason}
                    onChange={(e) => setRestockReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRestockTarget(null)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow"
                  >
                    Confirm Restock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Count Audit Modal */}
      <AnimatePresence>
        {adjustTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                  Physical Count Audit: {adjustTarget.name}
                </h3>
                <button onClick={() => setAdjustTarget(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border flex justify-between items-center">
                  <span className="text-slate-500">Current Recorded Stock:</span>
                  <strong className="text-slate-900 dark:text-white font-black">{adjustTarget.stock} units</strong>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Verified Physical Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={adjustCount}
                    onChange={(e) => setAdjustCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Difference: {adjustCount - adjustTarget.stock >= 0 ? `+${adjustCount - adjustTarget.stock}` : adjustCount - adjustTarget.stock} units
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Audit Reason</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustTarget(null)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow"
                  >
                    Commit Stock Count
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Threshold Config Modal */}
      <AnimatePresence>
        {thresholdTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Configure Low Stock Threshold
                </h3>
                <button onClick={() => setThresholdTarget(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleThresholdSubmit} className="space-y-4 text-xs">
                <div>
                  <strong className="block text-slate-900 dark:text-white mb-1">{thresholdTarget.name}</strong>
                  <span className="font-mono text-slate-400 text-[10px]">SKU: {thresholdTarget.sku}</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alert Threshold (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={thresholdVal}
                    onChange={(e) => setThresholdVal(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    An alert will automatically trigger when warehouse stock falls to or below this amount.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setThresholdTarget(null)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-900 text-white font-extrabold rounded-xl shadow"
                  >
                    Save Threshold
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Product Record Modal */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">
                      {editingProduct ? 'Edit B2B Product Details' : 'Add New B2B Product to Database'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Enter FMCG specifications and warehouse inventory details</p>
                  </div>
                </div>
                <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* 1. Basic Identification */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="e.g. Amul Taaza Homogenised Toned Milk 1L Tetra Pak (Case of 12)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Brand / Company *
                    </label>
                    <select
                      value={prodForm.brand}
                      onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
                    >
                      {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
                    >
                      {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        SKU Code *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const prefix = (prodForm.brand || 'PRD').slice(0, 3).toUpperCase();
                          const slugName = (prodForm.name || 'ITEM').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
                          const randomSuffix = Math.floor(100 + Math.random() * 900);
                          setProdForm({ ...prodForm, sku: `${prefix}-${slugName}-${randomSuffix}` });
                        }}
                        className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        Auto-Gen
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={prodForm.sku}
                      onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value.toUpperCase() })}
                      placeholder="e.g. AML-TAZ-1L-12"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-900 dark:text-white uppercase"
                    />
                  </div>
                </div>

                {/* 2. B2B Packaging Breakdown */}
                <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-brand-500/5 to-slate-100 dark:to-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                    📦 B2B Packaging Hierarchy
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Unit Pack Size</label>
                      <input
                        type="text"
                        value={prodForm.packSize}
                        onChange={(e) => setProdForm({ ...prodForm, packSize: e.target.value })}
                        placeholder="e.g. 1 Litre Tetra / 500g"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Inner Bundle Size</label>
                      <input
                        type="text"
                        value={prodForm.bundleSize}
                        onChange={(e) => setProdForm({ ...prodForm, bundleSize: e.target.value })}
                        placeholder="e.g. 6 Packs Shrink Wrap"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Master Case Size</label>
                      <input
                        type="text"
                        value={prodForm.caseSize}
                        onChange={(e) => setProdForm({ ...prodForm, caseSize: e.target.value })}
                        placeholder="e.g. 12 Units / Master Case"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-400 dark:border-amber-800 rounded-xl font-bold text-brand-900 dark:text-amber-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Product Photos (Max 3 Photos, Cloudinary CDN Storage, Max 2MB per Photo) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-amber-500" />
                      <span>Product Photos ({(prodForm.images || []).length}/3)</span>
                    </label>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                      Max 3 Photos • Max 2MB each
                    </span>
                  </div>

                  {/* 3 Photos Grid Slots */}
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((slotIdx) => {
                      const imgUrl = (prodForm.images || [])[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          className={`relative rounded-2xl border aspect-square overflow-hidden flex flex-col items-center justify-center p-1.5 transition-all ${
                            imgUrl
                              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm'
                              : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800'
                          }`}
                        >
                          {imgUrl ? (
                            <>
                              <img
                                src={imgUrl}
                                alt={`Product slot ${slotIdx + 1}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              {/* Slot Tag Badge */}
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-950/80 text-white backdrop-blur-xs">
                                {slotIdx === 0 ? '★ Cover' : `Photo ${slotIdx + 1}`}
                              </span>

                              {/* Delete Photo Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveProductImage(slotIdx)}
                                className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-transform hover:scale-110"
                                title="Remove this photo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-950/20 rounded-xl transition-colors">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/jpg"
                                onChange={handleProductImageFile}
                                disabled={isImageUploading}
                                className="hidden"
                              />
                              <div className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-1">
                                <Plus className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">
                                {slotIdx === 0 ? '+ Cover Photo' : `+ Photo ${slotIdx + 1}`}
                              </span>
                              <span className="text-[8px] text-slate-400">Max 2MB</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Upload Dropzone / Action Bar */}
                  {(prodForm.images || []).length < 3 ? (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-amber-500/40 hover:border-amber-500 dark:border-amber-500/30 dark:hover:border-amber-500 rounded-2xl cursor-pointer bg-white/60 dark:bg-slate-900/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all text-center group">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/jpg"
                        onChange={handleProductImageFile}
                        disabled={isImageUploading}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                        {isImageUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading & Optimizing on Cloudinary CDN ({uploadProgress}%)...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Click to Upload Photo to Cloudinary (Slot {(prodForm.images || []).length + 1} of 3)</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        PNG, JPG, WEBP • Max 2MB per photo • Stored on Cloudinary CDN
                      </span>
                    </label>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Maximum 3 product photos uploaded & active on Cloudinary CDN</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">3 / 3 Photos</span>
                    </div>
                  )}
                </div>

                {/* 5. Product Description & Specifications */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Product Overview & Specifications
                  </label>
                  <textarea
                    rows={2}
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    placeholder="Enter sourcing specifications, shelf life, storage instructions, or institutional wholesale highlights..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                {/* 6. Display Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={prodForm.isFeatured}
                      onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span>⭐ Featured on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={prodForm.isNew}
                      onChange={(e) => setProdForm({ ...prodForm, isNew: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span>✨ Mark as New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={prodForm.isNrp || false}
                      onChange={(e) => setProdForm({ ...prodForm, isNrp: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-rose-600 dark:text-rose-400 font-extrabold">🚫 NRP (No Return Policy)</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProduct('Draft')}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProduct('Published')}
                    className="flex-1 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow-lg transition-colors"
                  >
                    {editingProduct ? 'Update Product' : 'Publish to Catalog'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Salesman Modal with Custom Password Creation */}
      <AnimatePresence>
        {isAddSalesmanOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">Create Field Salesman Account</h3>
                    <p className="text-[11px] text-slate-400">Configure representative profile and set initial login password</p>
                  </div>
                </div>
                <button onClick={() => setIsAddSalesmanOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSalesman} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Salesman ID</label>
                    <input
                      type="text"
                      required
                      value={salesmanForm.id}
                      onChange={(e) => setSalesmanForm({ ...salesmanForm, id: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-mono font-bold"
                      placeholder="AE-SM-004"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={salesmanForm.name}
                      onChange={(e) => setSalesmanForm({ ...salesmanForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-semibold"
                      placeholder="Amit Shukla"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={salesmanForm.phone}
                      onChange={(e) => setSalesmanForm({ ...salesmanForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-semibold"
                      placeholder="+91 88876 83782"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={salesmanForm.email}
                      onChange={(e) => setSalesmanForm({ ...salesmanForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-semibold"
                      placeholder="amit.shukla@anujenterprises.demo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Assigned Territory / Hub</label>
                  <select
                    value={salesmanForm.region}
                    onChange={(e) => setSalesmanForm({ ...salesmanForm, region: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-bold"
                  >
                    <option value="Central UP (Kanpur HQ)">Central UP (Kanpur HQ Central Hub)</option>
                    <option value="East UP (Varanasi & Gorakhpur Hub)">East UP (Varanasi & Gorakhpur Hub)</option>
                    <option value="West UP (Agra & Meerut Hub)">West UP (Agra & Meerut Hub)</option>
                    <option value="Lucknow Capital Zone">Lucknow Capital Zone</option>
                    <option value="Bundelkhand Region (Jhansi Hub)">Bundelkhand Region (Jhansi Hub)</option>
                  </select>
                </div>

                {/* Salesman Password Configuration Field */}
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> Set Salesman Login Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPwd = `AE${Math.floor(1000 + Math.random() * 9000)}@2026`;
                        setSalesmanForm({ ...salesmanForm, password: randomPwd });
                      }}
                      className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" /> Auto-Generate
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={salesmanForm.password}
                    onChange={(e) => setSalesmanForm({ ...salesmanForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-amber-500/40 rounded-xl font-mono font-bold text-slate-900 dark:text-amber-300"
                    placeholder="Enter custom password (e.g. Sales@123)"
                  />

                  {/* Fast Presets */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold">Quick Presets:</span>
                    {['Sales@123', 'Kanpur@2026', 'Anuj@2026', 'Field@2026'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSalesmanForm({ ...salesmanForm, password: preset })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          salesmanForm.password === preset
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddSalesmanOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow-lg"
                  >
                    Create & Issue Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dedicated Set / Reset Salesman Password Modal for Existing Accounts */}
      <AnimatePresence>
        {salesmanPasswordTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">Change Salesman Password</h3>
                    <p className="text-[11px] text-slate-400">{salesmanPasswordTarget.name} ({salesmanPasswordTarget.id})</p>
                  </div>
                </div>
                <button onClick={() => setSalesmanPasswordTarget(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSetSalesmanPassword} className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Representative:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{salesmanPasswordTarget.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Salesman ID:</span>
                    <span className="font-mono font-bold text-brand-900 dark:text-brand-400">{salesmanPasswordTarget.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Password:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{salesmanPasswordTarget.password || 'Sales@123'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-black uppercase text-slate-700 dark:text-slate-300">
                      New Custom Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPwd = `AE${Math.floor(1000 + Math.random() * 9000)}@2026`;
                        setCustomSalesmanPassword(randomPwd);
                      }}
                      className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" /> Auto-Generate
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={customSalesmanPassword}
                    onChange={(e) => setCustomSalesmanPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-amber-500/50 rounded-xl font-mono font-bold text-slate-900 dark:text-amber-300"
                    placeholder="Enter new password (e.g. Kanpur@2026)"
                  />

                  {/* Fast Presets */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold">Presets:</span>
                    {['Sales@123', 'Kanpur@2026', 'Anuj@2026', 'Field@2026'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCustomSalesmanPassword(preset)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          customSalesmanPassword === preset
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSalesmanPasswordTarget(null)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow-lg"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Salesman Confirmation Modal */}
      <AnimatePresence>
        {salesmanToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/50 p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Salesman ID?</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Representative:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{salesmanToDelete.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Salesman ID:</span>
                  <span className="font-mono font-bold text-brand-900 dark:text-amber-400">{salesmanToDelete.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Territory:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{salesmanToDelete.region}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to permanently delete this salesman account from the active field roster?
              </p>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSalesmanToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteSalesman(salesmanToDelete.id);
                    setSalesmanToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Registered Customer Modal */}
      <AnimatePresence>
        {isAddCustomerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">
                      {editingCustomer ? 'Edit Registered Customer Details' : 'Register New Customer / User Account'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Retail store, wholesale buyer, or direct consumer account</p>
                  </div>
                </div>
                <button onClick={() => setIsAddCustomerOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomerSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Store / Customer / Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={custForm.name}
                    onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                    placeholder="e.g. Mahavir Super Market / Rakesh Gupta"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={custForm.mobile}
                      onChange={(e) => setCustForm({ ...custForm, mobile: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={custForm.email}
                      onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                      placeholder="customer@example.com"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      City / Mandi
                    </label>
                    <input
                      type="text"
                      value={custForm.city}
                      onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                      placeholder="Kanpur"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={custForm.state}
                      onChange={(e) => setCustForm({ ...custForm, state: e.target.value })}
                      placeholder="Uttar Pradesh"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    value={custForm.address}
                    onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
                    placeholder="Shop No., Market Road, Landmark, Kanpur..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Customer Classification
                    </label>
                    <select
                      value={custForm.classification}
                      onChange={(e) => setCustForm({ ...custForm, classification: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    >
                      <option value="NORMAL">NORMAL (Standard Verified)</option>
                      <option value="DAMAGE">DAMAGE (Return / Claims Account)</option>
                      <option value="EXPIRY">EXPIRY (Stock Replacements Account)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Account Password
                    </label>
                    <input
                      type="text"
                      value={custForm.password}
                      onChange={(e) => setCustForm({ ...custForm, password: e.target.value })}
                      placeholder="Cust@123"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow transition-colors"
                  >
                    {editingCustomer ? 'Update Customer Record' : 'Save Customer to Database'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AdminPasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
};
