import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_BRANDS, 
  INITIAL_SALESMEN, 
  INITIAL_ORDERS 
} from '../data/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('anuj_products_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('anuj_categories_v2');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('anuj_brands_v2');
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });

  const [salesmen, setSalesmen] = useState(() => {
    const saved = localStorage.getItem('anuj_salesmen_v2');
    return saved ? JSON.parse(saved) : INITIAL_SALESMEN;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('anuj_orders_v2');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

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

  const [view, setView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState('prod-fmcg-101');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Popups State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSalesmanModalOpen, setIsSalesmanModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Toast System
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('anuj_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('anuj_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('anuj_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('anuj_user', JSON.stringify(user));
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const navigateTo = (targetView, productId = null) => {
    if (productId) {
      setSelectedProductId(productId);
    }
    setView(targetView);
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
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const newCart = [...prev];
        const newQty = newCart[existingIndex].qty + qty;
        newCart[existingIndex].qty = newQty;
        newCart[existingIndex].unitPrice = getTierPrice(product, newQty);
        return newCart;
      } else {
        const unitPrice = getTierPrice(product, qty);
        return [...prev, { product, qty, unitPrice }];
      }
    });
    showToast(`Added ${qty}x ${product.name.slice(0, 30)}... to FMCG Cart`, 'success');
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.qty + delta);
          const unitPrice = getTierPrice(item.product, newQty);
          return { ...item, qty: newQty, unitPrice };
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

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to FMCG Wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  // Auth Operations
  const loginSalesman = (salesmanId, password) => {
    const found = salesmen.find(s => s.id.toLowerCase() === salesmanId.toLowerCase());
    if (found || salesmanId.toUpperCase() === 'SLS-101' || salesmanId.toUpperCase() === 'SLS-DEMO') {
      const sUser = found || salesmen[0];
      setUser({
        role: 'salesman',
        name: sUser.name,
        salesmanId: sUser.id,
        email: sUser.email,
        phone: sUser.phone,
        region: sUser.region
      });
      setIsSalesmanModalOpen(false);
      showToast(`Welcome, ${sUser.name}! FMCG Salesman Session Activated.`, 'success');
      return true;
    } else {
      showToast('Invalid Salesman ID or Password. Try SLS-101', 'error');
      return false;
    }
  };

  const loginAdmin = () => {
    setUser({
      role: 'admin',
      name: 'Anuj Sharma (Managing Director)',
      email: 'md@anujenterprises.com'
    });
    showToast('Enterprise Admin Session Granted', 'success');
    navigateTo('admin-dash');
  };

  const logout = () => {
    setUser({ role: 'guest', name: 'Guest Visitor' });
    showToast('Logged out of B2B Session', 'info');
    navigateTo('home');
  };

  // Quick View Modal
  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // Invoice Modal
  const openInvoiceModal = (order) => {
    setSelectedInvoice(order);
    setIsInvoiceModalOpen(true);
  };

  const closeInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
  };

  // Place Order
  const checkoutOrder = (customerDetails) => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'warning');
      return;
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
    const cgst = Math.round(subtotal * 0.09);
    const sgst = Math.round(subtotal * 0.09);
    const grandTotal = subtotal + cgst + sgst;

    const newInvoiceId = `INV-2026-FMCG-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = {
      id: newInvoiceId,
      date: new Date().toISOString().split('T')[0],
      customerName: customerDetails.companyName || "Reliance Retail Wholesale Chains",
      customerGstin: customerDetails.gstin || "27AAACR4412P1ZX",
      customerAddress: customerDetails.address || "Bhiwandi Central FMCG Logistics Hub, Thane, Maharashtra",
      salesmanId: user.salesmanId || "SLS-101",
      salesmanName: user.name || "Vikram Malhotra",
      salesmanPhone: user.phone || "+91 98201 44512",
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        hsn: item.product.hsn,
        qty: item.qty,
        price: item.unitPrice
      })),
      subtotal,
      cgst,
      sgst,
      totalGst: cgst + sgst,
      grandTotal,
      status: "Invoiced",
      paymentMode: customerDetails.paymentMode || "Net 30 Days B2B Credit"
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti triggered');
    }

    showToast(`B2B FMCG Order #${newInvoiceId} Placed Successfully!`, 'success');
    openInvoiceModal(newOrder);
  };

  // Product Admin Operations
  const addProduct = (newProd) => {
    const formatted = {
      ...newProd,
      id: `prod-fmcg-${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
      gallery: [newProd.image]
    };
    setProducts(prev => [formatted, ...prev]);
    showToast(`FMCG Product "${newProd.name.slice(0, 25)}" added to catalog`, 'success');
  };

  const updateProduct = (updatedProd) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    showToast(`Product updated successfully`, 'success');
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product deleted from inventory', 'warning');
  };

  const bulkAddProducts = (newProductsList) => {
    setProducts(prev => [...newProductsList, ...prev]);
    showToast(`Successfully bulk imported ${newProductsList.length} FMCG products!`, 'success');
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const cartGst = Math.round(cartSubtotal * 0.18);
  const cartGrandTotal = cartSubtotal + cartGst;
  const cartTotalQty = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <AppContext.Provider value={{
      products,
      categories,
      brands,
      salesmen,
      orders,
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
      isInvoiceModalOpen,
      selectedInvoice,
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
      toggleWishlist,
      loginSalesman,
      loginAdmin,
      logout,
      openQuickView,
      closeQuickView,
      openInvoiceModal,
      closeInvoiceModal,
      setIsSalesmanModalOpen,
      checkoutOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      bulkAddProducts,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
