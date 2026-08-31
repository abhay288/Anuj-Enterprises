import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Phone, Mail, MapPin, Clock, MessageSquare, 
  HelpCircle, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2, 
  FileText, Award, Send, ArrowRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { updatePageSEO } from '../../utils/seoUtils';

export const SupportView = () => {
  const { showToast, submitSupportTicket, t, language } = useApp();
  const [openFaq, setOpenFaq] = useState(0);

  React.useEffect(() => {
    updatePageSEO({
      title: 'Support Desk & Wholesale FAQs | Anuj Enterprises Kanpur',
      description: 'Contact Anuj Enterprises B2B trade support. Get assistance with FMCG order dispatches, invoices, and direct settlement collections.',
      url: 'https://anujfmcg.com/#/support',
      breadcrumbs: [
        { name: 'Home', url: 'https://anujfmcg.com/' },
        { name: 'Support & FAQs', url: 'https://anujfmcg.com/#/support' }
      ]
    });
  }, []);
  const [ticketForm, setTicketForm] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Order Dispatch & Tracking',
    priority: 'HIGH',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = language === 'hi' ? [
    {
      q: "डायरेक्ट मंडी कलेक्शन एवं सेटलमेंट प्रक्रिया कैसे काम करती है?",
      a: "जब आप सेल्समैन या पोर्टल के माध्यम से B2B ऑर्डर देते हैं, तो पेंडिंग स्टेटस के साथ एक आधिकारिक इनवॉइस बनता है। जब कानपुर वेयरहाउस से माल आपकी दुकान पर पहुंचता है, तो डिलीवरी प्रतिनिधि भुगतान (कैश, चेक या RTGS) कलेक्ट कर खाता अपडेट कर देता है।"
    },
    {
      q: "दुकानदार वर्गीकरण (सामान्य, डैमेज, एक्सपायरी) का क्या अर्थ है?",
      a: "अनुज एंटरप्राइजेज खातों को 3 श्रेणियों में बांटता है: 1) नॉर्मल ग्राहक: 100% ताजा पैकिंग का नियमित थोक व्यापार; 2) डैमेज ग्राहक: मामूली बाहरी पैकेजिंग डैमेज पर विशेष डिस्काउंट वाला स्टॉक; 3) एक्सपायरी ग्राहक: फास्ट-क्लियरेंस व कंपनी रिप्लेसमेंट प्रोटोकॉल।"
    },
    {
      q: "मैं अपने इनवॉइस को प्रिंट, डाउनलोड या शेयर कैसे कर सकता हूँ?",
      a: "हर ऑर्डर पर तुरंत पक्का B2B इनवॉइस जनरेट होता है। आप इनवॉइस को 1-क्लिक में प्रिंट कर सकते हैं, PDF डाउनलोड कर सकते हैं, या व्हाट्सएप पर सीधे भेज सकते हैं।"
    },
    {
      q: "FMCG थोक ऑर्डर्स के लिए न्यूनतम ऑर्डर मात्रा (MOQ) क्या है?",
      a: "MOQ प्रोडक्ट के अनुसार पैक (सिंगल यूनिट), बंडल (5-6 यूनिट) या मास्टर पेटी / केस (10-24 यूनिट) में निर्धारित होती है। पेटी और बल्क ऑर्डर पर अधिकतम थोक छूट मिलती है।"
    },
    {
      q: "रास्ते में माल टूटने या कमी होने पर क्या करें?",
      a: "सभी माल की वेयरहाउस में 2-पॉइंट जांच होती है। यदि डिलीवरी के समय कोई डैमेज मिले, तो डिलीवरी चालान पर नोट करवाएं और 24 घंटे के भीतर अपने सेल्समैन से संपर्क करें।"
    },
    {
      q: "नया दुकानदार खाता कैसे रजिस्टर करें?",
      a: "अधिकृत सेल्समैन सीधे सेल्समैन पोर्टल > ग्राहक लिस्ट से या चेकआउट के समय नए दुकानदार का पूरा विवरण भरकर नया खाता तुरंत रजिस्टर कर सकते हैं।"
    }
  ] : [
    {
      q: "How does the Direct Mandi Collection and Settlement workflow operate?",
      a: "Upon placing a B2B order through your designated sales representative or the portal, an official Invoice is generated with a collection status of PENDING. When the goods are delivered from our central warehouse to your retail/wholesale store, our delivery agent or field representative completes payment collection (cash, Cheque, or RTGS) and updates the ledger."
    },
    {
      q: "What do Customer Classifications (Normal, Damage, Expiry) mean?",
      a: "Anuj Enterprises classifies accounts into: 1) Normal Customer: Standard trade terms with 100% prime packaging; 2) Damage Customer: Accounts processing packaging returns with pre-authorized inspection discounts; 3) Expiry Customer: Fast-cycle clearances and manufacturer replacement protocols."
    },
    {
      q: "How can I print, download, or share my Invoices?",
      a: "Every order generated on the platform creates an immutable B2B invoice. You can open any invoice from the Order History or Order Success screen to 1-Click Print, Download as a PDF/HTML document, or Share directly to WhatsApp with pre-formatted summaries."
    },
    {
      q: "What is the Minimum Order Quantity (MOQ) for FMCG wholesale orders?",
      a: "MOQs are structured by packaging tiers shown on each product card: Pack (single retail units), Bundle (sub-packs, e.g., 5-6 units), and Case (master shipping cartons, e.g., 10-24 units). High-volume Case orders qualify for maximum wholesale volume discounts."
    },
    {
      q: "What is the protocol for reporting transit damages or shortages?",
      a: "All dispatches undergo strict two-point warehouse inspection. In the rare event of transit damage or seal tampering, note the discrepancy on the physical delivery challan and contact your representative within 24 hours for immediate credit adjustment."
    },
    {
      q: "How do I register a new B2B customer account?",
      a: "Authorized sales representatives can add new retail or institutional accounts directly through the Salesman Portal > Customer Directory, or via the Cart Checkout customer registration module with complete contact and territory details."
    }
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      submitSupportTicket({
        name: ticketForm.name,
        phone: ticketForm.phone,
        email: ticketForm.email,
        category: ticketForm.category,
        priority: ticketForm.priority || 'HIGH',
        message: ticketForm.message
      });
      setIsSubmitting(false);
      setTicketForm({ name: '', phone: '', email: '', category: 'Order Dispatch & Tracking', priority: 'HIGH', message: '' });
    }, 400);
  };

  return (
    <div className="py-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-slate-800 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-extrabold text-[11px] rounded-full uppercase tracking-widest border border-amber-500/30 inline-block">
              {t('nav_support', 'Dedicated B2B Trade Support & Business Information')}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t('support_title', 'How Can We Assist Your Enterprise Today?')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {t('support_subtitle', 'Get immediate assistance with warehouse dispatches, invoices, customer registrations, and direct mandi collections.')}
            </p>
          </div>
        </div>

        {/* Quick Contact Desks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <strong className="block text-slate-900 dark:text-white font-extrabold text-sm">WhatsApp Helpdesk</strong>
            <p className="text-xs text-slate-500">Direct trade priority desk for order updates and invoices.</p>
            <a 
              href="https://wa.me/918887683782" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline block pt-1"
            >
              +91 88876 83782 &rarr;
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-900 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <strong className="block text-slate-900 dark:text-white font-extrabold text-sm">Central Helpline & Support</strong>
            <p className="text-xs text-slate-500">Direct trade line & customer support desk.</p>
            <div className="flex flex-col gap-1 pt-1 text-xs font-bold text-brand-900 dark:text-amber-400">
              <a href="tel:+918887683782" className="hover:underline">
                +91 88876 83782
              </a>
              <a href="tel:+917071979894" className="hover:underline">
                +91 70719 79894 &rarr;
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <strong className="block text-slate-900 dark:text-white font-extrabold text-sm">Dispatch & Invoicing</strong>
            <p className="text-xs text-slate-500">Official billing and ledger reconciliation email desk.</p>
            <a href="mailto:anujenterprises.fmcg.006@gmail.com" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline block pt-1">
              anujenterprises.fmcg.006@gmail.com &rarr;
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <strong className="block text-slate-900 dark:text-white font-extrabold text-sm">Central Logistics Hub</strong>
            <p className="text-xs text-slate-500">Kanpur, Uttar Pradesh.</p>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block pt-1">
              Central Distribution Hub
            </span>
          </div>
        </div>

        {/* Layout: FAQ Accordion + Interactive Help Request Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FAQ Accordion */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              Frequently Asked Questions (Trade FAQ)
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="w-full p-4 text-left font-extrabold text-xs text-slate-900 dark:text-white flex justify-between items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-amber-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Help Request Ticket Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4 h-fit">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                Submit Priority Support Ticket
              </h3>
              <p className="text-xs text-slate-500">
                Direct inquiry routed to our Kanpur central dispatch and customer support desks.
              </p>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name / Retail Shop</label>
                <input
                  type="text"
                  required
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                  placeholder="e.g. Sharma Supermarket"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-black text-amber-500 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      value={ticketForm.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setTicketForm({ ...ticketForm, phone: digits });
                      }}
                      placeholder="98XXXXXXXX"
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    placeholder="shop@store.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Inquiry Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl font-semibold"
                >
                  <option value="Order Dispatch & Tracking">Order Dispatch & Tracking</option>
                  <option value="Invoice Copy">Invoice Copy</option>
                  <option value="Damage / Expiry Replacement">Damage / Expiry Replacement</option>
                  <option value="Bulk Procurement Quote">Bulk Procurement Quote</option>
                  <option value="Salesman Assignment">Salesman Assignment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Describe your request</label>
                <textarea
                  rows={3}
                  required
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  placeholder="Provide Invoice #, SKU, or specific store requirements..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-900 hover:bg-brand-800 text-white font-extrabold rounded-xl shadow flex items-center justify-center gap-1.5 transition-all mt-2"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>{isSubmitting ? 'Transmitting Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
