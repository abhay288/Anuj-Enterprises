import React from 'react';
import { 
  Home, Grid, Search, ShoppingCart, User, Package, 
  FileText, LayoutDashboard, Layers, ShoppingBag 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav = () => {
  const { 
    view, 
    navigateTo, 
    user, 
    cartTotalQty, 
    setIsSalesmanModalOpen, 
    setIsMobileFilterOpen 
  } = useApp();

  // Role-Aware Navigation Tabs (Requirement 2)
  const getTabs = () => {
    // SALESMAN TABS: Home, Products, Orders, Invoices, Profile
    if (user.role === 'salesman') {
      return [
        { id: 'home', label: 'Home', icon: Home, action: () => navigateTo('home'), active: view === 'home' },
        { id: 'catalogue', label: 'Products', icon: Package, action: () => navigateTo('catalogue'), active: view === 'catalogue' },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, action: () => navigateTo('salesman-dash'), active: view === 'salesman-dash' },
        { id: 'invoices', label: 'Invoices', icon: FileText, action: () => navigateTo('salesman-dash'), active: false },
        { id: 'profile', label: 'Profile', icon: User, action: () => setIsSalesmanModalOpen(true), active: false },
      ];
    }

    // ADMIN TABS: Dashboard, Orders, Products, Brands, Profile
    if (user.role === 'admin') {
      return [
        { id: 'admin-dash', label: 'Dashboard', icon: LayoutDashboard, action: () => navigateTo('admin-dash'), active: view === 'admin-dash' },
        { id: 'orders', label: 'Orders', icon: FileText, action: () => navigateTo('admin-dash'), active: false },
        { id: 'products', label: 'Products', icon: Package, action: () => navigateTo('catalogue'), active: view === 'catalogue' },
        { id: 'brands', label: 'Brands', icon: Layers, action: () => navigateTo('admin-dash'), active: false },
        { id: 'profile', label: 'Profile', icon: User, action: () => setIsSalesmanModalOpen(true), active: false },
      ];
    }

    // NORMAL USER / GUEST TABS: Home, Categories, Search, Cart, Profile
    return [
      { id: 'home', label: 'Home', icon: Home, action: () => navigateTo('home'), active: view === 'home' },
      { id: 'categories', label: 'Categories', icon: Grid, action: () => { navigateTo('catalogue'); setIsMobileFilterOpen(true); }, active: view === 'catalogue' },
      { id: 'search', label: 'Search', icon: Search, action: () => navigateTo('catalogue'), active: false },
      { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartTotalQty, action: () => navigateTo('cart'), active: view === 'cart' },
      { id: 'profile', label: 'Profile', icon: User, action: () => setIsSalesmanModalOpen(true), active: false },
    ];
  };

  const tabs = getTabs();

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-2xl"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.active;

          return (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive 
                  ? 'text-brand-900 dark:text-amber-400 font-extrabold scale-105' 
                  : 'text-slate-500 dark:text-slate-400 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
