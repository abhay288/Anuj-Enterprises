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
  BookOpen, FileCheck, HelpCircle, PauseCircle, PlayCircle, Trophy, Flame, Crown, Medal, Target,
  Truck, MessageSquare, Send, ExternalLink, LifeBuoy, Headphones, PhoneCall, CheckCircle,
  ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Filter, Building2, Globe, Loader2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { useApp, normalizeBrandName } from '../../context/AppContext';
import { analyticsService } from '../../services/analyticsService';
import { inventoryService } from '../../services/inventoryService';
import { AdminPasswordModal } from './AdminPasswordModal';
import { WhatsAppDeliveryModal } from './WhatsAppDeliveryModal';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { 
  exportOrdersCSV, 
  exportProductsCSV, 
  exportSalesmenCSV, 
  exportInventoryReportCSV,
  exportCustomersCSV
} from '../../utils/csvExportUtils';
import { 
  UNIT_TYPES, 
  validatePackagingInputs, 
  getPackagingLevels, 
  formatPackagingSummary,
  getProductImageUrl 
} from '../../utils/packagingUtils';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { orderService } from '../../services/orderService';
import { invoiceService } from '../../services/invoiceService';
import { settingService } from '../../services/settingService';

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
    refreshCustomers,
    updateOrderStatus,
    supportTickets,
    submitSupportTicket,
    updateTicketStatus,
    deleteSupportTicket,
    setBrandTopRank,
    moveBrandRank,
    updateBrandRank,
    moveBrandToExtreme,
    autoRankByProductCount,
    resetBrandRanks,
    moveProductRank,
    updateProductRank,
    moveProductToExtreme,
    resetProductRanks,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    duplicateProduct,
    toggleProductFeatured,
    toggleProductNew,
    toggleProductNrp,
    toggleProductStatus,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    toggleSalesmanStatus,
    resetSalesmanPassword,
    addCategory,
    updateCategory,
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
    deliverySchedules,
    addCustomerDeliveryDate,
    removeCustomerDeliveryDate,
    setCustomerDeliveryDates,
    bulkSetAreaDeliveryDates,
    createAdminInvoice,
    navigateTo,
    logout, 
    showToast,
    user,
    toggleOrderUrgent,
    deleteOrderFromAdmin,
    deleteInvoiceFromAdmin,
    refreshOrders
  } = useApp();

  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const [togglingUrgentId, setTogglingUrgentId] = useState(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);

  const passwordAgeDays = user?.passwordAgeDays ?? (
    user?.passwordChangedAt 
      ? Math.floor((new Date().getTime() - new Date(user.passwordChangedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0
  );
  const isPasswordOld = Boolean(user?.isPasswordOld || passwordAgeDays >= 30);

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = sessionStorage.getItem('anuj_admin_active_tab');
      if (saved && saved !== 'reports') return saved;
    } catch (e) {}
    return 'analytics';
  });

  useEffect(() => {
    try {
      if (activeTab && activeTab !== 'reports') {
        sessionStorage.setItem('anuj_admin_active_tab', activeTab);
      }
    } catch (e) {}
  }, [activeTab]);
  const [selectedOrderForDeliveryModal, setSelectedOrderForDeliveryModal] = useState(null);
  // Category inline editing state
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  // Delete confirmation modals
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState(null); // order object or null
  // Local read state (optimistic, synced from orders/invoices)
  const [orderReadState, setOrderReadState] = useState({});
  const [invoiceReadState, setInvoiceReadState] = useState({});
  // Retention settings
  const [retentionSettings, setRetentionSettings] = useState({ orderRetentionDays: 0 });
  const [retentionSaving, setRetentionSaving] = useState(false);
  const [isRefreshingCustomers, setIsRefreshingCustomers] = useState(false);

  useEffect(() => {
    settingService.getSettings().then(res => {
      if (res?.data?.orderRetentionDays !== undefined) {
        setRetentionSettings({ orderRetentionDays: Number(res.data.orderRetentionDays) });
      }
    }).catch(() => {});
  }, []);

  // Admin Direct Invoice Generation State
  const [isAdminCreateInvoiceOpen, setIsAdminCreateInvoiceOpen] = useState(false);
  const [adminInvoiceForm, setAdminInvoiceForm] = useState({
    selectedCustId: '',
    customerName: '',
    customerEmail: '',
    customerMobile: '',
    customerAddress: '',
    customerCity: 'Kanpur',
    customerState: 'Uttar Pradesh',
    salesmanId: '',
    description: '',
    isPriority: false,
    items: []
  });

  const [invoiceSelectedProdId, setInvoiceSelectedProdId] = useState('');
  const [invoiceItemQty, setInvoiceItemQty] = useState(1);
  const [invoiceItemPack, setInvoiceItemPack] = useState('Piece');
  const [invoiceItemPrice, setInvoiceItemPrice] = useState(0);

  const resetAdminInvoiceForm = () => {
    setAdminInvoiceForm({
      selectedCustId: '',
      customerName: '',
      customerEmail: '',
      customerMobile: '',
      customerAddress: '',
      customerCity: 'Kanpur',
      customerState: 'Uttar Pradesh',
      salesmanId: salesmen[0]?.id || 'AE-SM-001',
      description: '',
      isPriority: false,
      items: []
    });
    setInvoiceSelectedProdId('');
    setInvoiceItemQty(1);
    setInvoiceItemPack('Piece');
    setInvoiceItemPrice(0);
  };

  const handleAdminInvoiceCustSelect = (custId) => {
    const selectedCust = (customers || []).find(c => (c.id === custId || c.customerId === custId));
    if (selectedCust) {
      setAdminInvoiceForm(prev => ({
        ...prev,
        selectedCustId: custId,
        customerName: selectedCust.name || selectedCust.shopName || '',
        customerEmail: selectedCust.email || '',
        customerMobile: (selectedCust.mobile || selectedCust.phone || '').replace('+91', '').trim(),
        customerAddress: selectedCust.address || '',
        customerCity: selectedCust.city || 'Kanpur',
        customerState: selectedCust.state || 'Uttar Pradesh'
      }));
    } else {
      setAdminInvoiceForm(prev => ({
        ...prev,
        selectedCustId: ''
      }));
    }
  };

  const handleAddInvoiceLineItem = () => {
    if (!invoiceSelectedProdId) {
      showToast('Please select a product item from catalog', 'warning');
      return;
    }
    const targetProd = (products || []).find(p => p.id === invoiceSelectedProdId);
    if (!targetProd) return;

    const itemPrice = Number(invoiceItemPrice) || Number(targetProd.price) || 0;
    const itemQty = Math.max(1, Number(invoiceItemQty) || 1);

    const newLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: targetProd.id,
      sku: targetProd.sku || `SKU-${targetProd.id}`,
      name: targetProd.name,
      productName: targetProd.name,
      qty: itemQty,
      quantity: itemQty,
      price: itemPrice,
      unitPrice: itemPrice,
      packSize: invoiceItemPack || targetProd.packSize || 'Piece',
      total: itemPrice * itemQty
    };

    setAdminInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, newLineItem]
    }));

    setInvoiceSelectedProdId('');
    setInvoiceItemQty(1);
    setInvoiceItemPack('Piece');
    setInvoiceItemPrice(0);
  };

  const handleRemoveInvoiceLineItem = (lineId) => {
    setAdminInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== lineId)
    }));
  };

  const handleAdminCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!adminInvoiceForm.customerName.trim()) {
      showToast('Please enter or select a customer / store name', 'warning');
      return;
    }
    if (!adminInvoiceForm.items || adminInvoiceForm.items.length === 0) {
      showToast('Please add at least one product line item to the invoice', 'warning');
      return;
    }

    const selectedSalesmanObj = (salesmen || []).find(s => s.id === adminInvoiceForm.salesmanId);
    const selectedCustObj = (customers || []).find(c => c.id === adminInvoiceForm.selectedCustId || c.customerId === adminInvoiceForm.selectedCustId);
    const safeCustId = adminInvoiceForm.selectedCustId || selectedCustObj?.customerId || selectedCustObj?.id || `CUST-${Date.now()}`;

    const payload = {
      items: adminInvoiceForm.items.map(item => ({
        productId: item.productId,
        sku: item.sku,
        productName: item.name,
        name: item.name,
        quantity: Number(item.qty),
        qty: Number(item.qty),
        price: Number(item.price),
        unitPrice: Number(item.price),
        packSize: item.packSize,
        isPriority: Boolean(adminInvoiceForm.isPriority)
      })),
      customerMode: 'REGISTERED',
      customerId: safeCustId,
      customerName: adminInvoiceForm.customerName.trim(),
      customerEmail: adminInvoiceForm.customerEmail.trim(),
      customerMobile: adminInvoiceForm.customerMobile.trim(),
      customerAddress: adminInvoiceForm.customerAddress.trim(),
      customerCity: adminInvoiceForm.customerCity.trim() || 'Kanpur',
      customerState: adminInvoiceForm.customerState.trim() || 'Uttar Pradesh',
      salesmanId: adminInvoiceForm.salesmanId || 'AE-SM-001',
      salesmanName: selectedSalesmanObj ? selectedSalesmanObj.name : 'Central Kanpur HQ',
      description: adminInvoiceForm.description ? adminInvoiceForm.description.trim() : '',
      generatedByRole: 'admin',
      generatedByName: 'Mr. Anuj Sharma',
      generatedById: 'AE-ADMIN-001',
      isPriority: Boolean(adminInvoiceForm.isPriority)
    };

    await createAdminInvoice(payload);
    setIsAdminCreateInvoiceOpen(false);
    resetAdminInvoiceForm();
  };

  // Delivery Route & Area Schedule Management State
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState('');
  const [scheduleCityFilter, setScheduleCityFilter] = useState('ALL');
  const [scheduleAreaFilter, setScheduleAreaFilter] = useState('ALL');
  const [scheduleRouteFilter, setScheduleRouteFilter] = useState('ALL');
  const [scheduleDateFilter, setScheduleDateFilter] = useState(''); // specific date filter
  
  // Single Customer Schedule Edit Modal
  const [selectedCustForSchedule, setSelectedCustForSchedule] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [custScheduleDateInputs, setCustScheduleDateInputs] = useState([]);
  const [singleNewDateInput, setSingleNewDateInput] = useState('');

  // Bulk Area Scheduler Modal
  const [isBulkScheduleModalOpen, setIsBulkScheduleModalOpen] = useState(false);
  const [bulkTargetArea, setBulkTargetArea] = useState('');
  const [bulkDatesList, setBulkDatesList] = useState([]);
  const [bulkNewDateInput, setBulkNewDateInput] = useState('');

  // Helper date functions
  const formatScheduleDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getDaysUntilDelivery = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleOpenScheduleModal = (cust) => {
    const cId = cust.customerId || cust.id;
    const existing = deliverySchedules?.[cId] || deliverySchedules?.[cust.customerId] || deliverySchedules?.[cust.id] || [];
    setSelectedCustForSchedule(cust);
    setCustScheduleDateInputs([...existing]);
    setSingleNewDateInput('');
    setIsScheduleModalOpen(true);
  };

  const handleSaveCustomerSchedule = (e) => {
    e.preventDefault();
    if (!selectedCustForSchedule) return;
    const cId = selectedCustForSchedule.customerId || selectedCustForSchedule.id;
    setCustomerDeliveryDates(cId, custScheduleDateInputs);
    setIsScheduleModalOpen(false);
    setSelectedCustForSchedule(null);
  };

  const handleAddDateToCustomer = () => {
    if (!singleNewDateInput) return;
    if (custScheduleDateInputs.includes(singleNewDateInput)) {
      showToast('Date already added in schedule', 'warning');
      return;
    }
    setCustScheduleDateInputs(prev => [...prev, singleNewDateInput].sort());
    setSingleNewDateInput('');
  };

  const handleRemoveDateFromCustomer = (dateToRemove) => {
    setCustScheduleDateInputs(prev => prev.filter(d => d !== dateToRemove));
  };

  const handleOpenBulkScheduler = () => {
    setBulkTargetArea('');
    setBulkDatesList([]);
    setBulkNewDateInput('');
    setIsBulkScheduleModalOpen(true);
  };

  const handleAddBulkDate = () => {
    if (!bulkNewDateInput) return;
    if (bulkDatesList.includes(bulkNewDateInput)) {
      showToast('Date already in list', 'warning');
      return;
    }
    setBulkDatesList(prev => [...prev, bulkNewDateInput].sort());
    setBulkNewDateInput('');
  };

  const handleSaveBulkSchedule = (e) => {
    e.preventDefault();
    if (!bulkTargetArea.trim()) {
      showToast('Please select or enter an Area or City', 'warning');
      return;
    }
    if (bulkDatesList.length === 0) {
      showToast('Please add at least one delivery date', 'warning');
      return;
    }
    bulkSetAreaDeliveryDates(bulkTargetArea.trim(), bulkDatesList);
    setIsBulkScheduleModalOpen(false);
  };

  // Priority Support Tickets State
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'URGENT'
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState('ALL');
  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState(null);
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);
  const [newAdminTicketForm, setNewAdminTicketForm] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Order Dispatch & Tracking',
    priority: 'HIGH',
    message: ''
  });
  const [adminResolutionNote, setAdminResolutionNote] = useState('');
  
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
    pincode: '208021',
    classification: 'NORMAL',
    adminTag: 'No Tag',
    password: ''
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
  const [newCompanyPlacement, setNewCompanyPlacement] = useState('end'); // 'top' | 'end'
  const [newCompanyCountry, setNewCompanyCountry] = useState('India');
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [brandFilterMode, setBrandFilterMode] = useState('all'); // 'all' | 'podium' | 'with_products' | 'zero_products'
  const [expandedBrandProducts, setExpandedBrandProducts] = useState(null); // brand name or null
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerClassificationFilter, setCustomerClassificationFilter] = useState('ALL');

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
    unitType: 'Piece',
    unitQuantity: '',
    packSize: '',
    bundleSize: '',
    malaSize: '',
    boriSize: '',
    caseSize: '',
    cartonSize: '',
    customPackaging: '',
    isFeatured: true,
    isNew: true,
    isNrp: false,
    status: 'Published',
    image: '',
    images: [],
    description: 'High-margin enterprise B2B product item.'
  });

  // Salesman Form State
  const [salesmanForm, setSalesmanForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    region: 'Central UP (Kanpur HQ)'
  });

  const [salesmanPasswordTarget, setSalesmanPasswordTarget] = useState(null);
  const [customSalesmanPassword, setCustomSalesmanPassword] = useState('');
  const [salesmanToDelete, setSalesmanToDelete] = useState(null);

  // Cloudinary Image Upload State (Max 5 Photos, Max 6MB per photo)
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleProductImageFile = async (e) => {
    const inputEl = e.target;
    const files = Array.from(inputEl?.files || []);
    if (!files.length) return;

    const currentImages = (prodForm.images && prodForm.images.length > 0) 
      ? prodForm.images 
      : (prodForm.image ? [prodForm.image] : []);
    
    // 1. Strict 5 Photos Boundation
    if (currentImages.length >= 5) {
      showToast('Maximum 5 photos allowed per product. Please delete or replace a photo.', 'warning');
      if (inputEl) inputEl.value = '';
      return;
    }

    const availableSlots = 5 - currentImages.length;
    const filesToUpload = files.slice(0, availableSlots);

    // 2. Validation
    const MAX_SIZE_BYTES = 6 * 1024 * 1024; // 6 MB max before client optimization
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        showToast(`"${file.name}" is not a valid image. Please select PNG, JPG, or WEBP.`, 'error');
        if (inputEl) inputEl.value = '';
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        showToast(`"${file.name}" is ${sizeMb}MB! Maximum allowed size is 6MB. Please select a smaller file.`, 'error');
        if (inputEl) inputEl.value = '';
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
        const combined = [...currentImages, ...uploadedUrls].slice(0, 5);
        setProdForm(prev => ({
          ...prev,
          images: combined,
          image: combined[0] || prev.image
        }));
        showToast(`${uploadedUrls.length} photo(s) uploaded successfully!`, 'success');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.message || 'Upload error. Please check your image.', 'error');
    } finally {
      setIsImageUploading(false);
      setUploadProgress(0);
      if (inputEl) inputEl.value = '';
    }
  };

  const handleReplaceProductImage = async (slotIdx, e) => {
    const inputEl = e.target;
    const files = Array.from(inputEl?.files || []);
    if (!files.length) return;

    const file = files[0];
    const MAX_SIZE_BYTES = 6 * 1024 * 1024;
    if (!file.type.startsWith('image/')) {
      showToast(`"${file.name}" is not a valid image. Please select PNG, JPG, or WEBP.`, 'error');
      if (inputEl) inputEl.value = '';
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      showToast(`"${file.name}" is ${sizeMb}MB! Maximum allowed size is 6MB.`, 'error');
      if (inputEl) inputEl.value = '';
      return;
    }

    setIsImageUploading(true);
    setUploadProgress(25);

    try {
      const res = await uploadToCloudinary(file, (prog) => setUploadProgress(prog));
      if (res?.url) {
        setProdForm(prev => {
          const currentImages = [...(prev.images && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []))];
          currentImages[slotIdx] = res.url;
          return {
            ...prev,
            images: currentImages,
            image: currentImages[0] || res.url
          };
        });
        showToast(`Photo ${slotIdx + 1} replaced successfully!`, 'success');
      }
    } catch (err) {
      console.error('Photo replacement error:', err);
      showToast(err.message || 'Error replacing photo.', 'error');
    } finally {
      setIsImageUploading(false);
      setUploadProgress(0);
      if (inputEl) inputEl.value = '';
    }
  };

  const handleRemoveProductImage = (indexToRemove) => {
    const currentImages = (prodForm.images && prodForm.images.length > 0)
      ? prodForm.images
      : (prodForm.image ? [prodForm.image] : []);
    const filtered = currentImages.filter((_, idx) => idx !== indexToRemove);
    setProdForm(prev => ({
      ...prev,
      images: filtered,
      image: filtered[0] || ''
    }));
    showToast('Photo removed', 'info');
  };

  const handleMoveProductImage = (fromIdx, toIdx) => {
    const currentImages = [...(prodForm.images && prodForm.images.length > 0 ? prodForm.images : (prodForm.image ? [prodForm.image] : []))];
    if (fromIdx < 0 || fromIdx >= currentImages.length || toIdx < 0 || toIdx >= currentImages.length) return;
    const [moved] = currentImages.splice(fromIdx, 1);
    currentImages.splice(toIdx, 0, moved);
    setProdForm(prev => ({
      ...prev,
      images: currentImages,
      image: currentImages[0] || ''
    }));
    showToast(`Photo moved to position ${toIdx + 1}`, 'info');
  };

  const [prodSearch, setProdSearch] = useState('');

  const orderedAdminProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const ordA = (typeof a.sortOrder === 'number' && a.sortOrder > 0) ? a.sortOrder : 999999;
        const ordB = (typeof b.sortOrder === 'number' && b.sortOrder > 0) ? b.sortOrder : 999999;
        if (ordA !== ordB) return ordA - ordB;
        return (a.name || '').localeCompare(b.name || '');
      })
      .filter(p => {
        if (!prodSearch) return true;
        const q = prodSearch.toLowerCase().trim();
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.company && p.company.toLowerCase().includes(q))
        );
      });
  }, [products, prodSearch]);
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

  // Always refresh customer directory and orders on AdminDashboard mount
  useEffect(() => {
    if (refreshCustomers) refreshCustomers();
  }, [refreshCustomers]);

  useEffect(() => {
    if (activeTab === 'customers' && refreshCustomers) {
      refreshCustomers();
    }
  }, [activeTab, refreshCustomers]);

  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    return list.filter(c => {
      if (!c) return false;
      if (!customerSearch || !customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase().trim();
      const name = String(c.name || '').toLowerCase();
      const email = String(c.email || '').toLowerCase();
      const mobile = String(c.mobile || c.phone || '');
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

  // Processed Brands for Catalogue Priority Engine
  const processedBrands = useMemo(() => {
    let list = (brands || []).map((b, idx) => {
      const brandName = typeof b === 'string' ? b : (b.name || `Brand ${idx + 1}`);
      const brandId = (typeof b === 'object' && (b.id || b._id)) || brandName;
      const rank = (typeof b === 'object' && typeof b.rank === 'number' && b.rank > 0) ? b.rank : (idx + 1);
      const brandNorm = normalizeBrandName(brandName);
      const matchingProducts = products.filter(p => normalizeBrandName(p.brand) === brandNorm);
      const country = (typeof b === 'object' && b.country) ? b.country : 'India';
      const logo = (typeof b === 'object' && b.logo) ? b.logo : '';
      return {
        ...((typeof b === 'object') ? b : {}),
        raw: b,
        id: brandId,
        name: brandName,
        norm: brandNorm,
        rank,
        productCount: matchingProducts.length,
        products: matchingProducts,
        country,
        logo
      };
    }).sort((a, b) => (a.rank || 999) - (b.rank || 999));

    if (brandSearchTerm.trim()) {
      const q = normalizeBrandName(brandSearchTerm);
      list = list.filter(b => b.norm.includes(q) || normalizeBrandName(b.country).includes(q));
    }

    if (brandFilterMode === 'podium') {
      list = list.filter(b => b.rank <= 3);
    } else if (brandFilterMode === 'with_products') {
      list = list.filter(b => b.productCount > 0);
    } else if (brandFilterMode === 'zero_products') {
      list = list.filter(b => b.productCount === 0);
    }

    return list;
  }, [brands, products, brandSearchTerm, brandFilterMode]);

  const topRankedBrand = useMemo(() => {
    if (!brands || brands.length === 0) return null;
    const sorted = [...brands].sort((a, b) => {
      const aRank = (typeof a === 'object' && typeof a.rank === 'number') ? a.rank : 999;
      const bRank = (typeof b === 'object' && typeof b.rank === 'number') ? b.rank : 999;
      return aRank - bRank;
    });
    const top = sorted[0];
    const topName = typeof top === 'object' ? top.name : top;
    const productCount = products.filter(p => normalizeBrandName(p.brand) === normalizeBrandName(topName)).length;
    return { name: topName, productCount, rank: 1 };
  }, [brands, products]);

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

  const handleAddCategory = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const val = (newCategoryInput || '').trim();
    if (!val) {
      showToast('Please enter a category name', 'warning');
      return;
    }
    addCategory(val);
    setNewCategoryInput('');
  };

  const handleAddCompany = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const val = (newCompanyInput || '').trim();
    if (!val) {
      showToast('Please enter a company / brand name', 'warning');
      return;
    }
    addBrand({ name: val, country: newCompanyCountry || 'India' }, newCompanyPlacement === 'top');
    setNewCompanyInput('');
  };

  const handleSaveProduct = async (statusOverride = null) => {
    // 1. Validate packaging inputs
    const valResult = validatePackagingInputs(prodForm);
    if (!valResult.isValid) {
      showToast(valResult.message, 'warning');
      return;
    }

    const finalImages = (prodForm.images && prodForm.images.length > 0 ? prodForm.images : [prodForm.image]).filter(Boolean).slice(0, 5);
    const finalForm = {
      ...prodForm,
      image: finalImages[0] || '',
      gallery: finalImages,
      images: finalImages,
      status: statusOverride || prodForm.status
    };

    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...finalForm });
        setEditingProduct(null);
      } else {
        await addProduct(finalForm);
      }
      setIsAddProductOpen(false);
    } catch (err) {
      // Keep form open so admin doesn't lose modifications
      console.warn('Product save deferred due to error:', err?.message || err);
    }
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    const productImages = (product.gallery && product.gallery.length > 0 
      ? product.gallery 
      : (product.images && product.images.length > 0 ? product.images : [product.image])
    ).filter(Boolean).slice(0, 5);

    setProdForm({
      name: product.name || '',
      brand: product.brand || 'Amul',
      category: product.category || 'Food & Beverages',
      sku: product.sku || '',
      hsn: product.hsn || '19053100',
      price: product.price || 0,
      stock: product.stock ?? 100,
      lowStockThreshold: product.lowStockThreshold || 20,
      unitType: product.unitType || 'Piece',
      unitQuantity: product.unitQuantity || product.unitDetail || '',
      packSize: product.packSize || '',
      bundleSize: product.bundleSize || '',
      malaSize: product.malaSize || '',
      boriSize: product.boriSize || '',
      caseSize: product.caseSize || '',
      cartonSize: product.cartonSize || '',
      customPackaging: product.customPackaging || '',
      isFeatured: product.isFeatured ?? true,
      isNew: product.isNew ?? false,
      isNrp: product.isNrp ?? false,
      status: product.status || 'Published',
      image: productImages[0] || '',
      images: productImages,
      description: product.description || ''
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

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustForm({
      name: '',
      mobile: '',
      email: '',
      address: '',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      pincode: '208021',
      classification: 'NORMAL',
      adminTag: 'No Tag',
      password: 'Cust@123'
    });
    setIsAddCustomerOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setCustForm({
      name: customer.name || customer.shopName || '',
      mobile: customer.mobile || customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || 'Kanpur',
      state: customer.state || 'Uttar Pradesh',
      pincode: customer.pincode || '208021',
      classification: customer.classification || 'NORMAL',
      adminTag: customer.adminTag || 'No Tag',
      password: customer.password || 'Cust@123'
    });
    setIsAddCustomerOpen(true);
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
      pincode: '208021',
      classification: 'NORMAL',
      adminTag: 'No Tag',
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

        {/* 30-Day Admin Password Rotation Security Reminder Banner */}
        {isPasswordOld && (
          <div className="mb-6 bg-gradient-to-r from-amber-950/80 via-rose-950/80 to-amber-950/80 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur animate-pulse">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0 mt-0.5 shadow-md">
                <AlertCircle className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 text-sm tracking-wide uppercase">
                    Security Warning: Password Rotation Due
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider">
                    {passwordAgeDays} Days Old
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
                  Your administrator password was last updated {passwordAgeDays} days ago. For high enterprise security standards and regulatory compliance, administrative credentials must be refreshed every 30 days.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center cursor-pointer"
            >
              <Key className="w-4 h-4 text-slate-950" />
              <span>Change Password Now</span>
            </button>
          </div>
        )}

        {/* Layout Grid: Sidebar Navigation + Main Panel (Optimized for Mobile, Tablet & Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start relative">
          
          {/* Left Sidebar Navigation (Sticky & Independent Scroll on Tablet & Desktop) */}
          <aside className="md:col-span-4 lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm md:sticky md:top-28 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto space-y-1 self-start z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2 block">
              BI Modules
            </span>

            {[
              { id: 'analytics', label: 'Executive Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders & Invoices', icon: ShoppingBag },
              { id: 'schedules', label: 'Delivery Routes & Schedules', icon: Truck },
              { 
                id: 'tickets', 
                label: 'Priority Support Tickets', 
                icon: LifeBuoy, 
                badge: (supportTickets || []).filter(t => t.status === 'OPEN').length 
              },
              { id: 'customers', label: 'Registered Customers / Users', icon: UserCheck },
              { id: 'announcement', label: 'Floating Headline Bar', icon: Megaphone },
              { id: 'policies', label: 'Legal Policies Editor', icon: Scale },
              { id: 'products', label: 'Products Master (CRUD)', icon: Package },
              { id: 'salesmen', label: 'Sales Force Roster', icon: Users },
              { id: 'categories', label: 'Categories & Brands', icon: Layers }
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
                  className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-brand-900 text-white dark:bg-brand-600 shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Right Main Content Area (Scrolls Independently) */}
          <main className="md:col-span-8 lg:col-span-9 space-y-6 min-w-0">
            
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

                {/* Executive Analytics Date Filtering Toolbar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
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
                      onClick={() => {
                        setEditingProduct(null);
                        setProdForm({
                          name: '', brand: brands[0]?.name || 'Amul', category: categories[0]?.name || 'Food & Beverages',
                          sku: '', hsn: '19053100', price: 1200, stock: 100, lowStockThreshold: 20,
                          unitType: 'Piece', unitQuantity: '',
                          packSize: '', bundleSize: '', malaSize: '', boriSize: '', caseSize: '', cartonSize: '', customPackaging: '',
                          isFeatured: true, isNew: true, isNrp: false, status: 'Published',
                          image: '',
                          images: [],
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
                        <th className="py-3 px-4">Packaging & Unit Info</th>
                        <th className="py-3 px-4 text-center">Badges</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orderedAdminProducts.map((prod) => {
                        return (
                          <tr key={prod.id || prod._id || prod.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={getProductImageUrl(prod)} 
                                  alt={prod.name} 
                                  className="w-10 h-10 object-contain bg-slate-50 rounded-lg border shrink-0" 
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80';
                                  }}
                                />
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">{prod.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold">{prod.brand}</td>
                            <td className="py-3 px-4 text-[10px] text-slate-500">
                              {getPackagingLevels(prod).length > 0 ? (
                                <div className="space-y-0.5 max-w-[180px]">
                                  {getPackagingLevels(prod).slice(0, 2).map((lvl) => (
                                    <div key={lvl.key} className="truncate">
                                      {lvl.label}: <strong className="text-slate-800 dark:text-slate-200">{lvl.value}</strong>
                                    </div>
                                  ))}
                                  {getPackagingLevels(prod).length > 2 && (
                                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold block">
                                      +{getPackagingLevels(prod).length - 2} more packaging levels
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No packaging set</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => toggleProductNrp(prod.id || prod._id)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${prod.isNrp ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                                title="Toggle No Return Policy (NRP)"
                              >
                                {prod.isNrp ? '🚫 NRP Active' : 'Standard Return'}
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
                              <button 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete "${prod.name}" from the catalogue? This will immediately remove it from Home and Catalogue.`)) {
                                    deleteProduct(prod);
                                  }
                                }} 
                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40" 
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
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

            {/* ================= TAB 4: ORDERS & INVOICES ================= */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
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
                    <button
                      type="button"
                      onClick={() => {
                        resetAdminInvoiceForm();
                        setIsAdminCreateInvoiceOpen(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Generate Invoice</span>
                    </button>
                  </div>

                  {/* Filter Chips for Urgent, Expired, Delivery, and Return Orders */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {[
                      { id: 'ALL', label: 'All Invoices', count: orders.length },
                      { id: 'URGENT', label: '⚡ Urgent Priority', count: orders.filter(o => o.hasUrgentItems || o.items?.some(i => i.isPriority)).length },
                      { id: 'DELIVERY', label: '🚚 Out for Delivery', count: orders.filter(o => o.status === 'OUT_FOR_DELIVERY' || o.status === 'Out For Delivery').length },
                      { id: 'DELIVERED', label: '✅ Delivered', count: orders.filter(o => o.status === 'DELIVERED' || o.status === 'Delivered').length },
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

                <div className="overflow-x-auto pb-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="min-w-[1040px] w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 min-w-[130px]">Invoice #</th>
                        <th className="py-3.5 px-4 min-w-[130px]">Date</th>
                        <th className="py-3.5 px-4 min-w-[170px]">Customer & Flags</th>
                        <th className="py-3.5 px-4 min-w-[140px]">Representative</th>
                        <th className="py-3.5 px-4 text-center min-w-[100px]">Items</th>
                        <th className="py-3.5 px-4 text-center min-w-[140px]">Status & Dispatch</th>
                        <th className="py-3.5 px-4 text-center min-w-[110px]">Special Dockets</th>
                        <th className="py-3.5 px-6 text-center min-w-[160px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders
                        .filter(o => {
                          if (orderTypeFilter === 'URGENT') return o.hasUrgentItems || o.items?.some(i => i.isPriority);
                          if (orderTypeFilter === 'DELIVERY') return o.status === 'OUT_FOR_DELIVERY' || o.status === 'Out For Delivery';
                          if (orderTypeFilter === 'DELIVERED') return o.status === 'DELIVERED' || o.status === 'Delivered';
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
                          const orderStatus = order.status || 'Confirmed';
                          const isOutForDelivery = orderStatus === 'OUT_FOR_DELIVERY' || orderStatus === 'Out For Delivery';
                          const isDelivered = orderStatus === 'DELIVERED' || orderStatus === 'Delivered';

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
                              hasUrgent ? 'bg-amber-50/20 dark:bg-amber-950/10' : isOutForDelivery ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
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
                                <span className="text-[10px] text-slate-400 font-medium block">{order.customerType || 'Normal Customer'}</span>
                                {order.customerMobile && (
                                  <a 
                                    href={`tel:${order.customerMobile.replace(/\s+/g, '')}`}
                                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline inline-flex items-center gap-1 mt-0.5 hover:text-emerald-700 transition-colors"
                                    title={`Call Customer: ${order.customerMobile}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span>📞</span>
                                    <span>{order.customerMobile}</span>
                                  </a>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-medium">{order.salesmanName || order.salesmanId}</td>
                              <td className="py-3.5 px-4 text-center font-bold">
                                <div>{order.items?.length || 0} SKUs</div>
                                <span className="text-[10px] text-slate-400 font-normal">({order.totalQuantity || 0} units)</span>
                              </td>

                              {/* Order Status & Live Dispatch Selector */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex flex-col items-center gap-1">
                                  <select
                                    value={orderStatus}
                                    onChange={(e) => updateOrderStatus(order.id || order.orderId || order.invoiceNumber, e.target.value)}
                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer focus:outline-none ${
                                      isOutForDelivery
                                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm animate-pulse'
                                        : isDelivered
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300'
                                        : orderStatus === 'CANCELLED' || orderStatus === 'Cancelled'
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300'
                                        : 'bg-brand-50 text-brand-900 dark:bg-slate-800 dark:text-white border-brand-200 dark:border-slate-700'
                                    }`}
                                  >
                                    <option value="Confirmed">📋 Confirmed</option>
                                    <option value="Processing">⏳ Processing</option>
                                    <option value="OUT_FOR_DELIVERY">🚚 Out For Delivery</option>
                                    <option value="DELIVERED">✅ Delivered</option>
                                    <option value="CANCELLED">❌ Cancelled</option>
                                  </select>

                                  {isOutForDelivery && (
                                    <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase flex items-center gap-0.5">
                                      <Truck className="w-3 h-3" /> In-Transit
                                    </span>
                                  )}
                                </div>
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

                              {/* Actions: View Invoice & WhatsApp Delivery Notification */}
                              <td className="py-3.5 px-6 text-center whitespace-nowrap min-w-[160px]">
                                <div className="flex flex-col items-center justify-center gap-1.5 w-full max-w-[140px] mx-auto">
                                  {/* WhatsApp Delivery Notification Button */}
                                  <button
                                    onClick={() => setSelectedOrderForDeliveryModal(order)}
                                    className="w-full px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl font-black text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] border border-emerald-600/20"
                                    title="Notify Customer on WhatsApp for Out For Delivery"
                                  >
                                    <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
                                    <span>Notify WhatsApp</span>
                                  </button>

                                  <button
                                    onClick={() => openInvoiceModal(order)}
                                    className="w-full px-3.5 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                                    title="View Full B2B Invoice"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Invoice</span>
                                  </button>

                                  {/* Delete Order */}
                                  <button
                                    onClick={() => setDeleteOrderConfirm(order)}
                                    disabled={isDeletingOrder}
                                    className="w-full px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                                    title="Delete Order & Invoice permanently"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Del Order</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Delete Order Confirmation Modal */}
            {deleteOrderConfirm && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Delete Order & Invoice?</h3>
                      <p className="text-[11px] text-slate-500">This action cannot be undone</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-5">
                    Are you sure you want to permanently delete order <strong>{deleteOrderConfirm.orderId || deleteOrderConfirm.invoiceNumber}</strong> for <strong>{deleteOrderConfirm.customerName}</strong>? The order and its associated B2B invoice will be removed permanently, and stock will be restored automatically.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteOrderConfirm(null)}
                      disabled={isDeletingOrder}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isDeletingOrder}
                      onClick={async () => {
                        if (isDeletingOrder) return;
                        setIsDeletingOrder(true);
                        try {
                          const result = await deleteOrderFromAdmin(deleteOrderConfirm);
                          if (result.success) {
                            showToast(`Order ${deleteOrderConfirm.orderId || deleteOrderConfirm.invoiceNumber} deleted successfully`, 'success');
                            setDeleteOrderConfirm(null);
                          } else {
                            showToast('Failed to delete order: ' + (result.message || 'Unknown error'), 'error');
                          }
                        } catch (err) {
                          showToast('Failed to delete order', 'error');
                        } finally {
                          setIsDeletingOrder(false);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isDeletingOrder ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
                      ) : (
                        'Delete Permanently'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}



            {/* ================= TAB: DELIVERY ROUTE & AREA SCHEDULE MANAGEMENT ================= */}
            {activeTab === 'schedules' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                
                {/* Header & Quick Action Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          Delivery Route & Area Schedule Management
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase border border-emerald-500/20">
                          Live Logistics Calendar
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Schedule vehicle dispatch visit dates by customer store, city, route, or entire wholesale mandi zone.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleOpenBulkScheduler}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Bulk Area / Route Scheduler</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Stores Routed</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                      {customers.length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">Stores With Active Dates</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {customers.filter(c => (deliverySchedules[c.id || c.customerId] || []).length > 0).length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">Unique Mandis / Areas</span>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                      {Array.from(new Set(customers.map(c => c.area || c.city || 'Kanpur'))).length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">Total Visit Dates Set</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                      {Object.values(deliverySchedules || {}).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0)}
                    </span>
                  </div>
                </div>

                {/* Multi-Filter Bar: Area, City, Route, Delivery Date, Search */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-amber-500" /> Filter Delivery Routes & Customers
                    </span>
                    {(scheduleSearchQuery || scheduleCityFilter !== 'ALL' || scheduleAreaFilter !== 'ALL' || scheduleRouteFilter !== 'ALL' || scheduleDateFilter) && (
                      <button
                        type="button"
                        onClick={() => {
                          setScheduleSearchQuery('');
                          setScheduleCityFilter('ALL');
                          setScheduleAreaFilter('ALL');
                          setScheduleRouteFilter('ALL');
                          setScheduleDateFilter('');
                        }}
                        className="text-[11px] font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset Filters
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    {/* 1. Search Query */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={scheduleSearchQuery}
                        onChange={(e) => setScheduleSearchQuery(e.target.value)}
                        placeholder="Search Store, Name, Mobile..."
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* 2. City Filter */}
                    <div>
                      <select
                        value={scheduleCityFilter}
                        onChange={(e) => setScheduleCityFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="ALL">All Cities (All Mandis)</option>
                        {Array.from(new Set(customers.map(c => c.city).filter(Boolean))).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Area Filter */}
                    <div>
                      <select
                        value={scheduleAreaFilter}
                        onChange={(e) => setScheduleAreaFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="ALL">All Areas / Zones</option>
                        {Array.from(new Set(customers.map(c => c.area || c.city).filter(Boolean))).map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    {/* 4. Route Filter */}
                    <div>
                      <select
                        value={scheduleRouteFilter}
                        onChange={(e) => setScheduleRouteFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="ALL">All Delivery Routes</option>
                        <option value="UP-CENTRAL">Kanpur Central Wholesale Hub</option>
                        <option value="UP-LUCKNOW">Lucknow - Avadh Corridor Route</option>
                        <option value="UP-EAST">Prayagraj / Varanasi Express Route</option>
                        <option value="UP-WEST">Agra / Aligarh Western Route</option>
                        <option value="MH-BHIWANDI">Bhiwandi / Thane Logistics Corridor</option>
                      </select>
                    </div>

                    {/* 5. Delivery Date Filter */}
                    <div>
                      <input
                        type="date"
                        value={scheduleDateFilter}
                        onChange={(e) => setScheduleDateFilter(e.target.value)}
                        title="Filter by Scheduled Delivery Date"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Responsive Customers Delivery Schedule Table */}
                <div className="overflow-x-auto pb-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="min-w-[1100px] w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 min-w-[180px]">Customer & Shop Name</th>
                        <th className="py-3.5 px-4 min-w-[150px]">Contact Details</th>
                        <th className="py-3.5 px-4 min-w-[190px]">Area, City & Full Address</th>
                        <th className="py-3.5 px-4 min-w-[280px]">Assigned Delivery Dates (Visit Schedule)</th>
                        <th className="py-3.5 px-4 text-center min-w-[130px]">Next Visit Status</th>
                        <th className="py-3.5 px-6 text-center min-w-[160px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400 text-xs font-semibold">
                            No registered customers found.
                          </td>
                        </tr>
                      ) : (
                        customers
                          .filter(c => {
                            if (scheduleCityFilter !== 'ALL' && (c.city || '').toLowerCase() !== scheduleCityFilter.toLowerCase()) return false;
                            if (scheduleAreaFilter !== 'ALL') {
                              const a = (c.area || c.city || '').toLowerCase();
                              if (!a.includes(scheduleAreaFilter.toLowerCase())) return false;
                            }
                            if (scheduleDateFilter) {
                              const cDates = deliverySchedules[c.customerId] || deliverySchedules[c.id] || [];
                              if (!cDates.includes(scheduleDateFilter)) return false;
                            }
                            if (scheduleSearchQuery) {
                              const q = scheduleSearchQuery.toLowerCase();
                              const name = (c.name || c.shopName || '').toLowerCase();
                              const owner = (c.ownerName || '').toLowerCase();
                              const mobile = (c.mobile || c.phone || '').toLowerCase();
                              const area = (c.area || '').toLowerCase();
                              const city = (c.city || '').toLowerCase();
                              const addr = (c.address || '').toLowerCase();
                              return name.includes(q) || owner.includes(q) || mobile.includes(q) || area.includes(q) || city.includes(q) || addr.includes(q);
                            }
                            return true;
                          })
                          .map((cust, idx) => {
                            const cId = cust.customerId || cust.id || `CUST-${1000 + idx}`;
                            const cName = cust.name || cust.shopName || 'Retail Store';
                            const cOwner = cust.ownerName || '';
                            const cMobile = cust.mobile || cust.phone || '';
                            const cleanMobile = cMobile.replace(/\D/g, '');
                            const rawClean = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
                            const cArea = cust.area || cust.city || 'Kanpur Central Mandi';
                            const cCity = cust.city || 'Kanpur';
                            const cAddress = cust.address || 'Central Market Zone';
                            const assignedDates = (deliverySchedules[cId] || deliverySchedules[cust.customerId] || deliverySchedules[cust.id] || []).slice().sort();

                            const todayStr = new Date().toISOString().split('T')[0];
                            const futureDates = assignedDates.filter(d => d >= todayStr);
                            const nextDate = futureDates[0] || null;
                            const daysUntil = nextDate ? getDaysUntilDelivery(nextDate) : null;

                            const waScheduleMsg = `Namaste *${cName}*,\n\n🚚 *ANUJ ENTERPRISES — DELIVERY SCHEDULE NOTIFICATION*\nOur wholesale logistics vehicle is scheduled to visit your area (*${cArea}, ${cCity}*) on:\n${assignedDates.length > 0 ? assignedDates.map(d => `• 📅 *${formatScheduleDate(d)}*`).join('\n') : '• 📅 *Next Route Under Dispatch*'}\n\n⚠️ *Advisory:* Please place your order at least 1 day before the scheduled delivery date for guaranteed same-day delivery!\n\nOrder Booking: +91 88876 83782`;

                            return (
                              <tr key={cId} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                                {/* Customer & Shop Name */}
                                <td className="py-3.5 px-4">
                                  <strong className="text-slate-900 dark:text-white font-extrabold block text-xs">
                                    {cName}
                                  </strong>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                    <span>ID: <span className="font-mono font-bold text-amber-600">{cId}</span></span>
                                    {cOwner && <span>• Prop: {cOwner}</span>}
                                  </div>
                                </td>

                                {/* Contact Details */}
                                <td className="py-3.5 px-4">
                                  {cMobile ? (
                                    <a
                                      href={`tel:${cMobile.replace(/\s+/g, '')}`}
                                      className="text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline inline-flex items-center gap-1 text-xs"
                                      title={`Call: ${cMobile}`}
                                    >
                                      <span>📞</span>
                                      <span>{cMobile}</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">No phone</span>
                                  )}
                                  {cust.email && (
                                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px] mt-0.5">
                                      ✉️ {cust.email}
                                    </span>
                                  )}
                                </td>

                                {/* Area, City & Full Address */}
                                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20">
                                      📍 {cArea}
                                    </span>
                                    <span className="font-semibold text-slate-900 dark:text-white text-xs">
                                      {cCity}, {cust.state || 'UP'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 max-w-[200px]" title={cAddress}>
                                    {cAddress}
                                  </p>
                                </td>

                                {/* Assigned Delivery Dates */}
                                <td className="py-3.5 px-4">
                                  <div className="space-y-1.5">
                                    {assignedDates.length === 0 ? (
                                      <span className="text-[11px] text-slate-400 italic">
                                        ⚠️ No delivery dates assigned
                                      </span>
                                    ) : (
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {assignedDates.map(dateStr => {
                                          const isPast = dateStr < todayStr;
                                          return (
                                            <span
                                              key={dateStr}
                                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-2xs ${
                                                isPast
                                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 line-through'
                                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                              }`}
                                            >
                                              <span>📅 {formatScheduleDate(dateStr)}</span>
                                              <button
                                                type="button"
                                                onClick={() => removeCustomerDeliveryDate(cId, dateStr)}
                                                className="text-slate-400 hover:text-rose-500 ml-0.5 p-0.5 rounded-full hover:bg-rose-500/10 transition-colors"
                                                title={`Remove ${dateStr}`}
                                              >
                                                ✕
                                              </button>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleOpenScheduleModal(cust)}
                                      className="text-[10px] font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1 mt-1 hover:underline"
                                    >
                                      <Plus className="w-3 h-3" /> Add / Edit Visit Dates
                                    </button>
                                  </div>
                                </td>

                                {/* Next Visit Status */}
                                <td className="py-3.5 px-4 text-center">
                                  {nextDate ? (
                                    <div className="inline-block">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 border ${
                                        daysUntil === 0
                                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 animate-pulse'
                                          : daysUntil === 1
                                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                                      }`}>
                                        {daysUntil === 0 ? '⚡ TODAY' : daysUntil === 1 ? '🚚 TOMORROW' : `🟢 In ${daysUntil} Days`}
                                      </span>
                                      <span className="block text-[9px] text-slate-400 mt-0.5">
                                        {formatScheduleDate(nextDate)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">
                                      No Upcoming Date
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-6 text-center whitespace-nowrap min-w-[160px]">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* WhatsApp Direct Schedule Alert */}
                                    {rawClean && (
                                      <a
                                        href={`https://wa.me/${rawClean}?text=${encodeURIComponent(waScheduleMsg)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                        title="Send Delivery Schedule Alert on WhatsApp"
                                      >
                                        <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
                                        <span>Notify WA</span>
                                      </a>
                                    )}

                                    {/* Edit Schedule Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenScheduleModal(cust)}
                                      className="px-2.5 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                      title="Manage Customer Delivery Schedule"
                                    >
                                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Schedule</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ================= TAB: PRIORITY SUPPORT TICKETS & HELPDESK ================= */}
            {activeTab === 'tickets' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                
                {/* Header & Metrics Banner */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                      <LifeBuoy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          Priority Support Tickets Desk
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase border border-amber-500/30">
                          Live Helpdesk
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Manage customer trade inquiries, dispatch tracking questions, and damage docket requests.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddTicketModalOpen(true)}
                    className="px-4 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Log Priority Ticket</span>
                  </button>
                </div>

                {/* KPI Metrics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Tickets</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                      {(supportTickets || []).length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">Open / Action Needed</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    </div>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                      {(supportTickets || []).filter(t => t.status === 'OPEN').length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">In Progress</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                      {(supportTickets || []).filter(t => t.status === 'IN_PROGRESS').length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">Resolved / Closed</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {(supportTickets || []).filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
                    </span>
                  </div>
                </div>

                {/* Filter and Search Sub-Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={ticketSearchQuery}
                      onChange={(e) => setTicketSearchQuery(e.target.value)}
                      placeholder="Search Ticket #, Customer, Mobile, Issue..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Filter Chips for Status */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {[
                      { id: 'ALL', label: 'All Tickets', count: (supportTickets || []).length },
                      { id: 'OPEN', label: '🔴 Open', count: (supportTickets || []).filter(t => t.status === 'OPEN').length },
                      { id: 'IN_PROGRESS', label: '🟡 In Progress', count: (supportTickets || []).filter(t => t.status === 'IN_PROGRESS').length },
                      { id: 'RESOLVED', label: '🟢 Resolved', count: (supportTickets || []).filter(t => t.status === 'RESOLVED').length },
                      { id: 'URGENT', label: '⚡ Urgent Priority', count: (supportTickets || []).filter(t => t.priority === 'URGENT').length }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setTicketStatusFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                          ticketStatusFilter === f.id
                            ? 'bg-brand-900 text-white dark:bg-brand-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          ticketStatusFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tickets Table */}
                <div className="overflow-x-auto pb-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="min-w-[1040px] w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 min-w-[130px]">Ticket ID</th>
                        <th className="py-3.5 px-4 min-w-[120px]">Date</th>
                        <th className="py-3.5 px-4 min-w-[180px]">Customer Details</th>
                        <th className="py-3.5 px-4 min-w-[150px]">Category</th>
                        <th className="py-3.5 px-4 min-w-[220px]">Inquiry / Request</th>
                        <th className="py-3.5 px-4 text-center min-w-[140px]">Status</th>
                        <th className="py-3.5 px-6 text-center min-w-[160px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(supportTickets || [])
                        .filter(t => {
                          if (ticketStatusFilter === 'OPEN') return t.status === 'OPEN';
                          if (ticketStatusFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
                          if (ticketStatusFilter === 'RESOLVED') return t.status === 'RESOLVED';
                          if (ticketStatusFilter === 'CLOSED') return t.status === 'CLOSED';
                          if (ticketStatusFilter === 'URGENT') return t.priority === 'URGENT';
                          return true;
                        })
                        .filter(t => {
                          if (!ticketSearchQuery) return true;
                          const q = ticketSearchQuery.toLowerCase();
                          return (
                            (t.id && t.id.toLowerCase().includes(q)) ||
                            (t.name && t.name.toLowerCase().includes(q)) ||
                            (t.phone && t.phone.toLowerCase().includes(q)) ||
                            (t.category && t.category.toLowerCase().includes(q)) ||
                            (t.message && t.message.toLowerCase().includes(q))
                          );
                        })
                        .map(ticket => {
                          const dObj = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
                          const dateStr = dObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                          const timeStr = dObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                          const isUrgent = ticket.priority === 'URGENT';
                          const isHigh = ticket.priority === 'HIGH';

                          const cleanPhone = ticket.phone ? String(ticket.phone).replace(/\D/g, '') : '';
                          const rawClean = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                          const waMessage = `Namaste ${ticket.name || 'Valued Retailer'}, regarding your Priority Support Ticket #${ticket.ticketId || ticket.id} (${ticket.category}) with Anuj Enterprises:\n\n`;

                          return (
                            <tr 
                              key={ticket._id || ticket.ticketId || ticket.id}
                              className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors ${
                                ticket.status === 'OPEN' ? 'bg-amber-50/15 dark:bg-amber-950/10' : ''
                              }`}
                            >
                              {/* Ticket ID & Priority Badge */}
                              <td className="py-3.5 px-4">
                                <span className="font-mono font-bold text-brand-900 dark:text-brand-400 block">
                                  {ticket.ticketId || ticket.id}
                                </span>
                                {isUrgent ? (
                                  <span className="mt-1 px-2 py-0.5 rounded bg-rose-500 text-white font-black text-[9px] uppercase inline-flex items-center gap-0.5 shadow-sm">
                                    <Zap className="w-2.5 h-2.5 fill-white" /> URGENT
                                  </span>
                                ) : isHigh ? (
                                  <span className="mt-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase inline-flex items-center gap-0.5">
                                    HIGH
                                  </span>
                                ) : (
                                  <span className="mt-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[9px] uppercase">
                                    NORMAL
                                  </span>
                                )}
                              </td>

                              {/* Date & Time */}
                              <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                <strong className="block text-xs font-extrabold">{dateStr}</strong>
                                <span className="text-[10px] text-slate-400 block font-semibold">🕒 {timeStr}</span>
                              </td>

                              {/* Customer Details */}
                              <td className="py-3.5 px-4">
                                <strong className="text-slate-900 dark:text-white font-bold block">{ticket.name}</strong>
                                {ticket.phone && (
                                  <a 
                                    href={`tel:${ticket.phone.replace(/\s+/g, '')}`}
                                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline inline-flex items-center gap-1 mt-0.5 hover:text-emerald-700 transition-colors"
                                    title={`Call: ${ticket.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span>📞</span>
                                    <span>{ticket.phone}</span>
                                  </a>
                                )}
                                {ticket.email && (
                                  <a 
                                    href={`mailto:${ticket.email}`}
                                    className="text-[10px] text-slate-500 hover:underline truncate max-w-[160px] block"
                                    title={ticket.email}
                                  >
                                    ✉️ {ticket.email}
                                  </a>
                                )}
                              </td>

                              {/* Category */}
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-[10px] inline-block">
                                  {ticket.category || 'General Help'}
                                </span>
                              </td>

                              {/* Message */}
                              <td className="py-3.5 px-4">
                                <p className="text-slate-700 dark:text-slate-300 line-clamp-2 text-xs">
                                  {ticket.message}
                                </p>
                                {ticket.resolutionNote && (
                                  <div className="mt-1 p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-900/40 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                                    <strong>Resolution:</strong> {ticket.resolutionNote}
                                  </div>
                                )}
                              </td>

                              {/* Status Dropdown */}
                              <td className="py-3.5 px-4 text-center">
                                <select
                                  value={ticket.status || 'OPEN'}
                                  onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all cursor-pointer focus:outline-none ${
                                    ticket.status === 'OPEN'
                                      ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                      : ticket.status === 'IN_PROGRESS'
                                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                                      : ticket.status === 'RESOLVED'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  <option value="OPEN">🔴 Open</option>
                                  <option value="IN_PROGRESS">🟡 In Progress</option>
                                  <option value="RESOLVED">🟢 Resolved</option>
                                  <option value="CLOSED">⚪ Closed</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-6 text-center whitespace-nowrap min-w-[160px]">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {/* WhatsApp Direct Reply Button */}
                                  {rawClean && (
                                    <a
                                      href={`https://wa.me/${rawClean}?text=${encodeURIComponent(waMessage)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                      title="Reply to Customer on WhatsApp"
                                    >
                                      <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
                                      <span>WhatsApp</span>
                                    </a>
                                  )}

                                  {/* View / Resolve Details Modal */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTicketForDetails(ticket);
                                      setAdminResolutionNote(ticket.resolutionNote || '');
                                    }}
                                    className="px-2.5 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                    title="View Ticket Details & Add Resolution Note"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Details</span>
                                  </button>

                                  {/* Delete Ticket */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const targetId = ticket.ticketId || ticket.id || ticket._id;
                                      if (window.confirm(`Delete Support Ticket #${targetId}?`)) {
                                        deleteSupportTicket(ticket._id || ticket.ticketId || ticket.id);
                                      }
                                    }}
                                    className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 dark:bg-slate-800 rounded-xl transition-colors"
                                    title="Delete Ticket"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ================= TAB: REGISTERED CUSTOMERS & B2B USERS ================= */}
            {activeTab === 'customers' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                
                {/* Header & Quick Action Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-900 text-white dark:bg-brand-600 flex items-center justify-center font-black shadow-md shrink-0">
                      <UserCheck className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          Registered Customers & B2B User Directory
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase border border-emerald-500/20">
                          {customers.length} Verified Accounts
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Manage retail store partners, wholesale buyers, account classifications, and login credentials.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      disabled={isRefreshingCustomers}
                      onClick={async () => {
                        setIsRefreshingCustomers(true);
                        try {
                          await refreshCustomers();
                          showToast('Customer directory refreshed successfully', 'success');
                        } catch (err) {
                          showToast('Failed to refresh customer directory', 'error');
                        } finally {
                          setIsRefreshingCustomers(false);
                        }
                      }}
                      className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Sync and refresh latest registered customers from database"
                    >
                      <RefreshCw className={`w-4 h-4 text-emerald-500 ${isRefreshingCustomers ? 'animate-spin' : ''}`} />
                      <span>{isRefreshingCustomers ? 'Refreshing...' : 'Refresh'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportCustomersCSV(customers)}
                      className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-4 h-4 text-emerald-500" />
                      <span>Export Excel (.XLSX)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenAddCustomer}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register Customer Account</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Customers</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                      {customers.length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">Standard (Normal)</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {customers.filter(c => (c.classification || 'NORMAL') === 'NORMAL').length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">Damage Return Accounts</span>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                      {customers.filter(c => c.classification === 'DAMAGE').length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 block">Expiry Replacement Accounts</span>
                    <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                      {customers.filter(c => c.classification === 'EXPIRY').length}
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search ID, Store Name, Mobile, City..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Classification Filter Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {[
                      { id: 'ALL', label: 'All Accounts', count: customers.length },
                      { id: 'NORMAL', label: '🟢 Standard (Normal)', count: customers.filter(c => (c.classification || 'NORMAL') === 'NORMAL').length },
                      { id: 'DAMAGE', label: '🟠 Damage Accounts', count: customers.filter(c => c.classification === 'DAMAGE').length },
                      { id: 'EXPIRY', label: '🔴 Expiry Accounts', count: customers.filter(c => c.classification === 'EXPIRY').length }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setCustomerClassificationFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                          customerClassificationFilter === f.id
                            ? 'bg-brand-900 text-white dark:bg-brand-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          customerClassificationFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customers Table */}
                <div className="overflow-x-auto pb-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <table className="min-w-[1040px] w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 min-w-[120px]">Customer ID</th>
                        <th className="py-3.5 px-4 min-w-[180px]">Store & Business Name</th>
                        <th className="py-3.5 px-4 min-w-[180px]">Contact & Mobile</th>
                        <th className="py-3.5 px-4 min-w-[180px]">Location / Territory</th>
                        <th className="py-3.5 px-4 text-center min-w-[140px]">Classification</th>
                        <th className="py-3.5 px-4 text-center min-w-[140px]">Admin Tag</th>
                        <th className="py-3.5 px-4 text-center min-w-[120px]">Account Password</th>
                        <th className="py-3.5 px-6 text-center min-w-[160px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-slate-400 text-xs font-semibold">
                            No registered customers found. Click &quot;Register Customer Account&quot; to add one.
                          </td>
                        </tr>
                      ) : (
                        customers
                          .filter(c => {
                            if (customerClassificationFilter === 'NORMAL') return (c.classification || 'NORMAL') === 'NORMAL';
                            if (customerClassificationFilter === 'DAMAGE') return c.classification === 'DAMAGE';
                            if (customerClassificationFilter === 'EXPIRY') return c.classification === 'EXPIRY';
                            return true;
                          })
                          .filter(c => {
                            if (!customerSearch) return true;
                            const q = customerSearch.toLowerCase();
                            const name = (c.name || c.shopName || '').toLowerCase();
                            const owner = (c.ownerName || '').toLowerCase();
                            const id = (c.id || c.customerId || '').toLowerCase();
                            const mobile = (c.mobile || c.phone || '').toLowerCase();
                            const city = (c.city || '').toLowerCase();
                            const email = (c.email || '').toLowerCase();
                            return name.includes(q) || owner.includes(q) || id.includes(q) || mobile.includes(q) || city.includes(q) || email.includes(q);
                          })
                          .map((cust, idx) => {
                            const cId = cust.customerId || cust.id || `CUST-${1000 + idx}`;
                            const cName = cust.name || cust.shopName || 'B2B Retail Partner';
                            const cMobile = cust.mobile || cust.phone || '';
                            const cleanMobile = cMobile.replace(/\D/g, '');
                            const rawClean = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
                            const waGreeting = `Namaste ${cName}, this is Anuj Enterprises B2B Logistics & Supply Desk. How can we assist your store today?`;

                            const classType = cust.classification || 'NORMAL';

                            return (
                              <tr key={cust.id || cust.customerId || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                                {/* Customer ID */}
                                <td className="py-3.5 px-4 font-mono font-bold text-brand-900 dark:text-brand-400">
                                  {cId}
                                </td>

                                {/* Store & Business Name */}
                                <td className="py-3.5 px-4">
                                  <strong className="text-slate-900 dark:text-white font-extrabold block text-xs">
                                    {cName}
                                  </strong>
                                  {cust.ownerName && cust.ownerName !== cName && (
                                    <span className="text-[10px] text-slate-500 block">
                                      Prop: {cust.ownerName}
                                    </span>
                                  )}
                                </td>

                                {/* Contact & Mobile */}
                                <td className="py-3.5 px-4">
                                  {cMobile ? (
                                    <a 
                                      href={`tel:${cMobile.replace(/\s+/g, '')}`}
                                      className="text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline inline-flex items-center gap-1 text-xs"
                                      title={`Call: ${cMobile}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span>📞</span>
                                      <span>{cMobile}</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-400 text-xs">No phone</span>
                                  )}
                                  {cust.email && (
                                    <a 
                                      href={`mailto:${cust.email}`}
                                      className="text-[10px] text-slate-500 hover:underline block truncate max-w-[160px] mt-0.5"
                                      title={cust.email}
                                    >
                                      ✉️ {cust.email}
                                    </a>
                                  )}
                                </td>

                                {/* Location / Territory */}
                                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                  <span className="font-semibold block text-xs">{cust.city || 'Kanpur'}, {cust.state || 'Uttar Pradesh'}</span>
                                  {cust.address && (
                                    <span className="text-[10px] text-slate-400 block truncate max-w-[180px]" title={cust.address}>
                                      📍 {cust.address}
                                    </span>
                                  )}
                                </td>

                                {/* Classification Badge */}
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-block shadow-xs ${
                                    classType === 'DAMAGE'
                                      ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                                      : classType === 'EXPIRY'
                                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  }`}>
                                    {classType === 'DAMAGE' ? '⚠️ Damage Account' : classType === 'EXPIRY' ? '🔄 Expiry Account' : '🟢 Standard'}
                                  </span>
                                </td>

                                {/* Admin Tag (Interactive Dropdown for Admin) */}
                                <td className="py-3.5 px-4 text-center">
                                  <select
                                    value={cust.adminTag || 'No Tag'}
                                    onChange={(e) => {
                                      const newTag = e.target.value;
                                      updateCustomer({
                                        ...cust,
                                        adminTag: newTag
                                      });
                                    }}
                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black cursor-pointer border transition-colors outline-none focus:ring-2 focus:ring-amber-500 ${
                                      cust.adminTag === 'Lazy'
                                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                        : cust.adminTag === 'Super Lazy'
                                        ? 'bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800'
                                        : cust.adminTag === 'Best Customer'
                                        ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}
                                    title="Assign Admin Customer Tag"
                                  >
                                    <option value="No Tag">No Tag</option>
                                    <option value="Lazy">Lazy</option>
                                    <option value="Super Lazy">Super Lazy</option>
                                    <option value="Best Customer">Best Customer</option>
                                  </select>
                                </td>

                                {/* Account Password */}
                                <td className="py-3.5 px-4 text-center">
                                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 inline-block tracking-widest">
                                    ••••••••
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-6 text-center whitespace-nowrap min-w-[160px]">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* WhatsApp Direct Chat */}
                                    {rawClean && (
                                      <a
                                        href={`https://wa.me/${rawClean}?text=${encodeURIComponent(waGreeting)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl font-black text-xs inline-flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                        title="Chat with Customer on WhatsApp"
                                      >
                                        <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
                                        <span>WhatsApp</span>
                                      </a>
                                    )}

                                    {/* Edit Customer Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleEditCustomer(cust)}
                                      className="px-2.5 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                      title="Edit Customer Details"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Edit</span>
                                    </button>

                                    {/* Delete Customer Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Delete customer record for "${cName}" (${cId})?`)) {
                                          deleteCustomer(cust._id || cust.id || cust.customerId);
                                        }
                                      }}
                                      className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 dark:bg-slate-800 rounded-xl transition-colors"
                                      title="Delete Customer Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
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
                          password: '',
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
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tracking-widest">
                              ••••••••
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

            {/* ================= TAB 6: CATEGORIES & COMPANY PRIORITY ENGINE ================= */}
            {activeTab === 'categories' && (
              <div className="space-y-8">



                {/* --- TWO COLUMN MAIN WORKSTATION: CATEGORIES + BRAND PRIORITY ENGINE --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* LEFT COLUMN: Categories Master (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-amber-500" />
                          Product Categories ({categories.length})
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          Live Filterable
                        </span>
                      </div>

                      <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2 w-full">
                        <input
                          type="text"
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          placeholder="New Category Name..."
                          className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                        />
                        <button 
                          type="submit"
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </form>


                      <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 text-xs">
                        {categories.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs">No categories added yet</div>
                        ) : (
                          categories.map((c, idx) => {
                            const catName = typeof c === 'string' ? c : (c.name || `Category ${idx + 1}`);
                            const catId = (typeof c === 'object' && (c.id || c._id)) || catName;
                            const count = products.filter(p => p.category?.toLowerCase() === catName.toLowerCase()).length;
                            const isEditing = editingCategoryId === catId;

                            return (
                              <div key={catId || idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-between shadow-xs hover:border-amber-500/30 transition-all gap-2">
                                {isEditing ? (
                                  <form 
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      if (!editingCategoryName.trim()) return;
                                      await updateCategory(catId, editingCategoryName.trim());
                                      setEditingCategoryId(null);
                                    }}
                                    className="flex items-center gap-1.5 flex-1 min-w-0"
                                  >
                                    <input
                                      type="text"
                                      value={editingCategoryName}
                                      onChange={(e) => setEditingCategoryName(e.target.value)}
                                      className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-amber-500 rounded-lg text-xs font-bold text-slate-900 dark:text-white flex-1 min-w-0 focus:outline-none"
                                      autoFocus
                                    />
                                    <button 
                                      type="submit" 
                                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors" 
                                      title="Save Changes"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => setEditingCategoryId(null)} 
                                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </form>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                      <div className="min-w-0">
                                        <span className="font-extrabold text-slate-900 dark:text-white truncate block">{catName}</span>
                                        <span className="text-[10px] text-slate-400">{count} Products</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setEditingCategoryId(catId);
                                          setEditingCategoryName(catName);
                                        }} 
                                        className="text-slate-400 hover:text-amber-500 p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                                        title={`Edit ${catName}`}
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(`Delete category "${catName}"?`)) {
                                            deleteCategory(catId);
                                          }
                                        }} 
                                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                        title={`Delete ${catName}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Ultra-Premium Company Catalogue Ranking & Priority Engine (8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Card 1: Enroll New Company Deck */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                          <Plus className="w-4 h-4 text-amber-500" />
                          Enroll New Company / Manufacturer Brand
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Instantly syncs to catalog & MongoDB
                        </span>
                      </div>

                      <form onSubmit={handleAddCompany} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <input
                          type="text"
                          value={newCompanyInput}
                          onChange={(e) => setNewCompanyInput(e.target.value)}
                          placeholder="Company Name (e.g. Haldiram, Dabur, ITC, Tata, Fortune)..."
                          className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                        />

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={newCompanyCountry}
                            onChange={(e) => setNewCompanyCountry(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                          >
                            <option value="India">🇮🇳 India</option>
                            <option value="Switzerland">🇨🇭 Switzerland</option>
                            <option value="USA">🇺🇸 USA</option>
                            <option value="Germany">🇩🇪 Germany</option>
                            <option value="Japan">🇯🇵 Japan</option>
                            <option value="Global">🌐 Global</option>
                          </select>

                          <select
                            value={newCompanyPlacement}
                            onChange={(e) => setNewCompanyPlacement(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                          >
                            <option value="end">⬇️ At Bottom</option>
                            <option value="top">👑 At Top (#1)</option>
                          </select>

                          <button 
                            type="submit"
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            Enroll
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Card 2: Dedicated Scrollable Priority Board */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 shadow-sm space-y-4">
                      
                      {/* Card Header with Title, Count, and Quick Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                            <Crown className="w-4 h-4 fill-current" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Company Catalogue Ranking & Priority Engine
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px]">
                                {brands.length} Brands
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              #1 Flagship brand products appear first in live customer catalogue
                            </p>
                          </div>
                        </div>

                        {/* Quick Batch Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={autoRankByProductCount}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 font-extrabold text-xs transition-all shrink-0 flex items-center gap-1.5 border border-amber-500/30 active:scale-95"
                            title="Auto-sort companies by product inventory volume"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Auto-Rank</span>
                          </button>

                          <button
                            type="button"
                            onClick={resetBrandRanks}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all shrink-0 flex items-center gap-1 active:scale-95"
                            title="Reset canonical factory ranking sequence"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>

                      {/* Filter & Live Search Toolbar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-sm">
                          <input
                            type="text"
                            value={brandSearchTerm}
                            onChange={(e) => setBrandSearchTerm(e.target.value)}
                            placeholder="Filter company by name or country..."
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                          />
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          {brandSearchTerm && (
                            <button
                              onClick={() => setBrandSearchTerm('')}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setBrandFilterMode('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              brandFilterMode === 'all'
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            All ({brands.length})
                          </button>

                          <button
                            type="button"
                            onClick={() => setBrandFilterMode('podium')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                              brandFilterMode === 'podium'
                                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <Crown className="w-3 h-3 fill-current" />
                            Podium Top 3
                          </button>

                          <button
                            type="button"
                            onClick={() => setBrandFilterMode('with_products')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              brandFilterMode === 'with_products'
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            Has Products
                          </button>

                          <button
                            type="button"
                            onClick={() => setBrandFilterMode('zero_products')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              brandFilterMode === 'zero_products'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            Zero Products
                          </button>
                        </div>
                      </div>

                      {/* --- THE SCROLLABLE RANKING LIST CONTAINER --- */}
                      <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1.5 scrollbar-thin">
                        {processedBrands.length === 0 ? (
                          <div className="p-12 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                            <PackageX className="w-8 h-8 mx-auto text-slate-300" />
                            <p className="text-xs font-bold">No companies matched your search or filter</p>
                            <button
                              onClick={() => { setBrandSearchTerm(''); setBrandFilterMode('all'); }}
                              className="text-xs text-amber-500 font-extrabold hover:underline"
                            >
                              Reset filters
                            </button>
                          </div>
                        ) : (
                          processedBrands.map((brand) => {
                            const rankNum = brand.rank;
                            const isTop = rankNum === 1;
                            const isSecond = rankNum === 2;
                            const isThird = rankNum === 3;
                            const isExpanded = expandedBrandProducts === brand.name;

                            return (
                              <div 
                                key={brand.id || brand.name}
                                className={`rounded-2xl transition-all duration-200 ${
                                  isTop
                                    ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-white dark:to-slate-900 border-2 border-amber-400 dark:border-amber-500/80 shadow-md shadow-amber-500/10'
                                    : isSecond
                                    ? 'bg-gradient-to-r from-slate-200/50 via-slate-100/20 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-300 dark:border-slate-700 shadow-xs'
                                    : isThird
                                    ? 'bg-gradient-to-r from-amber-800/10 via-amber-700/5 to-white dark:from-amber-950/40 dark:to-slate-900 border border-amber-800/30 dark:border-amber-800/40 shadow-xs'
                                    : 'bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                                }`}
                              >
                                <div className="p-3.5 sm:p-4 space-y-2.5">
                                  
                                  {/* TOP ROW: Brand Identity + Actions */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                                    {/* Left: Rank Badge + Brand Name + Status Badges */}
                                    <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                                      {/* Podium Rank Pill */}
                                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-xs transition-all ${
                                        isTop 
                                          ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/20' 
                                          : isSecond 
                                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-800 text-slate-900 dark:text-white' 
                                          : isThird 
                                          ? 'bg-gradient-to-br from-amber-700/40 to-amber-800/60 text-amber-900 dark:text-amber-200' 
                                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                      }`}>
                                        {isTop ? (
                                          <>
                                            <Crown className="w-3 h-3 fill-slate-950 text-slate-950" />
                                            <span className="text-[10px] font-black leading-none">#1</span>
                                          </>
                                        ) : (
                                          <span className="text-xs font-extrabold">#{rankNum}</span>
                                        )}
                                      </div>

                                      {/* Brand Name & Flagship/Podium Badge */}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <strong className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight break-words">
                                            {brand.name}
                                          </strong>

                                          {isTop && (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1 shrink-0">
                                              <Crown className="w-2.5 h-2.5 fill-slate-950" />
                                              <span>#1 Flagship</span>
                                            </span>
                                          )}

                                          {isSecond && (
                                            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[9px] uppercase tracking-wider shrink-0">
                                              🥈 #2 Priority
                                            </span>
                                          )}

                                          {isThird && (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-900/20 text-amber-800 dark:text-amber-400 font-bold text-[9px] uppercase tracking-wider shrink-0">
                                              🥉 #3 Priority
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Mobile-only Quick Delete Button */}
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(`Remove "${brand.name}" from company directory?`)) {
                                            deleteBrand(brand.id || brand.name);
                                          }
                                        }} 
                                        className="sm:hidden text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 ml-auto"
                                        title={`Delete ${brand.name}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Desktop: Direct Numeric Rank Dropdown & Delete */}
                                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                                      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rank:</span>
                                        <select
                                          value={rankNum}
                                          onChange={(e) => updateBrandRank(brand.id || brand.name, e.target.value)}
                                          className="bg-transparent font-black text-xs text-amber-600 dark:text-amber-400 focus:outline-none cursor-pointer"
                                          title={`Change rank directly for ${brand.name}`}
                                        >
                                          {brands.map((_, rIdx) => (
                                            <option 
                                              key={rIdx + 1} 
                                              value={rIdx + 1}
                                              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                                            >
                                              #{rIdx + 1} {rIdx === 0 ? '(👑 Flagship #1)' : ''}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <button 
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(`Remove "${brand.name}" from company directory?`)) {
                                            deleteBrand(brand.id || brand.name);
                                          }
                                        }} 
                                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                        title={`Delete ${brand.name}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* BOTTOM ROW: Product Count & Country (Left) + Reorder Controls Strip (Right) */}
                                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                    {/* Left: Product Count + Country */}
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedBrandProducts(isExpanded ? null : brand.name)}
                                        className={`font-bold hover:underline inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                                          brand.productCount > 0 
                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60'
                                            : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                        }`}
                                        title="Click to preview products for this company"
                                      >
                                        <Package className="w-3 h-3" />
                                        <span>{brand.productCount} Products</span>
                                        <Eye className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                                      </button>

                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-[10px]">
                                        <Globe className="w-3 h-3 text-slate-400" />
                                        {brand.country || 'India'}
                                      </span>
                                    </div>

                                    {/* Right: Controls & Reorder buttons */}
                                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap shrink-0 ml-auto">
                                      {/* Mobile-only compact rank dropdown */}
                                      <div className="sm:hidden flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rank:</span>
                                        <select
                                          value={rankNum}
                                          onChange={(e) => updateBrandRank(brand.id || brand.name, e.target.value)}
                                          className="bg-transparent font-black text-xs text-amber-600 dark:text-amber-400 focus:outline-none cursor-pointer"
                                          title={`Change rank directly for ${brand.name}`}
                                        >
                                          {brands.map((_, rIdx) => (
                                            <option 
                                              key={rIdx + 1} 
                                              value={rIdx + 1}
                                              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                                            >
                                              #{rIdx + 1}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {!isTop && (
                                        <button
                                          type="button"
                                          onClick={() => setBrandTopRank(brand.id || brand.name)}
                                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-800 hover:text-slate-950 dark:text-amber-400 dark:hover:text-slate-950 border border-amber-400/40 rounded-xl font-black text-xs inline-flex items-center gap-1 transition-all shadow-xs"
                                          title={`Promote ${brand.name} to Rank #1 (Shows First in Customer Catalogue)`}
                                        >
                                          <Crown className="w-3 h-3 fill-current" />
                                          <span>Crown #1</span>
                                        </button>
                                      )}

                                      <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs divide-x divide-slate-200 dark:divide-slate-700">
                                        <button
                                          type="button"
                                          disabled={rankNum === 1}
                                          onClick={() => moveBrandToExtreme(brand.id || brand.name, 'TOP')}
                                          className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 text-slate-700 dark:text-slate-300 transition-colors"
                                          title="Move to Very Top (Rank #1)"
                                        >
                                          <ChevronsUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={rankNum === 1}
                                          onClick={() => moveBrandRank(brand.id || brand.name, 'UP')}
                                          className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 text-slate-700 dark:text-slate-300 transition-colors"
                                          title="Move Rank Up (+1 Priority)"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={rankNum === brands.length}
                                          onClick={() => moveBrandRank(brand.id || brand.name, 'DOWN')}
                                          className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 text-slate-700 dark:text-slate-300 transition-colors"
                                          title="Move Rank Down (-1 Priority)"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={rankNum === brands.length}
                                          onClick={() => moveBrandToExtreme(brand.id || brand.name, 'BOTTOM')}
                                          className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 text-slate-700 dark:text-slate-300 transition-colors"
                                          title="Move to Very Bottom (Lowest Priority)"
                                        >
                                          <ChevronsDown className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Expandable Product Drawer */}
                                {isExpanded && (
                                  <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 rounded-b-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-amber-500" />
                                        Products belonging to {brand.name} ({brand.products.length})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setExpandedBrandProducts(null)}
                                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                      >
                                        Close Preview ✕
                                      </button>
                                    </div>

                                    {brand.products.length === 0 ? (
                                      <div className="text-xs text-slate-400 italic p-3 text-center">
                                        No products assigned to {brand.name} yet in the product master.
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                                        {brand.products.map(p => (
                                          <div 
                                            key={p.id}
                                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs shadow-xs"
                                          >
                                            <img 
                                              src={p.image} 
                                              alt={p.name} 
                                              className="w-8 h-8 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0" 
                                            />
                                            <div className="min-w-0 flex-1">
                                              <div className="font-extrabold truncate text-slate-900 dark:text-white text-[11px]">
                                                {p.name}
                                              </div>
                                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                                <span>₹{p.price}</span>
                                                <span>•</span>
                                                <span className="font-mono">{p.sku}</span>
                                                <span>•</span>
                                                <span>Stock: {p.stock}</span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* ================= AUTO-DELETE RETENTION SETTINGS PANEL (in announcement tab) ================= */}
            {activeTab === 'announcement' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 mb-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Auto-Delete Retention Policy</h3>
                    <p className="text-[11px] text-slate-400">Automatically delete old orders after retention period (0 = Never delete)</p>
                  </div>
                </div>
                <div className="max-w-md space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Order Retention Period</label>
                  <select
                    value={retentionSettings.orderRetentionDays}
                    onChange={e => setRetentionSettings({ orderRetentionDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={0}>Never (Keep Forever)</option>
                    <option value={7}>7 Days</option>
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={180}>180 Days</option>
                    <option value={365}>365 Days</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={async () => {
                      setRetentionSaving(true);
                      try {
                        await settingService.updateRetention({ orderRetentionDays: retentionSettings.orderRetentionDays });
                        showToast(`Retention policy saved: ${retentionSettings.orderRetentionDays === 0 ? 'Never (Keep Forever)' : `${retentionSettings.orderRetentionDays} Days`}`, 'success');
                      } catch (e) {
                        showToast('Failed to save retention settings', 'error');
                      } finally { setRetentionSaving(false); }
                    }}
                    disabled={retentionSaving}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {retentionSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Policy
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Run auto-cleanup now? This will permanently delete orders older than the configured Order Retention Period.')) return;
                      try {
                        const res = await settingService.runCleanup();
                        const deleted = res.data?.deletedOrders || 0;
                        showToast(`Cleanup complete: ${deleted} orders deleted`, 'info');
                        if (deleted > 0) {
                          refreshOrders();
                        }
                      } catch (e) { showToast('Cleanup failed', 'error'); }
                    }}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Run Cleanup Now
                  </button>
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

                {/* 2. Packaging & Quantity (Kirana / FMCG Multi-Level Packaging Hierarchy) */}
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-brand-500/5 to-slate-100 dark:to-slate-950 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      📦 Packaging & Quantity
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      All packaging levels are optional • Admin defined
                    </span>
                  </div>

                  {/* Unit Type & Unit Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        1. Primary Unit Type
                      </label>
                      <select
                        value={prodForm.unitType || 'Piece'}
                        onChange={(e) => setProdForm({ ...prodForm, unitType: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                      >
                        {UNIT_TYPES.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Piece, Gram, Kg, Litre, Bottle, Packet, Box, etc.</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        2. Unit Quantity / Measure
                      </label>
                      <input
                        type="text"
                        value={prodForm.unitQuantity || ''}
                        onChange={(e) => setProdForm({ ...prodForm, unitQuantity: e.target.value })}
                        placeholder="e.g. 500 g, 1 kg, 2 kg, 5 kg, 250 ml, 1 bottle"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Exact unit quantity / weight measure</span>
                    </div>
                  </div>

                  {/* Multi-Level Packaging Hierarchy: Pack, Bundle, Mala, Bori, Case, Carton */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                      Configurable Packaging Levels (Fill only what applies):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Pack Size</label>
                        <input
                          type="text"
                          value={prodForm.packSize || ''}
                          onChange={(e) => setProdForm({ ...prodForm, packSize: e.target.value })}
                          placeholder="e.g. 1 Packet / 500g Box"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Bundle Size</label>
                        <input
                          type="text"
                          value={prodForm.bundleSize || ''}
                          onChange={(e) => setProdForm({ ...prodForm, bundleSize: e.target.value })}
                          placeholder="e.g. 12 Bottles / 6 Packs"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Mala Size</label>
                        <input
                          type="text"
                          value={prodForm.malaSize || ''}
                          onChange={(e) => setProdForm({ ...prodForm, malaSize: e.target.value })}
                          placeholder="e.g. 20 Pieces / Mala"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Bori Size</label>
                        <input
                          type="text"
                          value={prodForm.boriSize || ''}
                          onChange={(e) => setProdForm({ ...prodForm, boriSize: e.target.value })}
                          placeholder="e.g. 5 × 1 kg / 50 kg Bori"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Case Size</label>
                        <input
                          type="text"
                          value={prodForm.caseSize || ''}
                          onChange={(e) => setProdForm({ ...prodForm, caseSize: e.target.value })}
                          placeholder="e.g. 24 Bottles / Master Case"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold text-brand-900 dark:text-amber-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Carton Size</label>
                        <input
                          type="text"
                          value={prodForm.cartonSize || ''}
                          onChange={(e) => setProdForm({ ...prodForm, cartonSize: e.target.value })}
                          placeholder="e.g. 10 Boxes / Outer Carton"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Packaging / Relationship Breakdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      Custom Packaging / Breakdown Notes
                    </label>
                    <input
                      type="text"
                      value={prodForm.customPackaging || ''}
                      onChange={(e) => setProdForm({ ...prodForm, customPackaging: e.target.value })}
                      placeholder="e.g. 1 Bori = 5 × 1 kg packets • 1 Mala = 20 pieces • 1 Case = 24 bottles"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                    />
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      Optional breakdown notes. Leave blank if not applicable.
                    </span>
                  </div>
                </div>

                {/* 3. Product Photos (Max 5 Photos, Cloudinary CDN Storage, Drag & Drop / Arrow Reordering) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-amber-500" />
                        <span>Product Photos ({(prodForm.images || []).length}/5)</span>
                      </label>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                        💡 Drag photos or use ◀ ▶ arrows to reorder. Slot 1 is Cover Photo.
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 self-start sm:self-auto">
                      Max 5 Photos • Max 6MB each
                    </span>
                  </div>

                  {/* 5 Photos Grid Slots with Drag-and-Drop & Arrow Reorder */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                      const imgUrl = (prodForm.images || [])[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          draggable={Boolean(imgUrl)}
                          onDragStart={(e) => {
                            if (!imgUrl) return;
                            setDraggedImageIndex(slotIdx);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            if (draggedImageIndex !== null) {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedImageIndex !== null && draggedImageIndex !== slotIdx && (prodForm.images || [])[draggedImageIndex]) {
                              handleMoveProductImage(draggedImageIndex, slotIdx);
                              setDraggedImageIndex(null);
                            }
                          }}
                          className={`relative rounded-2xl border aspect-square overflow-hidden flex flex-col items-center justify-center p-1.5 transition-all ${
                            draggedImageIndex === slotIdx
                              ? 'opacity-40 border-amber-500 scale-95'
                              : imgUrl
                              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-amber-400'
                              : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800'
                          }`}
                        >
                          {imgUrl ? (
                            <>
                              <img
                                src={imgUrl}
                                alt={`Product slot ${slotIdx + 1}`}
                                className="w-full h-full object-contain pointer-events-none"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              {/* Slot Tag Badge */}
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-950/80 text-white backdrop-blur-xs">
                                {slotIdx === 0 ? '★ Cover' : `Photo ${slotIdx + 1}`}
                              </span>

                              {/* Action Buttons: Replace & Delete */}
                              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                <label
                                  className="p-1.5 bg-slate-950/80 hover:bg-slate-900 text-white rounded-lg shadow-md transition-transform hover:scale-110 cursor-pointer"
                                  title="Replace this photo"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp, image/jpg"
                                    onChange={(e) => handleReplaceProductImage(slotIdx, e)}
                                    disabled={isImageUploading}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductImage(slotIdx)}
                                  className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-transform hover:scale-110 cursor-pointer"
                                  title="Remove this photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Position Controls: Move Left / Move Right */}
                              <div className="absolute bottom-2 inset-x-2 flex items-center justify-between z-10 pointer-events-auto">
                                {slotIdx > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveProductImage(slotIdx, slotIdx - 1)}
                                    className="p-1 bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-white rounded-lg shadow-md transition-all hover:scale-110 cursor-pointer"
                                    title="Move Photo Left (Higher Priority)"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                ) : <div />}

                                {slotIdx < ((prodForm.images || []).length - 1) && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveProductImage(slotIdx, slotIdx + 1)}
                                    className="p-1 bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-white rounded-lg shadow-md transition-all hover:scale-110 ml-auto cursor-pointer"
                                    title="Move Photo Right (Lower Priority)"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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
                              <span className="text-[8px] text-slate-400">Max 6MB</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Upload Dropzone / Action Bar */}
                  {(prodForm.images || []).length < 5 ? (
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
                            <span>Uploading & Optimizing ({uploadProgress}%)...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Click to Upload Photo (Slot {(prodForm.images || []).length + 1} of 5)</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        PNG, JPG, WEBP • Max 6MB per photo • Cloudinary CDN Saved
                      </span>
                    </label>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Maximum 5 product photos uploaded & active</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">5 / 5 Photos</span>
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
                      placeholder="amit.shukla@anujfmcg.com"
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
                    {['Sales@123', 'Kanpur@2026', 'Anuj@006', 'Field@2026'].map(preset => (
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
                    {['Sales@123', 'Kanpur@2026', 'Anuj@006', 'Field@2026'].map(preset => (
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
                      value={custForm.classification || 'NORMAL'}
                      onChange={(e) => setCustForm({ ...custForm, classification: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    >
                      <option value="NORMAL">NORMAL (सामान्य ग्राहक — Standard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Admin Customer Tag <span className="text-[10px] text-amber-500 font-bold">(Admin Only)</span>
                    </label>
                    <select
                      value={custForm.adminTag || 'No Tag'}
                      onChange={(e) => setCustForm({ ...custForm, adminTag: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    >
                      <option value="No Tag">No Tag</option>
                      <option value="Lazy">Lazy</option>
                      <option value="Super Lazy">Super Lazy</option>
                      <option value="Best Customer">Best Customer</option>
                    </select>
                  </div>
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

      {/* WhatsApp Out For Delivery Notification Modal */}
      <WhatsAppDeliveryModal
        isOpen={Boolean(selectedOrderForDeliveryModal)}
        onClose={() => setSelectedOrderForDeliveryModal(null)}
        order={selectedOrderForDeliveryModal}
        onStatusUpdate={updateOrderStatus}
        showToast={showToast}
      />

      {/* Manual Priority Support Ticket Creation Modal */}
      <AnimatePresence>
        {isAddTicketModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-lg w-full space-y-4 my-auto"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Log Priority Support Ticket
                    </h3>
                    <p className="text-[11px] text-slate-500">Record customer trade or dispatch phone inquiry</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddTicketModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newAdminTicketForm.name.trim() || !newAdminTicketForm.phone.trim()) {
                    showToast('Please enter customer name and phone number.', 'error');
                    return;
                  }
                  submitSupportTicket(newAdminTicketForm);
                  setIsAddTicketModalOpen(false);
                  setNewAdminTicketForm({
                    name: '',
                    phone: '',
                    email: '',
                    category: 'Order Dispatch & Tracking',
                    priority: 'HIGH',
                    message: ''
                  });
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer / Retail Store Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminTicketForm.name}
                    onChange={(e) => setNewAdminTicketForm({ ...newAdminTicketForm, name: e.target.value })}
                    placeholder="e.g. Agarwal Wholesalers"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Customer Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAdminTicketForm.phone}
                      onChange={(e) => setNewAdminTicketForm({ ...newAdminTicketForm, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={newAdminTicketForm.priority}
                      onChange={(e) => setNewAdminTicketForm({ ...newAdminTicketForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                    >
                      <option value="URGENT">⚡ URGENT (Critical)</option>
                      <option value="HIGH">HIGH (Standard Priority)</option>
                      <option value="NORMAL">NORMAL (General)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={newAdminTicketForm.category}
                    onChange={(e) => setNewAdminTicketForm({ ...newAdminTicketForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
                  >
                    <option value="Order Dispatch & Tracking">Order Dispatch & Tracking</option>
                    <option value="Invoice Copy">Invoice Copy</option>
                    <option value="Damage / Expiry Replacement">Damage / Expiry Replacement</option>
                    <option value="Bulk Procurement Quote">Bulk Procurement Quote</option>
                    <option value="Salesman Assignment">Salesman Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inquiry Details / Customer Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newAdminTicketForm.message}
                    onChange={(e) => setNewAdminTicketForm({ ...newAdminTicketForm, message: e.target.value })}
                    placeholder="Describe issue or request reported by customer..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddTicketModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition-colors"
                  >
                    Save & Create Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Details & Resolution Modal */}
      <AnimatePresence>
        {selectedTicketForDetails && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-w-xl w-full space-y-4 my-auto"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                        {selectedTicketForDetails.ticketId || selectedTicketForDetails.id}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[9px] uppercase">
                        {selectedTicketForDetails.priority || 'HIGH'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{selectedTicketForDetails.category}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicketForDetails(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Info Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 dark:text-white font-black text-sm">
                    {selectedTicketForDetails.name}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    {new Date(selectedTicketForDetails.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {selectedTicketForDetails.phone && (
                    <a
                      href={`tel:${selectedTicketForDetails.phone.replace(/\s+/g, '')}`}
                      className="text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>📞</span>
                      <span>{selectedTicketForDetails.phone}</span>
                    </a>
                  )}
                  {selectedTicketForDetails.email && (
                    <a
                      href={`mailto:${selectedTicketForDetails.email}`}
                      className="text-slate-500 hover:underline inline-flex items-center gap-1"
                    >
                      <span>✉️</span>
                      <span>{selectedTicketForDetails.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Customer Message */}
              <div className="space-y-1 text-xs">
                <label className="font-extrabold uppercase text-[10px] text-slate-500 block">
                  Customer Inquiry Description:
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedTicketForDetails.message}
                </div>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1 text-xs">
                <label className="font-extrabold uppercase text-[10px] text-slate-700 dark:text-slate-300 block">
                  Admin Helpdesk Resolution Notes:
                </label>
                <textarea
                  rows={2}
                  value={adminResolutionNote}
                  onChange={(e) => setAdminResolutionNote(e.target.value)}
                  placeholder="Record resolution actions taken, dispatched replacement details, or internal notes..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
                />
              </div>

              {/* Status Update Options & WhatsApp Action */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Update Status:</label>
                  <select
                    value={selectedTicketForDetails.status}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      updateTicketStatus(selectedTicketForDetails.id, newSt, adminResolutionNote);
                      setSelectedTicketForDetails({ ...selectedTicketForDetails, status: newSt, resolutionNote: adminResolutionNote });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-black"
                  >
                    <option value="OPEN">🔴 Open</option>
                    <option value="IN_PROGRESS">🟡 In Progress</option>
                    <option value="RESOLVED">🟢 Resolved</option>
                    <option value="CLOSED">⚪ Closed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Direct Chat:</label>
                  {selectedTicketForDetails.phone ? (
                    <a
                      href={`https://wa.me/${String(selectedTicketForDetails.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Namaste ${selectedTicketForDetails.name}, regarding your Priority Support Ticket #${selectedTicketForDetails.ticketId || selectedTicketForDetails.id} with Anuj Enterprises:\n\n`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black rounded-xl inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors text-xs"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-slate-950" />
                      <span>WhatsApp Customer</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs">No phone recorded</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const targetId = selectedTicketForDetails.ticketId || selectedTicketForDetails.id || selectedTicketForDetails._id;
                    if (window.confirm(`Delete Support Ticket #${targetId}?`)) {
                      deleteSupportTicket(selectedTicketForDetails._id || selectedTicketForDetails.ticketId || selectedTicketForDetails.id);
                      setSelectedTicketForDetails(null);
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  title="Delete this ticket"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTicketStatus(selectedTicketForDetails.id, selectedTicketForDetails.status, adminResolutionNote);
                    setSelectedTicketForDetails(null);
                  }}
                  className="flex-1 py-2.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow transition-colors text-center"
                >
                  Save Resolution & Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Customer Delivery Schedule Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && selectedCustForSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">Customer Delivery Route Calendar</h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedCustForSchedule.name || selectedCustForSchedule.shopName} ({selectedCustForSchedule.id || selectedCustForSchedule.customerId})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs">
                {/* Store Area & Address Info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">Store / Mandi Location:</span>
                    <span className="font-black text-amber-600">
                      📍 {selectedCustForSchedule.area || selectedCustForSchedule.city || 'Kanpur Central Mandi'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">Full Address:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
                      {selectedCustForSchedule.address || 'Central Market Zone'}
                    </span>
                  </div>
                </div>

                {/* Date Picker Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Add Vehicle Delivery Visit Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={singleNewDateInput}
                      onChange={(e) => setSingleNewDateInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddDateToCustomer}
                      disabled={!singleNewDateInput}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Date
                    </button>
                  </div>
                </div>

                {/* Quick 1-Click Date Presets */}
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    ⚡ Quick 1-Click Route Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '+ Tomorrow', days: 1 },
                      { label: '+ In 2 Days', days: 2 },
                      { label: '+ In 4 Days', days: 4 },
                      { label: '+ In 7 Days', days: 7 },
                      { label: '+ In 14 Days', days: 14 }
                    ].map(p => {
                      const d = new Date();
                      d.setDate(d.getDate() + p.days);
                      const dStr = d.toISOString().split('T')[0];
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            if (!custScheduleDateInputs.includes(dStr)) {
                              setCustScheduleDateInputs(prev => [...prev, dStr].sort());
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-500 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          {p.label} ({dStr.slice(5)})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Dates List */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Scheduled Delivery Dates ({custScheduleDateInputs.length})
                    </span>
                    {custScheduleDateInputs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCustScheduleDateInputs([])}
                        className="text-[10px] font-bold text-rose-500 hover:underline"
                      >
                        Clear All Dates
                      </button>
                    )}
                  </div>

                  {custScheduleDateInputs.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs">
                      No delivery dates assigned. Select a date above to add.
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {custScheduleDateInputs.map(dateStr => (
                        <div
                          key={dateStr}
                          className="flex items-center justify-between p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs"
                        >
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{formatScheduleDate(dateStr)}</span>
                            <span className="font-mono text-[10px] text-slate-400">({dateStr})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDateFromCustomer(dateStr)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Remove date"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Save / Cancel Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomerSchedule}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Route Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Bulk Area Scheduler Modal */}
      <AnimatePresence>
        {isBulkScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">Bulk Area & Route Scheduler</h3>
                    <p className="text-[11px] text-slate-400">Assign delivery visit schedule to all stores in an Area or City</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBulkScheduleModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBulkSchedule} className="p-6 space-y-4 text-xs">
                {/* 1. Target Area or City Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Wholesale Mandi / Area / City *
                  </label>
                  <select
                    value={bulkTargetArea}
                    onChange={(e) => setBulkTargetArea(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Choose Mandi / Area / City --</option>
                    {Array.from(new Set(customers.map(c => c.area || c.city).filter(Boolean))).map(a => (
                      <option key={a} value={a}>
                        📍 {a} ({customers.filter(c => (c.area || c.city) === a).length} Stores)
                      </option>
                    ))}
                    {Array.from(new Set(customers.map(c => c.city).filter(Boolean))).map(city => (
                      <option key={`city-${city}`} value={city}>
                        🏙️ Entire City: {city} ({customers.filter(c => c.city === city).length} Stores)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Add Delivery Dates */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Add Delivery Visit Dates
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bulkNewDateInput}
                      onChange={(e) => setBulkNewDateInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddBulkDate}
                      disabled={!bulkNewDateInput}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '+ Tomorrow', days: 1 },
                    { label: '+ In 3 Days', days: 3 },
                    { label: '+ In 5 Days', days: 5 },
                    { label: '+ In 7 Days', days: 7 }
                  ].map(p => {
                    const d = new Date();
                    d.setDate(d.getDate() + p.days);
                    const dStr = d.toISOString().split('T')[0];
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          if (!bulkDatesList.includes(dStr)) {
                            setBulkDatesList(prev => [...prev, dStr].sort());
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700"
                      >
                        {p.label} ({dStr.slice(5)})
                      </button>
                    );
                  })}
                </div>

                {/* Dates List */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                    Dates to Apply ({bulkDatesList.length})
                  </span>
                  {bulkDatesList.length === 0 ? (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs">
                      No dates selected yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {bulkDatesList.map(dStr => (
                        <span
                          key={dStr}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800"
                        >
                          <span>📅 {formatScheduleDate(dStr)}</span>
                          <button
                            type="button"
                            onClick={() => setBulkDatesList(prev => prev.filter(d => d !== dStr))}
                            className="text-slate-400 hover:text-rose-500 ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsBulkScheduleModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!bulkTargetArea || bulkDatesList.length === 0}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow transition-colors"
                  >
                    Apply to All Stores in Area
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= ADMIN GENERATE B2B INVOICE MODAL ================= */}
      <AnimatePresence>
        {isAdminCreateInvoiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight">Generate B2B Tax Invoice & Order</h3>
                    <p className="text-xs text-slate-300">Assign registered user account & dispatch invoice email directly</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminCreateInvoiceOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdminCreateInvoiceSubmit} className="p-6 space-y-5 text-xs">
                
                {/* 1. Registered Customer Selector */}
                <div className="p-4 bg-amber-500/10 dark:bg-amber-500/5 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" /> 1. Select Registered B2B Customer / User *
                    </label>
                    <span className="text-[10px] text-slate-500 font-bold">Auto-fills store details & email target</span>
                  </div>

                  <select
                    value={adminInvoiceForm.selectedCustId}
                    onChange={(e) => handleAdminInvoiceCustSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-amber-500/40 rounded-xl font-bold text-xs text-slate-900 dark:text-amber-300 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Choose Registered B2B Store / User Account --</option>
                    {(customers || []).map(c => (
                      <option key={c.id || c.customerId} value={c.id || c.customerId}>
                        🏪 {c.name} ({c.customerId || c.id}) — 📧 {c.email || 'No Email'} | 📞 {c.mobile || c.phone || 'No Phone'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Customer & Delivery Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Store / Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminInvoiceForm.customerName}
                      onChange={(e) => setAdminInvoiceForm({ ...adminInvoiceForm, customerName: e.target.value })}
                      placeholder="e.g. Mahavir Kirana Wholesale"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Registered Email (Invoice Target) *
                    </label>
                    <input
                      type="email"
                      required
                      value={adminInvoiceForm.customerEmail}
                      onChange={(e) => setAdminInvoiceForm({ ...adminInvoiceForm, customerEmail: e.target.value })}
                      placeholder="retailer@example.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Contact Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={adminInvoiceForm.customerMobile}
                      onChange={(e) => setAdminInvoiceForm({ ...adminInvoiceForm, customerMobile: e.target.value })}
                      placeholder="98XXXXXXXX"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Assigned Salesman / Territory
                    </label>
                    <select
                      value={adminInvoiceForm.salesmanId}
                      onChange={(e) => setAdminInvoiceForm({ ...adminInvoiceForm, salesmanId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-xs text-slate-900 dark:text-white"
                    >
                      {(salesmen || []).map(s => (
                        <option key={s.id} value={s.id}>
                          👤 {s.name} ({s.id}) — {s.region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={adminInvoiceForm.customerAddress}
                    onChange={(e) => setAdminInvoiceForm({ ...adminInvoiceForm, customerAddress: e.target.value })}
                    placeholder="Kanpur Mandi Address / Street details"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* 3. Item Selection Builder */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-amber-500" /> 2. Add FMCG Product Line Items
                    </span>
                    <span className="text-[11px] font-bold text-amber-600">
                      Total Added: {adminInvoiceForm.items.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Select Product Item
                      </label>
                      <select
                        value={invoiceSelectedProdId}
                        onChange={(e) => {
                          const pid = e.target.value;
                          setInvoiceSelectedProdId(pid);
                          const p = (products || []).find(x => x.id === pid);
                          if (p) {
                            setInvoiceItemPrice(p.price || 0);
                            setInvoiceItemPack(p.packSize || 'Piece');
                          }
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                      >
                        <option value="">-- Choose FMCG Product --</option>
                        {(products || []).map(p => (
                          <option key={p.id} value={p.id}>
                            📦 {p.name} (SKU: {p.sku}) — ₹{p.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={invoiceItemQty}
                        onChange={(e) => setInvoiceItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleAddInvoiceLineItem}
                        disabled={!invoiceSelectedProdId}
                        className="w-full py-2 bg-brand-900 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4 text-amber-400" /> Add Line
                      </button>
                    </div>
                  </div>

                  {/* Added Items Table */}
                  {adminInvoiceForm.items.length > 0 && (
                    <div className="overflow-x-auto pt-2">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                          <tr>
                            <th className="py-2 px-3">Item Name</th>
                            <th className="py-2 px-3 text-center">Pack Size</th>
                            <th className="py-2 px-3 text-center">Qty</th>
                            <th className="py-2 px-3 text-right">Price</th>
                            <th className="py-2 px-3 text-right">Subtotal</th>
                            <th className="py-2 px-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {adminInvoiceForm.items.map(item => (
                            <tr key={item.id}>
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{item.name}</td>
                              <td className="py-2 px-3 text-center text-slate-500">{item.packSize}</td>
                              <td className="py-2 px-3 text-center font-bold">{item.qty}</td>
                              <td className="py-2 px-3 text-right">₹{item.price}</td>
                              <td className="py-2 px-3 text-right font-bold text-amber-600">₹{item.total}</td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInvoiceLineItem(item.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Description / Special Instructions */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Add Description
                  </label>
                  <textarea
                    rows={2}
                    value={adminInvoiceForm.description || ''}
                    onChange={(e) => setAdminInvoiceForm({ ...adminInvoiceForm, description: e.target.value })}
                    placeholder="Enter invoice description or special instructions..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* Priority Dispatch Toggle */}
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <div>
                      <strong className="block text-xs font-bold text-slate-900 dark:text-white">Urgent Priority Dispatch Flag</strong>
                      <span className="text-[10px] text-slate-500">Marks invoice for instant warehouse priority processing</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminInvoiceForm.isPriority}
                    onChange={(e) => setAdminInvoiceForm({ ...adminInvoiceForm, isPriority: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {/* Invoice Totals Summary */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 text-xs block">Invoice Grand Total</span>
                    <span className="text-xl font-black text-amber-400">
                      ₹{adminInvoiceForm.items.reduce((sum, i) => sum + i.total, 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right text-xs text-slate-300">
                    <div>Total Quantity: <strong>{adminInvoiceForm.items.reduce((sum, i) => sum + i.qty, 0)} Units</strong></div>
                    <div>Target Email: <strong className="text-amber-300">{adminInvoiceForm.customerEmail || 'No Email Set'}</strong></div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminCreateInvoiceOpen(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!adminInvoiceForm.customerName || adminInvoiceForm.items.length === 0}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all"
                  >
                    Generate & Send Invoice
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
