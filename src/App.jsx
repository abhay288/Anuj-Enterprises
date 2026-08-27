import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { BottomNav } from './components/common/BottomNav';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { HeadlineBar } from './components/common/HeadlineBar';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';

// Lazy Loaded Dynamic Routes & Heavy Modals for Maximum Core Web Vitals
const HomeDashboard = lazy(() => import('./components/home/HomeDashboard').then(m => ({ default: m.HomeDashboard })));
const ProductGrid = lazy(() => import('./components/catalogue/ProductGrid').then(m => ({ default: m.ProductGrid })));
const ProductDetailView = lazy(() => import('./components/detail/ProductDetailView').then(m => ({ default: m.ProductDetailView })));
const CartView = lazy(() => import('./components/cart/CartView').then(m => ({ default: m.CartView })));
const SalesmanDashboard = lazy(() => import('./components/salesman/SalesmanDashboard').then(m => ({ default: m.SalesmanDashboard })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AboutView = lazy(() => import('./components/about/AboutView').then(m => ({ default: m.AboutView })));
const SupportView = lazy(() => import('./components/support/SupportView').then(m => ({ default: m.SupportView })));
const LegalView = lazy(() => import('./components/legal/LegalView').then(m => ({ default: m.LegalView })));

const QuickViewModal = lazy(() => import('./components/common/QuickViewModal').then(m => ({ default: m.QuickViewModal })));
const SalesmanLoginModal = lazy(() => import('./components/common/SalesmanLoginModal').then(m => ({ default: m.SalesmanLoginModal })));
const InvoiceModal = lazy(() => import('./components/cart/InvoiceModal').then(m => ({ default: m.InvoiceModal })));
const OrderSuccessModal = lazy(() => import('./components/cart/OrderSuccessModal').then(m => ({ default: m.OrderSuccessModal })));

// Lightweight Route Transition Skeleton
const RouteLoadingFallback = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-64"></div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      ))}
    </div>
  </div>
);

const MainContent = () => {
  const { view, isOrderSuccessModalOpen, closeOrderSuccessModal, lastCompletedOrder, headlineConfig } = useApp();
  const hasHeadline = headlineConfig?.isVisible;

  return (
    <div className={`flex flex-col min-h-screen ${hasHeadline ? 'pt-28 sm:pt-30' : 'pt-20 sm:pt-22'} pb-16 md:pb-0 transition-all`}>
      <Navbar />
      <HeadlineBar />
      
      <main className="flex-grow">
        <Suspense fallback={<RouteLoadingFallback />}>
          {view === 'home' && <HomeDashboard />}
          {view === 'catalogue' && <ProductGrid />}
          {view === 'product-detail' && <ProductDetailView />}
          {view === 'cart' && <CartView />}
          {(view === 'salesman-dash' || view === 'salesman') && <SalesmanDashboard />}
          {(view === 'admin-dash' || view === 'admin') && <AdminDashboard />}
          {view === 'about' && <AboutView />}
          {(view === 'contact' || view === 'support') && <SupportView />}
          {view === 'privacy-policy' && <LegalView initialTab="privacy" />}
          {view === 'terms-of-supply' && <LegalView initialTab="terms" />}
          {view === 'return-policy' && <LegalView initialTab="returns" />}
          {view === 'legal' && <LegalView initialTab="privacy" />}
        </Suspense>
      </main>

      <Footer />
      <BottomNav />
      <Toast />
      <PWAInstallPrompt />
      
      {/* Lazy Modals */}
      <Suspense fallback={null}>
        <QuickViewModal />
        <SalesmanLoginModal />
        <InvoiceModal />
        <OrderSuccessModal 
          isOpen={isOrderSuccessModalOpen} 
          onClose={closeOrderSuccessModal} 
          order={lastCompletedOrder} 
        />
      </Suspense>

      <WhatsAppFloatingButton />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
