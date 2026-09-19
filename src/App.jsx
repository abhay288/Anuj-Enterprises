import React, { Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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
const CustomerDashboard = lazy(() => import('./components/customer/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
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

// Global Resilient Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Anuj Enterprises App Render Error caught by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Anuj Enterprises B2B Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A temporary display or network event occurred. Your session and data remain fully secure and protected.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all"
              >
                🔄 Refresh Portal
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('anuj_products_v3');
                    localStorage.removeItem('anuj_deleted_skus_v2');
                    localStorage.removeItem('anuj_active_filter_v2');
                  } catch (e) {}
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
              >
                🧹 Clear Stale Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainContent = () => {
  const { view, isOrderSuccessModalOpen, closeOrderSuccessModal, lastCompletedOrder, headlineConfig } = useApp();
  const hasHeadline = headlineConfig?.isVisible;

  return (
    <div className={`flex flex-col min-h-screen ${hasHeadline ? 'pt-28 sm:pt-30' : 'pt-20 sm:pt-22'} pb-16 md:pb-0 transition-all`}>
      <Navbar />
      <HeadlineBar />
      
      <main className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback />}>
            {view === 'home' && <HomeDashboard />}
            {view === 'catalogue' && <ProductGrid />}
            {view === 'product-detail' && <ProductDetailView />}
            {view === 'cart' && <CartView />}
            {(view === 'customer-dash' || view === 'customer' || view === 'user-dash' || view === 'profile') && <CustomerDashboard />}
            {(view === 'salesman-dash' || view === 'salesman') && <SalesmanDashboard />}
            {(view === 'admin-dash' || view === 'admin') && <AdminDashboard />}
            {view === 'about' && <AboutView />}
            {(view === 'contact' || view === 'support') && <SupportView />}
            {view === 'privacy-policy' && <LegalView initialTab="privacy" />}
            {view === 'terms-of-supply' && <LegalView initialTab="terms" />}
            {view === 'return-policy' && <LegalView initialTab="returns" />}
            {view === 'legal' && <LegalView initialTab="privacy" />}
          </Suspense>
        </ErrorBoundary>
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
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
        <Analytics />
        <SpeedInsights />
      </AppProvider>
    </ErrorBoundary>
  );
}
