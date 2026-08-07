import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { QuickViewModal } from './components/common/QuickViewModal';
import { SalesmanLoginModal } from './components/common/SalesmanLoginModal';

import { HeroSection } from './components/home/HeroSection';
import { StatsSection } from './components/home/StatsSection';
import { BrandTicker } from './components/home/BrandTicker';
import { CategoriesSection } from './components/home/CategoriesSection';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { WhyChooseUs } from './components/home/WhyChooseUs';
import { Testimonials } from './components/home/Testimonials';

import { ProductGrid } from './components/catalogue/ProductGrid';
import { ProductDetailView } from './components/detail/ProductDetailView';
import { CartView } from './components/cart/CartView';
import { SalesmanDashboard } from './components/salesman/SalesmanDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutView } from './components/about/AboutView';
import { ContactView } from './components/contact/ContactView';

const MainContent = () => {
  const { view } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <HeroSection />
            <StatsSection />
            <BrandTicker />
            <CategoriesSection />
            <FeaturedProducts />
            <WhyChooseUs />
            <Testimonials />
          </>
        )}

        {view === 'catalogue' && <ProductGrid />}
        {view === 'product-detail' && <ProductDetailView />}
        {view === 'cart' && <CartView />}
        {view === 'salesman-dash' && <SalesmanDashboard />}
        {view === 'admin-dash' && <AdminDashboard />}
        {view === 'about' && <AboutView />}
        {view === 'contact' && <ContactView />}
      </main>

      <Footer />
      <Toast />
      <QuickViewModal />
      <SalesmanLoginModal />
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
