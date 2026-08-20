import React, { useState } from 'react';
import { 
  Building2, Phone, Mail, MapPin, Clock, ShieldCheck, 
  Send, ArrowUpRight, Facebook, Twitter, Linkedin, Instagram, Youtube 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer = () => {
  const { navigateTo, filterByCategory, categories, showToast } = useApp();
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
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-amber-500/60 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg relative">
                <img src="/logo.png" alt="Anuj Enterprises" className="w-full h-full object-contain scale-[1.9]" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">ANUJ ENTERPRISES</span>
                <span className="text-[10px] sm:text-xs text-amber-400 block font-bold tracking-widest uppercase mt-0.5">
                  Your Trusted Supply Partner
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Anuj Enterprises is India's premier B2B industrial distributor, powering OEMs, EPC contractors, steel mills, and manufacturing plants with certified FMCG, tools, and equipment.
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

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-3">
              {[Linkedin, Facebook, Twitter, Instagram, Youtube].map((Icon, idx) => (
                <a 
                  key={idx} 
                  href="#social" 
                  onClick={(e) => { e.preventDefault(); showToast('Connecting to Social Channel...', 'info'); }}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-brand-900 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-colors border border-slate-800"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Enterprise Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {['Home', 'Products Catalogue', 'About Us', 'Support & FAQ', 'Contact HQ'].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      if (item === 'Home') navigateTo('home');
                      else if (item === 'Products Catalogue') navigateTo('catalogue');
                      else if (item === 'About Us') navigateTo('about');
                      else if (item === 'Support & FAQ') navigateTo('support');
                      else if (item === 'Contact HQ') navigateTo('support');
                    }}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 group"
                  >
                    <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Top Industrial Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
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

          {/* Col 4: Contact HQ & Map Placeholder */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Corporate Headquarters
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Kanpur, Uttar Pradesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+918887683782" className="hover:text-amber-400 transition-colors">
                  +91 88876 83782 / +91 70719 79894
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:anujenterprises.fmcg.006@gmail.com" className="hover:text-amber-400 transition-colors">
                  anujenterprises.fmcg.006@gmail.com
                </a>
              </div>
            </div>

            {/* Google Map Placeholder */}
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-2 relative group">
              <div className="h-20 w-full bg-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-2">
                <MapPin className="w-5 h-5 text-amber-400 animate-bounce mb-1" />
                <span className="text-[10px] text-slate-300 font-bold">Kanpur HQ & Central Dispatch Hub</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>© 2026 Anuj Enterprises. All Rights Reserved.</span>
            <span>•</span>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast('Privacy Policy: Strict B2B Data Encryption', 'info'); }} className="hover:text-amber-400">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" onClick={(e) => { e.preventDefault(); showToast('Terms of B2B Supply: Net 30 Credit Policy Applies', 'info'); }} className="hover:text-amber-400">Terms of Supply</a>
            <span>•</span>
            <a href="#refund" onClick={(e) => { e.preventDefault(); showToast('GST Replacement Guarantee on Defective Goods', 'info'); }} className="hover:text-amber-400">Return Policy</a>
          </div>
          <div className="text-slate-400 text-xs">
            Official B2B FMCG Distribution & Sourcing Platform
          </div>
        </div>
      </div>
    </footer>
  );
};
