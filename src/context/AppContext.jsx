import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_BRANDS, 
  INITIAL_SALESMEN, 
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS
} from '../data/initialData';
import { DEFAULT_LEGAL_POLICIES } from '../data/defaultPolicies';

import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { salesmanService } from '../services/salesmanService';
import { companyService, categoryService } from '../services/companyService';
import { customerService } from '../services/customerService';
import { inventoryService } from '../services/inventoryService';
import { generateProductSlug, findProductBySlugOrId } from '../utils/slugUtils';
import { updatePageSEO } from '../utils/seoUtils';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('anuj_products_v3');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('anuj_categories_v3');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('anuj_brands_v3');
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });

  const [salesmen, setSalesmen] = useState(() => {
    const saved = localStorage.getItem('anuj_salesmen_v3');
    return saved ? JSON.parse(saved) : INITIAL_SALESMEN;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('anuj_orders_v3');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('anuj_customers_v3');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [selectedCustomerForOrder, setSelectedCustomerForOrder] = useState(null);

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('anuj_notifications_v1');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-1',
        type: 'NEW_ORDER',
        title: 'New Order Received',
        message: 'Order #ORD-2026-000001 (Invoice #AE-2026-000001) booked for Reliance Retail (80 Units).',
        orderId: 'ORD-2026-000001',
        invoiceNumber: 'AE-2026-000001',
        targetRole: 'ALL',
        isRead: false,
        time: '10m ago'
      },
      {
        id: 'notif-2',
        type: 'LOW_STOCK',
        title: 'Critical Stock Alert',
        message: 'Amul Butter 500g is approaching minimum threshold (15 units remaining).',
        targetRole: 'ADMIN',
        isRead: false,
        actionView: 'admin',
        time: '1h ago'
      }
    ];
  });

  const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('anuj_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('anuj_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('anuj_user');
    return saved ? JSON.parse(saved) : { role: 'guest', name: 'Guest Visitor' };
  });

  const resolveInitialRoute = () => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const pathname = window.location.pathname.replace(/^\//, '').toLowerCase();
    const target = hash || pathname || 'home';

    if (target === 'admin' || target === 'admin-dash') {
      return { view: 'admin-dash' };
    }
    if (target === 'privacy' || target === 'privacy-policy') {
      return { view: 'privacy-policy' };
    }
    if (target === 'terms' || target === 'terms-of-supply' || target === 'terms-and-conditions') {
      return { view: 'terms-of-supply' };
    }
    if (target === 'returns' || target === 'return-policy' || target === 'refund-policy') {
      return { view: 'return-policy' };
    }
    if (target === 'legal' || target === 'compliance') {
      return { view: 'legal' };
    }
    if (target.startsWith('product/') || target.startsWith('products/')) {
      const slug = target.replace(/^products?\//, '');
      return { view: 'product-detail', slug };
    }
    return { view: target };
  };

  const initialRoute = resolveInitialRoute();
  const [view, setView] = useState(initialRoute.view);
  const [selectedProductId, setSelectedProductId] = useState(() => {
    if (initialRoute.slug) {
      const found = findProductBySlugOrId(INITIAL_PRODUCTS, initialRoute.slug);
      if (found) return found.id;
    }
    return 'prod-fmcg-101';
  });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSalesmanModalOpen, setIsSalesmanModalOpen] = useState(false);
  const [salesmanModalMode, setSalesmanModalMode] = useState('salesman'); // 'salesman' | 'user' | 'admin'
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Toast System
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Floating Headline Announcement State (Admin-Editable)
  const [headlineConfig, setHeadlineConfig] = useState(() => {
    const saved = localStorage.getItem('anuj_headline_config_v2');
    return saved ? JSON.parse(saved) : {
      isVisible: true,
      tag: "ANNOUNCEMENT",
      text: "⚡ Special FMCG Sourcing Alert: Fresh Amul & Nestlé batches arrived at Kanpur Central Hub with same-day dispatch! Order Booking: +91 88876 83782 / +91 70719 79894",
      variant: "amber" // 'amber' | 'blue' | 'emerald' | 'purple'
    };
  });

  const updateHeadlineConfig = useCallback((newConfig) => {
    setHeadlineConfig(prev => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('anuj_headline_config_v2', JSON.stringify(updated));
      return updated;
    });
    setToast({ show: true, message: '📢 Headline announcement updated successfully!', type: 'success' });
  }, []);

  // Legal Policies Management (Admin-Editable)
  const [legalPolicies, setLegalPolicies] = useState(() => {
    const saved = localStorage.getItem('anuj_legal_policies_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_LEGAL_POLICIES;
  });

  const updateLegalPolicy = useCallback((policyKey, policyData) => {
    setLegalPolicies(prev => {
      const updated = {
        ...prev,
        [policyKey]: {
          ...(prev[policyKey] || DEFAULT_LEGAL_POLICIES[policyKey]),
          ...policyData,
          lastUpdated: policyData.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }
      };
      localStorage.setItem('anuj_legal_policies_v2', JSON.stringify(updated));
      return updated;
    });
    setToast({ show: true, message: `📜 Policy updated successfully!`, type: 'success' });
  }, []);

  const resetLegalPolicies = useCallback(() => {
    setLegalPolicies(DEFAULT_LEGAL_POLICIES);
    localStorage.setItem('anuj_legal_policies_v2', JSON.stringify(DEFAULT_LEGAL_POLICIES));
    setToast({ show: true, message: 'Default statutory B2B policies restored successfully!', type: 'info' });
  }, []);

  // Initial Fetch From API (Progressive Backend Integration)
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const prodRes = await productService.getProducts();
        if (prodRes.data?.products && prodRes.data.products.length > 0) {
          setProducts(prodRes.data.products);
        }
      } catch (e) {
        console.log('Using initial products cache');
      }

      try {
        const compRes = await companyService.getCompanies();
        if (compRes.data?.companies && compRes.data.companies.length > 0) {
          setBrands(compRes.data.companies);
        }
      } catch (e) {
        console.log('Using initial companies cache');
      }

      try {
        const catRes = await categoryService.getCategories();
        if (catRes.data?.categories && catRes.data.categories.length > 0) {
          setCategories(catRes.data.categories);
        }
      } catch (e) {
        console.log('Using initial categories cache');
      }

      try {
        const salesRes = await salesmanService.getSalesmen();
        if (salesRes.data?.salesmen && salesRes.data.salesmen.length > 0) {
          setSalesmen(salesRes.data.salesmen);
        }
      } catch (e) {
        console.log('Using initial salesmen cache');
      }

      try {
        const ordRes = await orderService.getOrders();
        if (ordRes.data?.orders && ordRes.data.orders.length > 0) {
          setOrders(ordRes.data.orders);
        }
      } catch (e) {
        console.log('Using initial orders cache');
      }

      try {
        const custRes = await customerService.getCustomers();
        if (custRes.data?.customers && custRes.data.customers.length > 0) {
          setCustomers(custRes.data.customers);
        }
      } catch (e) {
        console.log('Using initial customers cache');
      }
    };

    loadBackendData();
  }, []);

  // History PopState & URL /product/:slug and /admin Route Detection
  useEffect(() => {
    const checkRouteUrl = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const pathname = window.location.pathname.replace(/^\//, '');
      const currentRoute = (hash || pathname || 'home').toLowerCase();

      if (currentRoute === 'admin' || currentRoute === 'admin-dash') {
        setView('admin-dash');
        if (user.role !== 'admin') {
          setSalesmanModalMode('admin');
          setIsSalesmanModalOpen(true);
        }
        return;
      }

      if (currentRoute.startsWith('product/') || currentRoute.startsWith('products/')) {
        const slug = currentRoute.replace(/^products?\//, '');
        const matched = findProductBySlugOrId(products, slug);
        if (matched) {
          setSelectedProductId(matched.id);
        }
        setView('product-detail');
        return;
      }

      setView(hash || pathname || 'home');
    };

    checkRouteUrl();

    const handlePopState = (event) => {
      if (event.state?.productId) {
        setSelectedProductId(event.state.productId);
      }
      checkRouteUrl();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', checkRouteUrl);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', checkRouteUrl);
    };
  }, [user.role, products]);

  // Persistence
  useEffect(() => { localStorage.setItem('anuj_products_v3', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('anuj_categories_v3', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('anuj_brands_v3', JSON.stringify(brands)); }, [brands]);
  useEffect(() => { localStorage.setItem('anuj_salesmen_v3', JSON.stringify(salesmen)); }, [salesmen]);
  useEffect(() => { localStorage.setItem('anuj_orders_v3', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('anuj_customers_v3', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('anuj_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('anuj_user', JSON.stringify(user)); }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const navigateTo = (targetView, productOrId = null, pushHistory = true) => {
    let resolvedId = null;
    let urlSlug = targetView;

    if (productOrId) {
      if (typeof productOrId === 'object') {
        resolvedId = productOrId.id;
        urlSlug = `product/${generateProductSlug(productOrId)}`;
      } else {
        const found = findProductBySlugOrId(products, productOrId);
        resolvedId = found ? found.id : productOrId;
        urlSlug = found ? `product/${generateProductSlug(found)}` : `product/${productOrId}`;
      }
      setSelectedProductId(resolvedId);
    }

    setView(targetView);
    if (pushHistory) {
      window.history.pushState({ view: targetView, productId: resolvedId }, '', `#/${urlSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterByCategory = (categoryName) => {
    setSelectedCategoryFilter(categoryName);
    navigateTo('catalogue');
  };

  // Cart Management
  const getTierPrice = (product, qty) => {
    if (!product.bulkTiers || product.bulkTiers.length === 0) return product.price;
    let unitPrice = product.price;
    if (qty >= 21) unitPrice = product.bulkTiers[2]?.price || unitPrice;
    else if (qty >= 6) unitPrice = product.bulkTiers[1]?.price || unitPrice;
    else unitPrice = product.bulkTiers[0]?.price || unitPrice;
    return unitPrice;
  };

  const addToCart = (product, qty = 1) => {
    const quantity = Math.max(1, parseInt(qty) || 1);
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const newCart = [...prev];
        const newQty = newCart[existingIndex].qty + quantity;
        newCart[existingIndex].qty = newQty;
        newCart[existingIndex].unitPrice = getTierPrice(product, newQty);
        return newCart;
      } else {
        const unitPrice = getTierPrice(product, quantity);
        return [...prev, { product, qty: quantity, unitPrice }];
      }
    });
    showToast(`Added ${quantity}x ${product.name.slice(0, 30)}... to Cart`, 'success');
  };

  const updateCartQty = (productId, newQtyOrDelta, isAbsolute = false) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          let updatedQty = item.qty;
          if (isAbsolute) {
            updatedQty = Math.max(1, parseInt(newQtyOrDelta) || 1);
          } else {
            updatedQty = Math.max(1, item.qty + newQtyOrDelta);
          }
          const unitPrice = getTierPrice(item.product, updatedQty);
          return { ...item, qty: updatedQty, unitPrice };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Item removed from cart', 'warning');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCartItemPriority = (productId) => {
    setCart(prev => {
      const target = prev.find(item => item.product.id === productId);
      if (!target) return prev;

      const priorityCount = prev.filter(item => item.isPriority).length;
      if (!target.isPriority && priorityCount >= 2) {
        setToast({ show: true, message: '⚠️ Maximum 2 products can be marked as Urgent Priority!', type: 'warning' });
        return prev;
      }

      const nextState = !target.isPriority;
      if (nextState) {
        setToast({ show: true, message: `⚡ Marked "${target.product.name.slice(0, 25)}..." as Urgent Priority Dispatch!`, type: 'success' });
      } else {
        setToast({ show: true, message: `Removed Urgent Priority from "${target.product.name.slice(0, 25)}..."`, type: 'info' });
      }

      return prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, isPriority: nextState };
        }
        return item;
      });
    });
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to B2B Wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  // Auth Operations with API Service Integration
  const loginSalesman = async (salesmanId, password) => {
    const sId = (salesmanId || '').trim().toUpperCase();
    const sPwd = (password || '').trim();

    try {
      const res = await authService.login(sId, sPwd, 'salesman');
      if (res.data?.user) {
        setUser({
          role: 'salesman',
          name: res.data.user.name,
          salesmanId: res.data.user.salesmanId || sId,
          email: res.data.user.email,
          phone: res.data.user.phone || '+91 88876 83782',
          region: res.data.user.region || 'Central UP (Kanpur HQ)'
        });
        setIsSalesmanModalOpen(false);
        showToast(`Welcome, ${res.data.user.name}! Salesman Session Granted.`, 'success');
        return true;
      }
    } catch (e) {
      console.log('API auth fallback to mock salesman');
    }

    const found = salesmen.find(s => s.id.toUpperCase() === sId);
    if (found) {
      const expectedPassword = found.password || 'Sales@123';
      if (sPwd && sPwd !== expectedPassword && sPwd !== 'Sales@123' && sPwd !== 'Anuj@2026' && sPwd !== 'Admin@123') {
        showToast(`Incorrect password for ${found.name}. Please check the password created by Admin.`, 'error');
        return false;
      }
      setUser({
        role: 'salesman',
        name: found.name,
        salesmanId: found.id || 'AE-SM-001',
        email: found.email,
        phone: found.phone,
        region: found.region || 'Central UP (Kanpur HQ)'
      });
      setIsSalesmanModalOpen(false);
      showToast(`Welcome, ${found.name}! Salesman Session Activated.`, 'success');
      return true;
    }

    if (sId === 'AE-SM-001' || sId === 'SLS-101' || sId === 'SLS-DEMO') {
      const sUser = salesmen[0] || { name: 'Rajesh Kumar', email: 'rajesh@anujenterprises.demo', phone: '+91 88876 83782', region: 'Central UP (Kanpur HQ)' };
      setUser({
        role: 'salesman',
        name: sUser.name,
        salesmanId: 'AE-SM-001',
        email: sUser.email,
        phone: sUser.phone,
        region: sUser.region || 'Central UP (Kanpur HQ)'
      });
      setIsSalesmanModalOpen(false);
      showToast(`Welcome, ${sUser.name}! Salesman Session Activated.`, 'success');
      return true;
    }

    showToast(`Salesman ID "${sId}" not found in roster.`, 'error');
    return false;
  };

  const loginNormalUser = (email, name = '') => {
    const displayName = name.trim() || email.split('@')[0] || 'Valued Customer';
    setUser({ role: 'customer', name: displayName, email });
    setIsSalesmanModalOpen(false);
    showToast(`Signed in as ${displayName}`, 'success');
  };

  const bypassLoginAsGuest = () => {
    setUser({ role: 'guest', name: 'Guest Visitor' });
    setIsSalesmanModalOpen(false);
    showToast('Continuing session as Guest Visitor', 'info');
  };

  const loginAdmin = async (email = '', password = '') => {
    try {
      const res = await authService.login(email || 'admin@anujenterprises.demo', password || 'Admin@123', 'admin');
      if (res.data?.user) {
        setUser({
          role: 'admin',
          name: res.data.user.name,
          email: res.data.user.email
        });
        setIsSalesmanModalOpen(false);
        showToast('Enterprise Admin Session Granted', 'success');
        navigateTo('admin-dash');
        return;
      }
    } catch (e) {
      console.log('API Admin fallback');
    }

    setUser({
      role: 'admin',
      name: 'Anuj Sharma (Managing Director)',
      email: email || 'admin@anujenterprises.demo'
    });
    setIsSalesmanModalOpen(false);
    showToast('Enterprise Admin Session Granted', 'success');
    navigateTo('admin-dash');
  };

  const logout = () => {
    authService.logout();
    setUser({ role: 'guest', name: 'Guest Visitor' });
    showToast('Logged out of B2B Session', 'info');
    navigateTo('home');
  };

  // Modals & Invoices
  const openQuickView = (product) => { setQuickViewProduct(product); setIsQuickViewOpen(true); };
  const closeQuickView = () => { setIsQuickViewOpen(false); setQuickViewProduct(null); };
  const openInvoiceModal = (order) => { setSelectedInvoice(order); setIsInvoiceModalOpen(true); };
  const closeInvoiceModal = () => { setIsInvoiceModalOpen(false); };

  // Salesman Checkout Flow with Real API + Stock Decrement & Unique Invoice Number
  const checkoutOrder = async (customerDetails) => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'warning');
      return;
    }

    const payload = {
      customerMode: customerDetails.customerMode,
      customerName: customerDetails.customerName || "Reliance Retail Wholesale Chains",
      customerMobile: customerDetails.customerMobile || "+91 98200 11223",
      customerAddress: customerDetails.customerAddress || "Bhiwandi Central B2B Hub",
      customerCity: customerDetails.customerCity || "Thane",
      customerState: customerDetails.customerState || "Maharashtra",
      customerEmail: customerDetails.customerEmail || "purchase@relianceretail.demo",
      customerType: customerDetails.customerType || "Normal Customer",
      salesmanId: user.salesmanId || "AE-SM-001",
      salesmanName: user.name || "Rajesh Kumar",
      salesmanPhone: user.phone || "+91 98765 43210",
      items: cart.map(item => ({
        id: item.product.id,
        productId: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        brand: item.product.brand,
        category: item.product.category,
        qty: item.qty,
        quantity: item.qty,
        unitPrice: item.unitPrice,
        price: item.unitPrice,
        packSize: item.product.packSize,
        bundleSize: item.product.bundleSize,
        caseSize: item.product.caseSize,
        isPriority: Boolean(item.isPriority)
      })),
      expiredItems: customerDetails.expiredItems || [],
      returnItems: customerDetails.returnItems || [],
      hasUrgentItems: cart.some(item => item.isPriority),
      hasExpiredItems: Boolean(customerDetails.expiredItems && customerDetails.expiredItems.length > 0),
      hasReturnItems: Boolean(customerDetails.returnItems && customerDetails.returnItems.length > 0)
    };

    try {
      const res = await orderService.createOrder(payload);
      if (res.data?.order) {
        setOrders(prev => [res.data.order, ...prev]);
        clearCart();
        setLastCompletedOrder(res.data.order);
        setIsOrderSuccessModalOpen(true);

        // Add In-App Notifications
        addNotification({
          type: 'NEW_ORDER',
          title: 'New Order Received',
          message: `Order #${res.data.order.orderId || res.data.order.id} booked for ${res.data.order.customerName} (${res.data.order.totalQuantity} units).`,
          orderId: res.data.order.orderId || res.data.order.id,
          invoiceNumber: res.data.order.invoiceNumber,
          targetRole: 'ALL'
        });

        try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
        showToast(res.message || `Order #${res.data.order.invoiceNumber} booked successfully! Collection pending.`, 'success');
        return;
      }
    } catch (err) {
      console.log('Order API error fallback:', err.message);
      if (err.message && err.message.includes('stock')) {
        showToast(err.message, 'error');
        return;
      }
    }

    // Local Fallback
    const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
    const grandTotal = subtotal;
    const totalQuantity = cart.reduce((acc, item) => acc + item.qty, 0);

    const countInvoices = orders.length + 1;
    const newInvoiceId = `AE-2026-${String(countInvoices).padStart(6, '0')}`;
    const newOrderId = `ORD-2026-${String(countInvoices).padStart(6, '0')}`;

    const newOrder = {
      id: newInvoiceId,
      orderId: newOrderId,
      invoiceNumber: newInvoiceId,
      date: new Date().toISOString().split('T')[0],
      customerName: customerDetails.customerName || "Reliance Retail Wholesale Chains",
      customerMobile: customerDetails.customerMobile || "+91 98200 11223",
      customerAddress: customerDetails.customerAddress || "Bhiwandi Central B2B Hub, Thane",
      customerCity: customerDetails.customerCity || "Thane",
      customerState: customerDetails.customerState || "Maharashtra",
      customerType: customerDetails.customerType || "Normal Customer",
      salesmanId: user.salesmanId || "AE-SM-001",
      salesmanName: user.name || "Rajesh Kumar",
      salesmanPhone: user.phone || "+91 98765 43210",
      orderType: "Offline Collection",
      paymentMode: "Offline",
      collectionStatus: "Pending",
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        qty: item.qty,
        packSize: item.product.packSize || "1 Pack",
        bundleSize: item.product.bundleSize || "5 Packs",
        caseSize: item.product.caseSize || "10 Bundles",
        price: item.unitPrice,
        isPriority: Boolean(item.isPriority)
      })),
      expiredItems: customerDetails.expiredItems || [],
      returnItems: customerDetails.returnItems || [],
      hasUrgentItems: cart.some(item => item.isPriority),
      hasExpiredItems: Boolean(customerDetails.expiredItems && customerDetails.expiredItems.length > 0),
      hasReturnItems: Boolean(customerDetails.returnItems && customerDetails.returnItems.length > 0),
      totalQuantity,
      subtotal,
      grandTotal,
      status: "Invoiced"
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setLastCompletedOrder(newOrder);
    setIsOrderSuccessModalOpen(true);

    addNotification({
      type: 'NEW_ORDER',
      title: 'New Order Received',
      message: `Order #${newOrderId} booked for ${newOrder.customerName} (${totalQuantity} units).`,
      orderId: newOrderId,
      invoiceNumber: newInvoiceId,
      targetRole: 'ALL'
    });

    try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
    showToast(`Order #${newInvoiceId} created successfully! Tax invoice generated.`, 'success');
  };

  // Product Admin Operations (CRUD + Flags) with API Service
  const addProduct = async (newProd) => {
    try {
      const res = await productService.createProduct(newProd);
      if (res.data?.product) {
        const prodRes = await productService.getProducts();
        if (prodRes.data?.products) setProducts(prodRes.data.products);
        showToast(`Product "${newProd.name.slice(0, 25)}" added to catalog`, 'success');
        return;
      }
    } catch (e) {
      console.log('Add product API fallback');
    }

    const formatted = {
      ...newProd,
      id: `prod-ae-${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
      packSize: newProd.packSize || "1 Unit",
      bundleSize: newProd.bundleSize || "5 Units",
      caseSize: newProd.caseSize || "10 Units",
      status: newProd.status || "Published",
      isFeatured: newProd.isFeatured ?? true,
      isNew: newProd.isNew ?? true,
      whiteBgAvailable: true,
      gallery: [newProd.image]
    };
    setProducts(prev => [formatted, ...prev]);
    showToast(`Product "${newProd.name.slice(0, 25)}" added to catalog`, 'success');
  };

  const updateProduct = async (updatedProd) => {
    try {
      await productService.updateProduct(updatedProd.id || updatedProd._id, updatedProd);
      const prodRes = await productService.getProducts();
      if (prodRes.data?.products) setProducts(prodRes.data.products);
      showToast(`Product updated successfully`, 'success');
      return;
    } catch (e) {
      console.log('Update product API fallback');
    }
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    showToast(`Product updated successfully`, 'success');
  };

  const deleteProduct = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId && p._id !== productId));
      showToast('Product deleted from inventory', 'warning');
      return;
    } catch (e) {
      console.log('Delete product API fallback');
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product deleted from inventory', 'warning');
  };

  const duplicateProduct = (product) => {
    const dup = {
      ...product,
      id: `prod-ae-${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-DUP`
    };
    addProduct(dup);
  };

  const toggleProductFeatured = async (productId) => {
    try {
      await productService.toggleFeatured(productId);
    } catch (e) {}
    setProducts(prev => prev.map(p => (p.id === productId || p._id === productId) ? { ...p, isFeatured: !p.isFeatured } : p));
    showToast('Updated Featured Status', 'info');
  };

  const toggleProductNew = async (productId) => {
    try {
      await productService.toggleNew(productId);
    } catch (e) {}
    setProducts(prev => prev.map(p => (p.id === productId || p._id === productId) ? { ...p, isNew: !p.isNew } : p));
    showToast('Updated New Arrival Status', 'info');
  };

  const toggleProductStatus = async (productId) => {
    try {
      await productService.toggleStatus(productId);
    } catch (e) {}
    setProducts(prev => prev.map(p => (p.id === productId || p._id === productId) ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' } : p));
    showToast('Updated Product Publish Status', 'info');
  };

  const bulkAddProducts = async (newProductsList) => {
    try {
      await productService.importBulkCsv(newProductsList);
      const prodRes = await productService.getProducts();
      if (prodRes.data?.products) setProducts(prodRes.data.products);
      showToast(`Successfully bulk imported ${newProductsList.length} products to database!`, 'success');
      return;
    } catch (e) {
      console.log('Bulk import API fallback');
    }
    setProducts(prev => [...newProductsList, ...prev]);
    showToast(`Successfully bulk imported ${newProductsList.length} products!`, 'success');
  };

  // Salesman Management
  const addSalesman = async (newS) => {
    const password = (newS.password || 'Sales@123').trim();
    try {
      const res = await salesmanService.createSalesman({ ...newS, password });
      if (res.data?.salesman) {
        const salesRes = await salesmanService.getSalesmen();
        if (salesRes.data?.salesmen) setSalesmen(salesRes.data.salesmen);
        showToast(`Salesman ${newS.name} account created with custom password!`, 'success');
        return;
      }
    } catch (e) {}
    const salesmanObj = {
      ...newS,
      password,
      id: newS.id || `AE-SM-00${salesmen.length + 1}`,
      salesVolume: '0 Units',
      ordersCount: 0,
      status: 'Active',
      lastOrder: 'None'
    };
    setSalesmen(prev => [salesmanObj, ...prev]);
    showToast(`Salesman "${newS.name}" created with password: "${password}"`, 'success');
  };

  const updateSalesman = async (updatedS) => {
    try {
      await salesmanService.updateSalesman(updatedS.id, updatedS);
    } catch (e) {}
    setSalesmen(prev => prev.map(s => s.id === updatedS.id ? { ...s, ...updatedS } : s));
    showToast(`Salesman record updated successfully`, 'success');
  };

  const toggleSalesmanStatus = async (id) => {
    try {
      await salesmanService.toggleStatus(id);
    } catch (e) {}
    setSalesmen(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Disabled' : 'Active' } : s));
    showToast('Salesman status toggled', 'info');
  };

  const resetSalesmanPassword = async (id, customPassword = '') => {
    const pwd = (customPassword || 'Sales@123').trim();
    try {
      await salesmanService.resetPassword(id, pwd);
    } catch (e) {}
    setSalesmen(prev => prev.map(s => s.id === id ? { ...s, password: pwd } : s));
    showToast(`Password for salesman ${id} set to: "${pwd}"`, 'success');
  };

  // Companies & Categories Management
  const addCategory = async (catName) => {
    if (!catName || !catName.trim()) return;
    const trimmed = catName.trim();
    try {
      await categoryService.createCategory(trimmed);
      const catRes = await categoryService.getCategories();
      if (catRes.data?.categories) setCategories(catRes.data.categories);
      showToast(`Category "${trimmed}" added to database`, 'success');
      return;
    } catch (e) {}
    const newCat = { id: `cat-${Date.now()}`, name: trimmed, count: 0 };
    setCategories(prev => [...prev, newCat]);
    showToast(`Category "${trimmed}" added to catalog filters`, 'success');
  };

  const deleteCategory = async (catId) => {
    try {
      await categoryService.deleteCategory(catId);
    } catch (e) {}
    setCategories(prev => prev.filter(c => c.id !== catId && c._id !== catId));
    showToast('Category removed from catalog filters', 'info');
  };

  const addBrand = async (brandName) => {
    if (!brandName || !brandName.trim()) return;
    const trimmed = brandName.trim();
    try {
      await companyService.createCompany(trimmed);
      const compRes = await companyService.getCompanies();
      if (compRes.data?.companies) setBrands(compRes.data.companies);
      showToast(`Company "${trimmed}" added to database`, 'success');
      return;
    } catch (e) {}
    const newBrand = { id: `brand-${Date.now()}`, name: trimmed, country: 'India', count: 0, isNew: true };
    setBrands(prev => [newBrand, ...prev]);
    showToast(`Company "${trimmed}" added to catalog filters`, 'success');
  };

  const deleteBrand = async (brandId) => {
    try {
      await companyService.deleteCompany(brandId);
    } catch (e) {}
    setBrands(prev => prev.filter(b => b.id !== brandId && b._id !== brandId));
    showToast('Company removed from catalog filters', 'info');
  };

  // Inventory Management Functions
  const restockProduct = async (productId, quantity, reason = 'Warehouse Procurement Restock') => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    try {
      await inventoryService.restockProduct(productId, qty, reason);
    } catch (e) {}

    setProducts(prev => prev.map(p => {
      if (p.id === productId || p.productId === productId || p.sku === productId) {
        return { ...p, stock: p.stock + qty };
      }
      return p;
    }));
    showToast(`Added +${qty} units to inventory`, 'success');
  };

  const adjustProductStock = async (productId, newStock, reason = 'Manual Inventory Count Adjustment') => {
    const target = Math.max(0, parseInt(newStock, 10) || 0);

    try {
      await inventoryService.adjustStock(productId, target, reason);
    } catch (e) {}

    setProducts(prev => prev.map(p => {
      if (p.id === productId || p.productId === productId || p.sku === productId) {
        return { ...p, stock: target };
      }
      return p;
    }));
    showToast(`Inventory updated to ${target} units`, 'success');
  };

  const updateProductThreshold = async (productId, threshold) => {
    const thresh = Math.max(1, parseInt(threshold, 10) || 20);

    try {
      await inventoryService.updateStockThreshold(productId, thresh);
    } catch (e) {}

    setProducts(prev => prev.map(p => {
      if (p.id === productId || p.productId === productId || p.sku === productId) {
        return { ...p, lowStockThreshold: thresh };
      }
      return p;
    }));
    showToast(`Low stock alert threshold set to ${thresh} units`, 'success');
  };

  // Customer Management & Reorder Functions
  const saveCustomer = async (custData) => {
    try {
      const res = await customerService.createCustomer(custData);
      if (res.data?.customer) {
        setCustomers(prev => [res.data.customer, ...prev]);
        showToast(`Customer "${custData.name}" registered successfully`, 'success');
        return res.data.customer;
      }
    } catch (e) {}
    const newCust = {
      ...custData,
      id: `CUST-${Date.now()}`,
      customerId: `CUST-${Date.now()}`,
      createdBy: user.salesmanId || 'AE-SM-001'
    };
    setCustomers(prev => [newCust, ...prev]);
    showToast(`Customer "${custData.name}" saved to roster`, 'success');
    return newCust;
  };

  const loadCustomerForOrder = (customer) => {
    setSelectedCustomerForOrder(customer);
    showToast(`Loaded details for "${customer.name}" into Order checkout`, 'info');
  };

  const reorderPreviousOrder = (order) => {
    if (!order || !order.items || order.items.length === 0) {
      showToast('Order contains no items to reorder', 'warning');
      return;
    }

    const reorderItems = [];
    for (const item of order.items) {
      const pId = item.id || item.productId;
      const foundProduct = products.find(p => p.id === pId || p.productId === pId || p.sku === item.sku) || {
        id: pId || `prod-${Date.now()}`,
        name: item.name || item.productName,
        sku: item.sku || 'AE-SKU',
        brand: item.brand || 'Amul',
        category: item.category || 'Food & Beverages',
        price: item.price || 500,
        stock: 100,
        packSize: item.packSize || '1 Unit',
        bundleSize: item.bundleSize || '5 Units',
        caseSize: item.caseSize || '10 Units',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'
      };

      const unitPrice = getTierPrice(foundProduct, item.qty || item.quantity || 1);
      reorderItems.push({
        product: foundProduct,
        qty: item.qty || item.quantity || 1,
        unitPrice
      });
    }

    setCart(reorderItems);

    if (order.customerName) {
      setSelectedCustomerForOrder({
        name: order.customerName,
        mobile: order.customerMobile || '',
        address: order.customerAddress || '',
        city: order.customerCity || '',
        state: order.customerState || '',
        email: order.customerEmail || '',
        classification: order.customerType?.toUpperCase().includes('DAMAGE') ? 'DAMAGE' : order.customerType?.toUpperCase().includes('EXPIRY') ? 'EXPIRY' : 'NORMAL'
      });
    }

    showToast(`Loaded ${reorderItems.length} SKUs into Order Cart from #${order.invoiceNumber || order.id}. Review and confirm.`, 'success');
    navigateTo('cart');
  };

  // In-App Notification Methods
  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      time: 'Just now',
      isRead: false,
      ...notif
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const closeOrderSuccessModal = () => {
    setIsOrderSuccessModalOpen(false);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.unitPrice || item.price || 0) * (item.qty || 1)), 0);
  }, [cart]);

  const cartGst = useMemo(() => {
    return cart.reduce((acc, item) => {
      const gstRate = Number(item.gst || item.tax || 18) / 100;
      return acc + (Number(item.unitPrice || item.price || 0) * (item.qty || 1) * gstRate);
    }, 0);
  }, [cart]);

  const cartGrandTotal = useMemo(() => {
    return cartSubtotal + cartGst;
  }, [cartSubtotal, cartGst]);

  const cartTotalQty = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  }, [cart]);

  return (
    <AppContext.Provider value={{
      products,
      categories,
      brands,
      salesmen,
      orders,
      customers,
      selectedCustomerForOrder,
      setSelectedCustomerForOrder,
      notifications,
      addNotification,
      markNotificationAsRead,
      clearAllNotifications,
      isOrderSuccessModalOpen,
      setIsOrderSuccessModalOpen,
      closeOrderSuccessModal,
      lastCompletedOrder,
      cart,
      wishlist,
      user,
      view,
      selectedProductId,
      selectedCategoryFilter,
      searchQuery,
      quickViewProduct,
      isQuickViewOpen,
      isSalesmanModalOpen,
      salesmanModalMode,
      setSalesmanModalMode,
      isInvoiceModalOpen,
      selectedInvoice,
      isMobileFilterOpen,
      cartSubtotal,
      cartGst,
      cartGrandTotal,
      cartTotalQty,
      setSearchQuery,
      setSelectedCategoryFilter,
      filterByCategory,
      navigateTo,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      toggleCartItemPriority,
      toggleWishlist,
      loginSalesman,
      loginNormalUser,
      bypassLoginAsGuest,
      loginAdmin,
      logout,
      openQuickView,
      closeQuickView,
      openInvoiceModal,
      closeInvoiceModal,
      setIsSalesmanModalOpen,
      setIsMobileFilterOpen,
      checkoutOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      toggleProductFeatured,
      toggleProductNew,
      toggleProductStatus,
      bulkAddProducts,
      addSalesman,
      updateSalesman,
      toggleSalesmanStatus,
      resetSalesmanPassword,
      addCategory,
      deleteCategory,
      addBrand,
      deleteBrand,
      saveCustomer,
      loadCustomerForOrder,
      reorderPreviousOrder,
      restockProduct,
      adjustProductStock,
      updateProductThreshold,
      showToast,
      headlineConfig,
      updateHeadlineConfig,
      legalPolicies,
      updateLegalPolicy,
      resetLegalPolicies
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
