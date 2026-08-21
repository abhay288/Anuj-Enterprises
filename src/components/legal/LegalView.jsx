import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, FileText, RotateCcw, Search, Printer, 
  Download, ArrowRight, CheckCircle2, AlertTriangle, 
  MapPin, Phone, Mail, Clock, Scale, Building2, 
  Edit3, ChevronRight, Lock, Sparkles, HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LegalView = ({ initialTab = 'privacy' }) => {
  const { legalPolicies, user, navigateTo, showToast } = useApp();
  
  // Tab can be 'privacy' | 'terms' | 'returns'
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(null);

  const policy = legalPolicies?.[activeTab] || legalPolicies?.privacy;

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!policy?.sections) return [];
    if (!searchQuery.trim()) return policy.sections;
    const q = searchQuery.toLowerCase();
    return policy.sections.filter(s => 
      s.heading.toLowerCase().includes(q) || 
      s.content.toLowerCase().includes(q) ||
      s.keyPoints?.some(kp => kp.toLowerCase().includes(q))
    );
  }, [policy, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 print:bg-white print:text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 print:hidden">
          <button onClick={() => navigateTo('home')} className="hover:text-amber-500 font-bold">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Compliance & Legal Center</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-extrabold text-brand-900 dark:text-amber-400">{policy.title}</span>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:bg-none print:text-black">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  Statutory B2B Trade Compliance
                </span>
                <span className="text-xs text-slate-300 font-mono">Ver: {policy.version}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white print:text-black">
                {policy.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 print:text-slate-700 font-medium leading-relaxed">
                {policy.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Last Updated: <strong className="text-white print:text-black">{policy.lastUpdated}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Jurisdiction: <strong className="text-white print:text-black">{policy.jurisdiction}</strong>
                </span>
              </div>
            </div>

            {/* Print & Action Controls */}
            <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 shadow flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4 text-amber-400" /> Print Official Copy
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => navigateTo('admin-dash')}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-2 transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit in Admin Portal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          {[
            { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, desc: 'B2B Data Encryption & Security' },
            { id: 'terms', label: 'Terms of Supply', icon: FileText, desc: 'Commercial Wholesale Trade Terms' },
            { id: 'returns', label: 'Return & Claims Policy', icon: RotateCcw, desc: 'Quality Guarantee & Replacement Dockets' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 min-w-[200px] p-3 rounded-xl font-extrabold text-xs transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-brand-900 text-white dark:bg-brand-700 shadow-md scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold leading-tight">{tab.label}</span>
                  <span className={`text-[10px] font-normal block mt-0.5 ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Layout: Sidebar + Document Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Quick Navigation & Search Sidebar */}
          <div className="lg:col-span-4 space-y-6 print:hidden sticky top-24">
            
            {/* Search within policy */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Search Clauses & Keywords
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. GST, Expiry, Credit, Kanpur..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Table of Contents */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
                <span>Table of Contents</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                  {policy.sections?.length || 0} Sections
                </span>
              </h3>

              <div className="space-y-1 text-xs max-h-[50vh] overflow-y-auto pr-1">
                {policy.sections?.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSectionId(section.id);
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`p-2 rounded-xl block font-bold transition-all text-xs ${
                      activeSectionId === section.id
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-l-2 border-amber-500 pl-3'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="font-mono text-slate-400 mr-2">§{section.number}</span>
                    <span>{section.heading}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Official Support & Help Card */}
            <div className="p-5 bg-gradient-to-br from-brand-950 via-slate-900 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Legal & Compliance Desk
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Have specific commercial supply inquiries or require custom institutional contracts? Contact our compliance desk in Kanpur.
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>+91 88876 83782 / +91 70719 79894</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-brand-400" />
                  <span>anujenterprises.fmcg.006@gmail.com</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Full Document Body */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Executive Summary Card */}
            <div className="p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Executive Commercial Summary
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {policy.summary}
              </p>
            </div>

            {/* Policy Sections */}
            {filteredSections.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <Search className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">No Matching Clauses Found</h4>
                <p className="text-xs text-slate-500">No sections matched your search keyword "{searchQuery}".</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-brand-900 text-white rounded-xl text-xs font-bold"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              filteredSections.map(section => (
                <section
                  key={section.id}
                  id={section.id}
                  className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 scroll-mt-28 print:shadow-none print:border-b print:rounded-none"
                >
                  <div className="flex items-baseline gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-brand-50 dark:bg-slate-800 text-brand-900 dark:text-amber-400 font-mono font-black text-xs">
                      §{section.number}
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {section.heading}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {section.content}
                  </p>

                  {/* Key Bullet Points */}
                  {section.keyPoints && section.keyPoints.length > 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Operational Clauses & Highlights:
                      </span>
                      <ul className="space-y-2 text-xs">
                        {section.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Optional Alert Note */}
                  {section.alertNote && (
                    <div className="p-3.5 bg-red-500/10 dark:bg-red-950/20 rounded-2xl border border-red-500/30 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-red-900 dark:text-red-300">
                        {section.alertNote}
                      </p>
                    </div>
                  )}
                </section>
              ))
            )}

            {/* Official Kanpur Jurisdiction Seal Card */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3 text-center print:bg-white print:text-black">
              <Building2 className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="text-sm font-extrabold">Anuj Enterprises — Central FMCG Distribution Hub</h4>
              <p className="text-xs text-slate-400 print:text-slate-600 max-w-lg mx-auto">
                Transport Nagar / Industrial Area, Kanpur, Uttar Pradesh — 208001. All transactions are governed strictly by the commercial laws of India and subject to exclusive Kanpur Jurisdiction.
              </p>
              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                Document Auth Hash: AE-LEGAL-2026-KANPUR-VERIFIED
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
