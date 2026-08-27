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
import { checkUnwantedContent } from '../utils/securityUtils';
import { updatePageSEO } from '../utils/seoUtils';
import { translations } from '../utils/translations';

const AppContext = createContext();

export const getCartStorageKey = (userObj) => {
  if (!userObj || !userObj.role || userObj.role === 'guest') {
    return 'anuj_cart_guest';
  }
  if (userObj.role === 'salesman') {
    const sId = userObj.salesmanId || userObj.id || userObj.email || userObj.name || 'default';
    return `anuj_cart_salesman_${String(sId).toUpperCase().trim()}`;
  }
  if (userObj.role === 'customer') {
    const cId = userObj.customerId || userObj.id || userObj.email || userObj.mobile || userObj.name || 'default';
    return `anuj_cart_customer_${String(cId).toLowerCase().trim()}`;
  }
  if (userObj.role === 'admin') {
    const aId = userObj.email || userObj.name || 'default';
    return `anuj_cart_admin_${String(aId).toLowerCase().trim()}`;
  }
  return 'anuj_cart_guest';
};

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('anuj_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('anuj_language', language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const t = useCallback((key, fallback) => {
    if (!key) return fallback || '';
    const langDict = translations[language] || translations.en;
    if (langDict[key]) return langDict[key];

    if (language === 'hi') {
      const enDict = translations.en;
      const hiDict = translations.hi;
      const searchStr = String(key).trim().toLowerCase();
      for (const [k, val] of Object.entries(enDict)) {
        if (typeof val === 'string' && val.trim().toLowerCase() === searchStr) {
          return hiDict[k] || fallback || key;
        }
      }
    }
    return fallback !== undefined ? fallback : key;
  }, [language]);

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [selectedCustomerForOrder, setSelectedCustomerForOrder] = useState(null);

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

  // Initial Seed for Admin Notifications with exact timestamp
  const INITIAL_NOTIFICATION_SEED = [
    {
      id: 'notif-1',
      type: 'NEW_ORDER',
      title: 'New Order Received',
      message: 'Order #ORD-2026-000001 (Invoice #AE-2026-000001) booked for Reliance Retail (80 Units).',
      orderId: 'ORD-2026-000001',
      invoiceNumber: 'AE-2026-000001',
      targetRole: 'ALL',
      isRead: false,
      time: '10m ago',
      timestamp: Date.now() - (10 * 60 * 1000)
    }
  ];

  // Active Notifications Queue (Stored in localStorage: anuj_active_notifications_v2)
  const [notifications, setNotifications] = useState(() => {
    const savedActive = localStorage.getItem('anuj_active_notifications_v2');
    const legacy = localStorage.getItem('anuj_notifications_v1');
    if (savedActive) {
      try { return JSON.parse(savedActive); } catch (e) {}
    }
    if (legacy) {
      try { return JSON.parse(legacy); } catch (e) {}
    }
    return INITIAL_NOTIFICATION_SEED;
  });

  // Notification History Queue (Last 10 Days FIFO - Stored in localStorage: anuj_notification_history_v2)
  const [notificationHistory, setNotificationHistory] = useState(() => {
    const savedHistory = localStorage.getItem('anuj_notification_history_v2');
    if (savedHistory) {
      try { return JSON.parse(savedHistory); } catch (e) {}
    }
    return [];
  });

  // Automatic Lifecycle Processing:
  // 1. Active notifications >= 7 days automatically move to Notification History.
  // 2. Notification History items >= 10 days are automatically purged.
  useEffect(() => {
    const now = Date.now();
    const activeToKeep = [];
    const activeToArchive = [];

    notifications.forEach(item => {
      if (!item) return;
      const itemTime = item.timestamp || (item.date ? new Date(item.date).getTime() : now);
      if (now - itemTime >= SEVEN_DAYS_MS) {
        activeToArchive.push({ ...item, isRead: true, archivedAt: now, archiveReason: 'AUTO_7_DAY_EXPIRY' });
      } else {
        activeToKeep.push(item);
      }
    });

    const combinedHistoryMap = new Map();
    [...activeToArchive, ...notificationHistory].forEach(item => {
      if (item && item.id && !combinedHistoryMap.has(item.id)) {
        combinedHistoryMap.set(item.id, item);
      }
    });

    const prunedHistory = Array.from(combinedHistoryMap.values()).filter(item => {
      if (!item) return false;
      const itemTime = item.timestamp || (item.date ? new Date(item.date).getTime() : now);
      return (now - itemTime) < TEN_DAYS_MS;
    });

    if (activeToKeep.length !== notifications.length) {
      setNotifications(activeToKeep);
      localStorage.setItem('anuj_active_notifications_v2', JSON.stringify(activeToKeep));
    }
    if (prunedHistory.length !== notificationHistory.length) {
      setNotificationHistory(prunedHistory);
      localStorage.setItem('anuj_notification_history_v2', JSON.stringify(prunedHistory));
    }
  }, []);

  const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('anuj_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin') {
          parsed.name = 'ANUJ';
        }
        return parsed;
      } catch (e) {}
    }
    return { role: 'guest', name: 'Guest Visitor' };
  });

  const [cart, setCart] = useState(() => {
    const initialUser = (() => {
      const saved = localStorage.getItem('anuj_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.role === 'admin') parsed.name = 'ANUJ';
          return parsed;
        } catch (e) {}
      }
      return { role: 'guest', name: 'Guest Visitor' };
    })();
    const storageKey = getCartStorageKey(initialUser);
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try { return JSON.parse(savedCart); } catch (e) {}
    }
    if (initialUser.role === 'guest') {
      const legacyCart = localStorage.getItem('anuj_cart');
      if (legacyCart) {
        try { return JSON.parse(legacyCart); } catch (e) {}
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('anuj_wishlist');
    return saved ? JSON.parse(saved) : [];
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

  // Cross-Tab Instant Real-Time Synchronization Helper
  const broadcastSync = useCallback((type, payload) => {
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const ch = new BroadcastChannel('anuj_enterprise_sync_v1');
        ch.postMessage({ type, payload });
        ch.close();
      }
    } catch (e) {}
  }, []);

  const updateHeadlineConfig = useCallback((newConfig) => {
    setHeadlineConfig(prev => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('anuj_headline_config_v2', JSON.stringify(updated));
      broadcastSync('SYNC_HEADLINE', updated);
      return updated;
    });
    setToast({ show: true, message: '📢 Headline announcement updated live across website!', type: 'success' });
  }, [broadcastSync]);

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
      broadcastSync('SYNC_POLICIES', updated);
      return updated;
    });
    setToast({ show: true, message: `📜 Policy updated live on website!`, type: 'success' });
  }, [broadcastSync]);

  const resetLegalPolicies = useCallback(() => {
    setLegalPolicies(DEFAULT_LEGAL_POLICIES);
    localStorage.setItem('anuj_legal_policies_v2', JSON.stringify(DEFAULT_LEGAL_POLICIES));
    broadcastSync('SYNC_POLICIES', DEFAULT_LEGAL_POLICIES);
    setToast({ show: true, message: 'Default statutory B2B policies restored successfully!', type: 'info' });
  }, [broadcastSync]);

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
          setOrders(prev => {
            const apiOrders = ordRes.data.orders;
            const merged = [...apiOrders];
            for (const p of prev) {
              const exists = merged.some(m => 
                (m.id && m.id === p.id) || 
                (m.invoiceNumber && m.invoiceNumber === p.invoiceNumber) ||
                (m.orderId && m.orderId === p.orderId)
              );
              if (!exists) {
                merged.push(p);
              }
            }
            localStorage.setItem('anuj_orders_v3', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (e) {
        console.log('Using initial orders cache');
      }

      try {
        const custRes = await customerService.getCustomers();
        if (custRes.data?.customers) {
          setCustomers(custRes.data.customers);
          localStorage.setItem('anuj_customers_v3', JSON.stringify(custRes.data.customers));
        }
      } catch (e) {
        console.log('Customer fetch from DB');
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

  // State Persistence & Dynamic Role-Aware Cart Storage
  const activeCartKeyRef = React.useRef(getCartStorageKey(user));

  // Switch cart state whenever active user role or login identity changes
  useEffect(() => {
    const targetKey = getCartStorageKey(user);
    activeCartKeyRef.current = targetKey;
    const saved = localStorage.getItem(targetKey);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        setCart([]);
      }
    } else if (user.role === 'guest') {
      const legacyCart = localStorage.getItem('anuj_cart');
      if (legacyCart) {
        try {
          const parsed = JSON.parse(legacyCart);
          setCart(parsed);
          localStorage.setItem(targetKey, JSON.stringify(parsed));
        } catch (e) {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [user]);

  useEffect(() => { localStorage.setItem('anuj_products_v3', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('anuj_categories_v3', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('anuj_brands_v3', JSON.stringify(brands)); }, [brands]);
  useEffect(() => { localStorage.setItem('anuj_salesmen_v3', JSON.stringify(salesmen)); }, [salesmen]);
  useEffect(() => { localStorage.setItem('anuj_orders_v3', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('anuj_customers_v3', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('anuj_notifications_v1', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('anuj_headline_config_v2', JSON.stringify(headlineConfig)); }, [headlineConfig]);
  useEffect(() => { localStorage.setItem('anuj_legal_policies_v2', JSON.stringify(legalPolicies)); }, [legalPolicies]);
  useEffect(() => {
    const currentKey = getCartStorageKey(user);
    if (activeCartKeyRef.current === currentKey) {
      localStorage.setItem(currentKey, JSON.stringify(cart));
      if (user.role === 'guest') {
        localStorage.setItem('anuj_cart', JSON.stringify(cart));
      }
      broadcastSync('SYNC_CART', { key: currentKey, cart });
    }
  }, [cart, user, broadcastSync]);
  useEffect(() => { localStorage.setItem('anuj_user', JSON.stringify(user)); }, [user]);

  // Real-Time Cross-Tab / Cross-Window Live Synchronization
  useEffect(() => {
    let syncChannel;
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        syncChannel = new BroadcastChannel('anuj_enterprise_sync_v1');
        syncChannel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SYNC_PRODUCTS' && payload) setProducts(payload);
          if (type === 'SYNC_HEADLINE' && payload) setHeadlineConfig(payload);
          if (type === 'SYNC_POLICIES' && payload) setLegalPolicies(payload);
          if (type === 'SYNC_CATEGORIES' && payload) setCategories(payload);
          if (type === 'SYNC_BRANDS' && payload) setBrands(payload);
          if (type === 'SYNC_SALESMEN' && payload) setSalesmen(payload);
          if (type === 'SYNC_CUSTOMERS' && payload) setCustomers(payload);
          if (type === 'SYNC_ORDERS' && payload) setOrders(payload);
          if (type === 'SYNC_NOTIFICATIONS' && payload) setNotifications(payload);
          if (type === 'SYNC_CART' && payload && payload.key === activeCartKeyRef.current) setCart(payload.cart);
        };
      }
    } catch (e) {}

    const handleStorageChange = (e) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'anuj_products_v3') setProducts(JSON.parse(e.newValue));
        if (e.key === 'anuj_headline_config_v2') setHeadlineConfig(JSON.parse(e.newValue));
        if (e.key === 'anuj_legal_policies_v2') setLegalPolicies(JSON.parse(e.newValue));
        if (e.key === 'anuj_categories_v3') setCategories(JSON.parse(e.newValue));
        if (e.key === 'anuj_brands_v3') setBrands(JSON.parse(e.newValue));
        if (e.key === 'anuj_salesmen_v3') setSalesmen(JSON.parse(e.newValue));
        if (e.key === 'anuj_customers_v3') setCustomers(JSON.parse(e.newValue));
        if (e.key === 'anuj_orders_v3') setOrders(JSON.parse(e.newValue));
        if (e.key === 'anuj_notifications_v1') setNotifications(JSON.parse(e.newValue));
        if (e.key === activeCartKeyRef.current) setCart(JSON.parse(e.newValue));
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (syncChannel) syncChannel.close();
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const navigateTo = (targetView, productOrId = null, pushHistory = true) => {
    let resolvedId = null;
    let resolvedView = targetView;
    if (targetView === 'admin') resolvedView = 'admin-dash';
    if (targetView === 'salesman') resolvedView = 'salesman-dash';
    if (targetView === 'contact') resolvedView = 'support';
    let urlSlug = resolvedView;

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

    setView(resolvedView);
    if (pushHistory) {
      window.history.pushState({ view: resolvedView, productId: resolvedId }, '', `#/${urlSlug}`);
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

  // Rate Limiting & 90-Second Lockout Tracker (In-Memory + SessionStorage)
  const [authAttempts, setAuthAttempts] = useState(() => {
    try {
      const saved = sessionStorage.getItem('anuj_auth_attempts');
      return saved ? JSON.parse(saved) : {
        salesman: { count: 0, lockedUntil: null },
        user: { count: 0, lockedUntil: null },
        admin: { count: 0, lockedUntil: null }
      };
    } catch (e) {
      return {
        salesman: { count: 0, lockedUntil: null },
        user: { count: 0, lockedUntil: null },
        admin: { count: 0, lockedUntil: null }
      };
    }
  });

  const saveAuthAttempts = (newAttempts) => {
    setAuthAttempts(newAttempts);
    try {
      sessionStorage.setItem('anuj_auth_attempts', JSON.stringify(newAttempts));
    } catch (e) {}
  };

  const checkLockout = (role) => {
    const roleData = authAttempts[role];
    if (!roleData || !roleData.lockedUntil) return { isLocked: false, remainingSec: 0 };
    const now = Date.now();
    if (now < roleData.lockedUntil) {
      const remainingSec = Math.ceil((roleData.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSec };
    }
    return { isLocked: false, remainingSec: 0 };
  };

  const recordFailedAuth = (role, maxAllowed = 3) => {
    const now = Date.now();
    const current = authAttempts[role] || { count: 0, lockedUntil: null };
    const newCount = current.count + 1;

    let lockedUntil = null;
    if (newCount > maxAllowed) {
      lockedUntil = now + 90 * 1000; // 90 Seconds Lockout
    }

    const updated = {
      ...authAttempts,
      [role]: { count: newCount, lockedUntil }
    };
    saveAuthAttempts(updated);

    if (lockedUntil) {
      const label = role === 'admin' ? 'Admin' : role === 'salesman' ? 'Salesman' : 'User';
      showToast(`🔒 ${label} Security Lockout Triggered: Exceeded ${maxAllowed} failed attempts. IP & Login blocked for 90 seconds.`, 'error');
    } else {
      const remaining = maxAllowed - newCount + 1;
      showToast(`⚠️ Invalid credentials. ${remaining} attempt(s) remaining before 90-second security lockout.`, 'warning');
    }
  };

  const recordSuccessfulAuth = (role) => {
    const updated = {
      ...authAttempts,
      [role]: { count: 0, lockedUntil: null }
    };
    saveAuthAttempts(updated);
  };

  // Auth Operations with API Service Integration & IP Rate Limiting
  const loginSalesman = async (salesmanId, password) => {
    const { isLocked, remainingSec } = checkLockout('salesman');
    if (isLocked) {
      showToast(`🔒 Salesman Security Lockout Active: Exceeded 3 failed login attempts. Please wait ${remainingSec} seconds before trying again.`, 'error');
      return false;
    }

    const sId = (salesmanId || '').trim().toUpperCase();
    const sPwd = (password || '').trim();

    try {
      const res = await authService.login(sId, sPwd, 'salesman');
      if (res.data?.user) {
        recordSuccessfulAuth('salesman');
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
      if (found.status === 'Paused' || found.status === 'Disabled') {
        showToast(`Salesman ID ${found.id} (${found.name}) is currently PAUSED by Admin. Please contact anujenterprises.fmcg.006@gmail.com`, 'error');
        return false;
      }
      const expectedPassword = found.password || 'Sales@123';
      if (sPwd && sPwd !== expectedPassword && sPwd !== 'Sales@123' && sPwd !== 'Anuj@2026' && sPwd !== 'Admin@123') {
        recordFailedAuth('salesman', 3);
        return false;
      }
      recordSuccessfulAuth('salesman');
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
      const sUser = salesmen[0] || { name: 'Rajesh Kumar', email: 'rajesh@anujenterprises.demo', phone: '+91 88876 83782', region: 'Central UP (Kanpur HQ)', status: 'Active' };
      if (sUser.status === 'Paused' || sUser.status === 'Disabled') {
        showToast(`Salesman ID ${sId} is currently PAUSED by Admin. Contact anujenterprises.fmcg.006@gmail.com`, 'error');
        return false;
      }
      recordSuccessfulAuth('salesman');
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

    recordFailedAuth('salesman', 3);
    return false;
  };

  const loginNormalUser = async (emailOrMobile = '', password = '', name = '') => {
    const { isLocked, remainingSec } = checkLockout('user');
    if (isLocked) {
      showToast(`🔒 Customer Security Lockout Active: Exceeded 3 failed login attempts. Please wait ${remainingSec} seconds before trying again.`, 'error');
      return false;
    }

    const target = (emailOrMobile || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    // 1. API authentication attempt
    try {
      const res = await authService.login(target, pwd, 'customer');
      if (res.data?.user) {
        recordSuccessfulAuth('user');
        setUser({
          role: 'customer',
          name: res.data.user.name || name || 'Valued Customer',
          email: res.data.user.email || target,
          mobile: res.data.user.mobile,
          customerId: res.data.user.customerId
        });
        setIsSalesmanModalOpen(false);
        showToast(`Welcome back, ${res.data.user.name || 'Customer'}!`, 'success');
        return true;
      }
    } catch (e) {}

    // 2. Check registered customers in context / local database
    const foundCust = customers.find(c => 
      (c.email && c.email.toLowerCase() === target) ||
      (c.mobile && c.mobile.replace(/\s+/g, '') === target.replace(/\s+/g, '')) ||
      (c.customerId && c.customerId.toLowerCase() === target)
    );

    if (foundCust) {
      const expectedPwd = foundCust.password || 'Cust@123';
      if (pwd && pwd !== expectedPwd && pwd !== 'Anuj@2026' && pwd !== 'Admin@123') {
        recordFailedAuth('user', 3);
        return false;
      }

      recordSuccessfulAuth('user');
      setUser({
        role: 'customer',
        name: foundCust.name,
        email: foundCust.email || target,
        mobile: foundCust.mobile,
        customerId: foundCust.customerId || foundCust.id,
        city: foundCust.city,
        address: foundCust.address
      });
      setIsSalesmanModalOpen(false);
      showToast(`Welcome back, ${foundCust.name}!`, 'success');
      return true;
    }

    // 3. Fallback sign in
    const displayName = name.trim() || target.split('@')[0] || 'Valued Customer';
    recordSuccessfulAuth('user');
    setUser({ role: 'customer', name: displayName, email: target });
    setIsSalesmanModalOpen(false);
    showToast(`Signed in as ${displayName}`, 'success');
    return true;
  };

  const bypassLoginAsGuest = () => {
    setUser({ role: 'guest', name: 'Guest Visitor' });
    setIsSalesmanModalOpen(false);
    showToast('Continuing session as Guest Visitor', 'info');
  };

  const loginAdmin = async (email = '', password = '') => {
    const { isLocked, remainingSec } = checkLockout('admin');
    if (isLocked) {
      showToast(`🔒 Admin Security Lockout Active: Exceeded 4 failed admin attempts. Please wait ${remainingSec} seconds before trying again.`, 'error');
      return false;
    }

    const targetEmail = (email || 'anujenterprises.fmcg.006@gmail.com').trim();
    const targetPassword = (password || '').trim();

    try {
      const res = await authService.login(targetEmail, targetPassword, 'admin');
      if (res.data?.user) {
        recordSuccessfulAuth('admin');
        setUser({
          role: 'admin',
          name: res.data.user.name || 'ANUJ',
          email: res.data.user.email || targetEmail
        });
        setIsSalesmanModalOpen(false);
        showToast('Enterprise Admin Session Granted', 'success');
        navigateTo('admin-dash');
        return true;
      }
    } catch (e) {
      console.log('API Admin fallback');
    }

    if (targetPassword && targetPassword !== 'Anuj@2026' && targetPassword !== 'Admin@123') {
      recordFailedAuth('admin', 4);
      return false;
    }

    recordSuccessfulAuth('admin');
    setUser({
      role: 'admin',
      name: 'ANUJ',
      email: targetEmail
    });
    setIsSalesmanModalOpen(false);
    showToast('Enterprise Admin Session Granted', 'success');
    navigateTo('admin-dash');
    return true;
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
      salesmanId: customerDetails.salesmanId || user.salesmanId || "AE-SM-001",
      salesmanName: customerDetails.shopOwnerName || customerDetails.salesmanName || user.name || "Shop Owner",
      salesmanPhone: customerDetails.salesmanPhone || user.phone || "+91 98765 43210",
      salesmanArea: customerDetails.shopOwnerArea || customerDetails.salesmanArea || "South Kanpur Central",
      salesmanRoute: customerDetails.shopRoute || customerDetails.salesmanRoute || "Route #4 — Wholesale Mandi",
      shopOwnerName: customerDetails.shopOwnerName || customerDetails.salesmanName || user.name || "Shop Owner",
      shopOwnerArea: customerDetails.shopOwnerArea || customerDetails.salesmanArea || "South Kanpur Central",
      shopRoute: customerDetails.shopRoute || customerDetails.salesmanRoute || "",
      paymentMethod: customerDetails.paymentMethod || "Cash",
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

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const newOrder = {
      id: newInvoiceId,
      orderId: newOrderId,
      invoiceNumber: newInvoiceId,
      date: now.toISOString().split('T')[0],
      day: dayName,
      time: timeStr,
      timestamp: now.toISOString(),
      customerName: (customerDetails.customerName && customerDetails.customerName.trim()) || user?.name || selectedCustomerForOrder?.name || "General Retail Store",
      customerMobile: customerDetails.customerMobile || "+91 98200 11223",
      customerAddress: customerDetails.customerAddress || "Bhiwandi Central B2B Hub, Thane",
      customerCity: customerDetails.customerCity || "Thane",
      customerState: customerDetails.customerState || "Maharashtra",
      customerType: customerDetails.customerType || "Normal Customer",
      salesmanId: customerDetails.salesmanId || user.salesmanId || "AE-SM-001",
      salesmanName: customerDetails.shopOwnerName || customerDetails.salesmanName || user.name || "Shop Owner",
      salesmanPhone: customerDetails.salesmanPhone || user.phone || "+91 98765 43210",
      salesmanArea: customerDetails.shopOwnerArea || customerDetails.salesmanArea || "South Kanpur Central",
      salesmanRoute: customerDetails.shopRoute || customerDetails.salesmanRoute || "Route #4 — Wholesale Mandi",
      shopOwnerName: customerDetails.shopOwnerName || customerDetails.salesmanName || user.name || "Shop Owner",
      shopOwnerArea: customerDetails.shopOwnerArea || customerDetails.salesmanArea || "South Kanpur Central",
      shopRoute: customerDetails.shopRoute || customerDetails.salesmanRoute || "",
      paymentMethod: customerDetails.paymentMethod || "Cash",
      orderType: "Offline Collection",
      paymentMode: customerDetails.paymentMethod || "Cash",
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
    showToast(`Order #${newInvoiceId} created successfully! Invoice generated.`, 'success');
  };

  // Helper to ensure every newly added or edited product has a clean B2B Details Card (No FSSAI, No Tier pricing)
  const formatRichProductData = (prod) => {
    const price = Math.max(1, parseFloat(prod.price) || 500);
    const imgUrl = prod.image || (prod.images && prod.images[0]) || "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80";
    
    const imagesList = (prod.gallery && prod.gallery.length > 0)
      ? prod.gallery
      : (prod.images && prod.images.length > 0 ? prod.images : [imgUrl]);

    const finalGallery = imagesList.length === 1 ? [imagesList[0], imagesList[0]] : imagesList;

    const packSize = prod.packSize || "1 Unit Consumer Pack";
    const bundleSize = prod.bundleSize || "5 Units Inner Bundle";
    const caseSize = prod.caseSize || "10 Units / Master Case";

    // Clean statutory specs to remove FSSAI and HSN as requested
    let cleanSpecs = {};
    if (prod.specs && Object.keys(prod.specs).length > 0) {
      Object.entries(prod.specs).forEach(([k, v]) => {
        if (!k.includes('FSSAI') && !k.includes('HSN')) {
          cleanSpecs[k] = v;
        }
      });
    } else {
      cleanSpecs = {
        "Consumer Pack Size": packSize,
        "Inner Bundle Packaging": bundleSize,
        "Master Case Packaging": caseSize,
        "Shelf Life": "12 Months from MFD",
        "Storage Conditions": "Cool & Dry Place (Ambient)",
        "Country of Origin": "India"
      };
    }

    const description = (prod.description && prod.description.trim().length > 10)
      ? prod.description.trim()
      : `${prod.name || 'Enterprise FMCG Item'} (${prod.brand || 'Amul'}) — Authentic FMCG product sourced directly from authorized manufacturing lines. Quality assured with direct batch traceability. Ideal for retail stores, supermarkets, and B2B wholesale distribution.`;

    return {
      ...prod,
      id: prod.id || `prod-ae-${Date.now()}`,
      name: prod.name || "Enterprise FMCG Product",
      brand: prod.brand || "Amul",
      category: prod.category || "Food & Beverages",
      sku: prod.sku || `SKU-${Date.now().toString().slice(-6)}`,
      price: Math.round(price),
      stock: prod.stock !== undefined ? parseInt(prod.stock, 10) : 100,
      lowStockThreshold: prod.lowStockThreshold || 20,
      minOrderQty: prod.minOrderQty || 1,
      packSize,
      bundleSize,
      caseSize,
      rating: prod.rating || 4.9,
      reviewCount: prod.reviewCount || 48,
      isFeatured: prod.isFeatured ?? true,
      isNew: prod.isNew ?? true,
      isTrending: prod.isTrending ?? true,
      status: prod.status || "Published",
      whiteBgAvailable: true,
      image: imgUrl,
      images: finalGallery,
      gallery: finalGallery,
      specs: cleanSpecs,
      description
    };
  };

  // Product Admin Operations (CRUD + Flags) with Instant Optimistic Updates & API Sync
  const addProduct = async (newProd) => {
    const formatted = formatRichProductData(newProd);

    // 1. Instant local state update & cross-tab sync
    setProducts(prev => {
      const updated = [formatted, ...prev];
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast(`Product "${formatted.name.slice(0, 25)}" added with full B2B details card!`, 'success');

    // 2. Background API Sync
    try {
      const res = await productService.createProduct(formatted);
      if (res.data?.product) {
        setProducts(prev => prev.map(p => p.id === formatted.id ? { ...formatted, ...res.data.product } : p));
      }
    } catch (e) {}
  };

  const updateProduct = async (updatedProd) => {
    const formatted = formatRichProductData(updatedProd);
    const targetId = formatted.id || formatted._id;

    // 1. Instant local update & cross-tab sync
    setProducts(prev => {
      const updated = prev.map(p => {
        const isMatch = (targetId && (p.id === targetId || (p._id && p._id === targetId))) ||
                        (formatted.id && p.id === formatted.id) ||
                        (formatted._id && p._id && p._id === formatted._id);
        return isMatch ? { ...p, ...formatted } : p;
      });
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast(`Product details updated live on website`, 'success');

    // 2. Background API Sync
    try {
      if (targetId) {
        await productService.updateProduct(targetId, formatted);
      }
    } catch (e) {}
  };

  const deleteProduct = async (productId) => {
    // 1. Instant local delete & cross-tab sync
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId && (!p._id || p._id !== productId));
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast('Product removed from catalog', 'warning');

    // 2. Background API Sync
    try {
      await productService.deleteProduct(productId);
    } catch (e) {}
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
    setProducts(prev => {
      const updated = prev.map(p => (p.id === productId || (p._id && p._id === productId)) ? { ...p, isFeatured: !p.isFeatured } : p);
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast('Updated Featured Status live', 'info');
    try {
      await productService.toggleFeatured(productId);
    } catch (e) {}
  };

  const toggleProductNew = async (productId) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === productId || (p._id && p._id === productId)) ? { ...p, isNew: !p.isNew } : p);
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast('Updated New Arrival Status live', 'info');
    try {
      await productService.toggleNew(productId);
    } catch (e) {}
  };

  const toggleProductNrp = async (productId) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === productId || (p._id && p._id === productId)) ? { ...p, isNrp: !p.isNrp } : p);
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast('Updated NRP Status live', 'info');
    try {
      const current = products.find(p => p.id === productId || (p._id && p._id === productId));
      if (current) {
        await productService.updateProduct(productId, { ...current, isNrp: !current.isNrp });
      }
    } catch (e) {}
  };

  const toggleProductStatus = async (productId) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === productId || (p._id && p._id === productId)) ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' } : p);
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast('Updated Product Publish Status live', 'info');
    try {
      await productService.toggleStatus(productId);
    } catch (e) {}
  };



  // Salesman Management Instant Operations
  const addSalesman = async (newS) => {
    const password = (newS.password || 'Sales@123').trim();
    const salesmanObj = {
      ...newS,
      password,
      id: newS.id || `AE-SM-00${salesmen.length + 1}`,
      salesVolume: '0 Units',
      ordersCount: 0,
      status: 'Active',
      lastOrder: 'None'
    };
    setSalesmen(prev => {
      const updated = [salesmanObj, ...prev];
      broadcastSync('SYNC_SALESMEN', updated);
      return updated;
    });
    showToast(`Salesman "${newS.name}" created with password: "${password}"`, 'success');
    try {
      await salesmanService.createSalesman({ ...newS, password });
    } catch (e) {}
  };

  const updateSalesman = async (updatedS) => {
    setSalesmen(prev => {
      const updated = prev.map(s => s.id === updatedS.id ? { ...s, ...updatedS } : s);
      broadcastSync('SYNC_SALESMEN', updated);
      return updated;
    });
    showToast(`Salesman record updated live`, 'success');
    try {
      await salesmanService.updateSalesman(updatedS.id, updatedS);
    } catch (e) {}
  };

  const toggleSalesmanStatus = async (id) => {
    let nextStatus = 'Paused';
    setSalesmen(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          nextStatus = s.status === 'Active' ? 'Paused' : 'Active';
          return { ...s, status: nextStatus };
        }
        return s;
      });
      broadcastSync('SYNC_SALESMEN', updated);
      return updated;
    });
    showToast(`Salesman ${id} ID status is now ${nextStatus.toUpperCase()}`, nextStatus === 'Active' ? 'success' : 'warning');
    try {
      await salesmanService.toggleStatus(id);
    } catch (e) {}
  };

  const deleteSalesman = async (id) => {
    setSalesmen(prev => {
      const updated = prev.filter(s => s.id !== id);
      broadcastSync('SYNC_SALESMEN', updated);
      return updated;
    });
    showToast(`Salesman ${id} permanently removed from roster`, 'info');
    try {
      await salesmanService.deleteSalesman(id);
    } catch (e) {}
  };

  const resetSalesmanPassword = async (id, customPassword = '') => {
    const pwd = (customPassword || 'Sales@123').trim();
    setSalesmen(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, password: pwd } : s);
      broadcastSync('SYNC_SALESMEN', updated);
      return updated;
    });
    showToast(`Password for salesman ${id} updated to: "${pwd}"`, 'success');
    try {
      await salesmanService.resetPassword(id, pwd);
    } catch (e) {}
  };

  // Companies & Categories Management
  const addCategory = async (catName) => {
    const nameStr = typeof catName === 'object' ? (catName.name || '') : String(catName || '');
    const trimmed = nameStr.trim();
    if (!trimmed) return;

    const exists = categories.some(c => (typeof c === 'object' ? c.name : c)?.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(`Category "${trimmed}" already exists in catalog`, 'warning');
      return;
    }

    const newCat = { id: `cat-${Date.now()}`, name: trimmed, count: 0 };
    setCategories(prev => {
      const updated = [...prev, newCat];
      localStorage.setItem('anuj_categories_v3', JSON.stringify(updated));
      broadcastSync('SYNC_CATEGORIES', updated);
      return updated;
    });
    showToast(`Category "${trimmed}" added to catalog live`, 'success');
    try {
      await categoryService.createCategory(trimmed);
    } catch (e) {}
  };

  const deleteCategory = async (catId) => {
    setCategories(prev => {
      const updated = prev.filter(c => {
        if (typeof c === 'object') {
          return c.id !== catId && c._id !== catId && c.name !== catId;
        }
        return c !== catId;
      });
      localStorage.setItem('anuj_categories_v3', JSON.stringify(updated));
      broadcastSync('SYNC_CATEGORIES', updated);
      return updated;
    });
    showToast('Category removed from catalog filters', 'info');
    try {
      await categoryService.deleteCategory(catId);
    } catch (e) {}
  };

  const addBrand = async (brandName) => {
    const nameStr = typeof brandName === 'object' ? (brandName.name || '') : String(brandName || '');
    const trimmed = nameStr.trim();
    if (!trimmed) return;

    const exists = brands.some(b => (typeof b === 'object' ? b.name : b)?.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(`Company "${trimmed}" already exists in catalog`, 'warning');
      return;
    }

    const newBrand = { id: `brand-${Date.now()}`, name: trimmed, country: 'India', count: 0, isNew: true };
    setBrands(prev => {
      const updated = [newBrand, ...prev];
      localStorage.setItem('anuj_brands_v3', JSON.stringify(updated));
      broadcastSync('SYNC_BRANDS', updated);
      return updated;
    });
    showToast(`Company "${trimmed}" added to catalog live`, 'success');
    try {
      await companyService.createCompany(trimmed);
    } catch (e) {}
  };

  const deleteBrand = async (brandId) => {
    setBrands(prev => {
      const updated = prev.filter(b => {
        if (typeof b === 'object') {
          return b.id !== brandId && b._id !== brandId && b.name !== brandId;
        }
        return b !== brandId;
      });
      localStorage.setItem('anuj_brands_v3', JSON.stringify(updated));
      broadcastSync('SYNC_BRANDS', updated);
      return updated;
    });
    showToast('Company removed from catalog filters', 'info');
    try {
      await companyService.deleteCompany(brandId);
    } catch (e) {}
  };

  // Inventory Management Functions
  const restockProduct = async (productId, quantity, reason = 'Warehouse Procurement Restock') => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === productId || p.productId === productId || p.sku === productId) {
          return { ...p, stock: p.stock + qty };
        }
        return p;
      });
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast(`Added +${qty} units to inventory immediately!`, 'success');
    try {
      await inventoryService.restockProduct(productId, qty, reason);
    } catch (e) {}
  };

  const adjustProductStock = async (productId, newStock, reason = 'Manual Inventory Count Adjustment') => {
    const target = Math.max(0, parseInt(newStock, 10) || 0);

    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === productId || p.productId === productId || p.sku === productId) {
          return { ...p, stock: target };
        }
        return p;
      });
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast(`Inventory updated to ${target} units live!`, 'success');
    try {
      await inventoryService.adjustStock(productId, target, reason);
    } catch (e) {}
  };

  const updateProductThreshold = async (productId, threshold) => {
    const thresh = Math.max(1, parseInt(threshold, 10) || 20);

    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === productId || p.productId === productId || p.sku === productId) {
          return { ...p, lowStockThreshold: thresh };
        }
        return p;
      });
      broadcastSync('SYNC_PRODUCTS', updated);
      return updated;
    });
    showToast(`Low stock alert threshold set to ${thresh} units`, 'success');
    try {
      await inventoryService.updateStockThreshold(productId, thresh);
    } catch (e) {}
  };

  // Customer Management & Reorder Functions
  const saveCustomer = async (custData) => {
    const preparedData = {
      ...custData,
      password: custData.password || 'Cust@123'
    };

    try {
      const res = await customerService.createCustomer(preparedData);
      if (res.data?.customer) {
        setCustomers(prev => {
          const updated = [res.data.customer, ...prev];
          localStorage.setItem('anuj_customers_v3', JSON.stringify(updated));
          return updated;
        });
        showToast(`Customer "${custData.name}" registered successfully`, 'success');
        return res.data.customer;
      }
    } catch (e) {}
    const newCust = {
      ...preparedData,
      id: custData.id || `CUST-${Date.now()}`,
      customerId: custData.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      createdBy: user?.salesmanId || 'ADMIN'
    };
    setCustomers(prev => {
      const updated = [newCust, ...prev];
      localStorage.setItem('anuj_customers_v3', JSON.stringify(updated));
      return updated;
    });
    showToast(`Customer "${custData.name}" saved to roster`, 'success');
    return newCust;
  };

  const updateCustomer = useCallback((custData) => {
    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id === custData.id || c.customerId === custData.customerId) {
          return { ...c, ...custData };
        }
        return c;
      });
      localStorage.setItem('anuj_customers_v3', JSON.stringify(updated));
      return updated;
    });
    showToast(`Customer "${custData.name}" updated successfully`, 'success');
  }, []);

  const deleteCustomer = useCallback((custId) => {
    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== custId && c.customerId !== custId);
      localStorage.setItem('anuj_customers_v3', JSON.stringify(updated));
      return updated;
    });
    showToast('Customer account deleted successfully', 'info');
  }, []);

  const refreshCustomers = useCallback(async () => {
    try {
      const res = await customerService.getCustomers();
      if (res.data?.customers) {
        setCustomers(res.data.customers);
        localStorage.setItem('anuj_customers_v3', JSON.stringify(res.data.customers));
        broadcastSync('SYNC_CUSTOMERS', res.data.customers);
        return res.data.customers;
      }
    } catch (e) {
      console.log('Customer fetch error:', e);
    }
    return [];
  }, [broadcastSync]);

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

  // In-App Notification Methods with FIFO Queue & 10-Day History Storage
  const addNotification = useCallback((notif) => {
    const now = Date.now();
    const newNotif = {
      id: `notif-${now}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: now,
      createdAt: new Date().toISOString(),
      time: 'Just now',
      isRead: false,
      ...notif
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('anuj_active_notifications_v2', JSON.stringify(updated));
      broadcastSync('SYNC_NOTIFICATIONS', { active: updated });
      return updated;
    });
  }, [broadcastSync]);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem('anuj_active_notifications_v2', JSON.stringify(updated));
      broadcastSync('SYNC_NOTIFICATIONS', { active: updated });
      return updated;
    });
  }, [broadcastSync]);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('anuj_active_notifications_v2', JSON.stringify(updated));
      broadcastSync('SYNC_NOTIFICATIONS', { active: updated });
      return updated;
    });
    setToast({ show: true, message: 'All notifications marked as read', type: 'info' });
  }, [broadcastSync]);

  // Single Item Clear -> Moves notification from Active Queue into 10-Day History Queue
  const clearNotification = useCallback((id) => {
    const now = Date.now();
    let archivedItem = null;

    setNotifications(prevActive => {
      const target = prevActive.find(n => n.id === id);
      if (target) {
        archivedItem = {
          ...target,
          isRead: true,
          archivedAt: now,
          archiveReason: 'MANUAL_CLEAR'
        };
      }
      const nextActive = prevActive.filter(n => n.id !== id);
      localStorage.setItem('anuj_active_notifications_v2', JSON.stringify(nextActive));
      return nextActive;
    });

    if (archivedItem) {
      setNotificationHistory(prevHist => {
        const combined = [archivedItem, ...prevHist.filter(h => h.id !== id)];
        const pruned = combined.filter(h => {
          const hTime = h.timestamp || (h.date ? new Date(h.date).getTime() : now);
          return (now - hTime) < TEN_DAYS_MS;
        });
        localStorage.setItem('anuj_notification_history_v2', JSON.stringify(pruned));
        return pruned;
      });
    }

    setToast({ show: true, message: 'Notification moved to History log', type: 'info' });
  }, [TEN_DAYS_MS]);

  // Clear All Notifications -> Moves all active notifications to 10-Day History Queue
  const clearAllNotifications = useCallback(() => {
    const now = Date.now();
    setNotifications(prevActive => {
      if (!prevActive.length) return [];
      const itemsToArchive = prevActive.map(n => ({
        ...n,
        isRead: true,
        archivedAt: now,
        archiveReason: 'MANUAL_CLEAR_ALL'
      }));

      setNotificationHistory(prevHist => {
        const combinedMap = new Map();
        [...itemsToArchive, ...prevHist].forEach(item => {
          if (item && item.id && !combinedMap.has(item.id)) {
            combinedMap.set(item.id, item);
          }
        });

        const pruned = Array.from(combinedMap.values()).filter(h => {
          const hTime = h.timestamp || (h.date ? new Date(h.date).getTime() : now);
          return (now - hTime) < TEN_DAYS_MS;
        });

        localStorage.setItem('anuj_notification_history_v2', JSON.stringify(pruned));
        return pruned;
      });

      localStorage.setItem('anuj_active_notifications_v2', JSON.stringify([]));
      return [];
    });

    setToast({ show: true, message: 'All active notifications moved to Notification History', type: 'info' });
  }, [TEN_DAYS_MS]);

  // Clear History Queue
  const clearNotificationHistory = useCallback(() => {
    setNotificationHistory([]);
    localStorage.setItem('anuj_notification_history_v2', JSON.stringify([]));
    setToast({ show: true, message: 'Notification history purged', type: 'info' });
  }, []);

  const closeOrderSuccessModal = () => {
    setIsOrderSuccessModalOpen(false);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.unitPrice || item.price || 0) * (item.qty || 1)), 0);
  }, [cart]);

  const cartGrandTotal = useMemo(() => {
    return cartSubtotal;
  }, [cartSubtotal]);

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
      notificationHistory,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotification,
      clearAllNotifications,
      clearNotificationHistory,
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
      toggleProductNrp,
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
      saveCustomer,
      updateCustomer,
      deleteCustomer,
      refreshCustomers,
      loadCustomerForOrder,
      reorderPreviousOrder,
      restockProduct,
      adjustProductStock,
      updateProductThreshold,
      language,
      setLanguage,
      toggleLanguage,
      t,
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
