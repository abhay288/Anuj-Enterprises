import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { QuickViewModal } from './components/common/QuickViewModal';
import { SalesmanLoginModal } from './components/common/SalesmanLoginModal';
import { BottomNav } from './components/common/BottomNav';

import { HomeDashboard } from './components/home/HomeDashboard';
import { ProductGrid } from './components/catalogue/ProductGrid';
import { ProductDetailView } from './components/detail/ProductDetailView';
import { CartView } from './components/cart/CartView';
import { SalesmanDashboard } from './components/salesman/SalesmanDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutView } from './components/about/AboutView';
import { ContactView } from './components/contact/ContactView';
import { SupportView } from './components/support/SupportView';
import { InvoiceModal } from './components/cart/InvoiceModal';
import { OrderSuccessModal } from './components/cart/OrderSuccessModal';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { HeadlineBar } from './components/common/HeadlineBar';
import { LegalView } from './components/legal/LegalView';

const MainContent = () => {
  const { view, isOrderSuccessModalOpen, closeOrderSuccessModal, lastCompletedOrder, headlineConfig } = useApp();
  const hasHeadline = headlineConfig?.isVisible;

  return (
    <div className={`flex flex-col min-h-screen ${hasHeadline ? 'pt-28 sm:pt-30' : 'pt-20 sm:pt-22'} pb-16 md:pb-0 transition-all`}>
      <Navbar />
      <HeadlineBar />
      
      <main className="flex-grow">
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
      </main>

      <Footer />
      <BottomNav />
      <Toast />
      <QuickViewModal />
      <SalesmanLoginModal />
      <InvoiceModal />
      <OrderSuccessModal 
        isOpen={isOrderSuccessModalOpen} 
        onClose={closeOrderSuccessModal} 
        order={lastCompletedOrder} 
      />
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
