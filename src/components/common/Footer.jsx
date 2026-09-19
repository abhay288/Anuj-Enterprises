import React, { useState } from 'react';
import { 
  Building2, Phone, Mail, MapPin, Clock, ShieldCheck, 
  Send, ArrowUpRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer = () => {
  const { navigateTo, filterByCategory, categories, showToast, t } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast('Thank you for subscribing to Anuj Enterprises B2B Industrial Insights!', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-800 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Company Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-amber-400/80 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md relative">
                <picture>
                  <source srcSet="/logo.webp" type="image/webp" />
                  <img src="/logo.png" alt="Anuj Enterprises" className="w-full h-full object-contain" width="44" height="44" loading="lazy" />
                </picture>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">ANUJ ENTERPRISES</span>
                <span className="text-[10px] text-amber-400 block font-bold tracking-widest uppercase mt-0.5">
                  {t('footer_tagline', 'Your Trusted Supply Partner')}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              {t('gst_registered', 'India\'s industrial workforce runs on reliable supply. Anuj Enterprises delivers bulk FMCG — branded, certified, and straight to your site.')}
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified B2B Industrial Supply Partner</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Working Hours: Mon - Sat (9:00 AM - 7:00 PM IST)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              {t('enterprise_navigation', 'Enterprise Navigation')}
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: t('nav_home', 'Home'), viewName: 'home' },
                { name: t('nav_products', 'Products Catalogue'), viewName: 'catalogue' },
                { name: t('nav_about', 'About Us'), viewName: 'about' },
                { name: t('nav_support', 'Support & FAQ'), viewName: 'support' },
                { name: t('nav_contact', 'Contact Us'), viewName: 'support' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigateTo(item.viewName)}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              {t('top_categories', 'Top Industrial Categories')}
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map((cat, idx) => (
                <li key={cat._id || cat.id || cat.name || idx}>
                  <button
                    onClick={() => filterByCategory(cat.name)}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact HQ */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              {t('corporate_hq', 'Corporate Headquarters')}
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium text-slate-300">
                  {t('office_address', 'Anand Vihar Society, Koyla Nagar, Kanpur, Uttar Pradesh - 208021')}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex flex-col text-slate-300 font-semibold">
                  <a href="tel:+918887683782" className="hover:text-amber-400 transition-colors whitespace-nowrap block">
                    +91 88876 83782
                  </a>
                  <a href="tel:+917071979894" className="hover:text-amber-400 transition-colors whitespace-nowrap block">
                    +91 70719 79894
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:anujenterprises.fmcg.006@gmail.com" className="hover:text-amber-400 transition-colors">
                  anujenterprises.fmcg.006@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>{t('copyright', '© 2026 Anuj Enterprises. All Rights Reserved.')}</span>
            <span>•</span>
            <button 
              onClick={() => { navigateTo('privacy-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="hover:text-amber-400 transition-colors font-medium"
            >
              {t('privacy_policy', 'Privacy Policy')}
            </button>
            <span>•</span>
            <button 
              onClick={() => { navigateTo('terms-of-supply'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="hover:text-amber-400 transition-colors font-medium"
            >
              {t('terms_of_supply', 'Terms of Supply')}
            </button>
            <span>•</span>
            <button 
              onClick={() => { navigateTo('return-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              className="hover:text-amber-400 transition-colors font-medium"
            >
              {t('return_policy', 'Return & Claims Policy')}
            </button>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span>{t('official_platform_notice', 'Official B2B FMCG Distribution Platform • Kanpur')}</span>
          </div>
        </div>
      </div>

      {/* Elegant Small Background Watermark */}
      <div 
        aria-hidden="true"
        className="absolute bottom-2 left-0 right-0 flex justify-center items-center pointer-events-none select-none overflow-hidden opacity-[0.02] dark:opacity-[0.03]"
      >
        <span className="text-[2.5rem] sm:text-[3.5rem] font-black tracking-widest text-amber-400 uppercase whitespace-nowrap leading-none">
          ANUJ ENTERPRISES
        </span>
      </div>
    </footer>
  );
};
