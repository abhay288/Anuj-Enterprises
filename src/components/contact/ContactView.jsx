import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, ShieldCheck, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ContactView = () => {
  const { showToast } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: 'Bulk Procurement Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Inquiry submitted! Assigned account manager will respond within 2 hours.', 'success');
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      subject: 'Bulk Procurement Inquiry',
      message: ''
    });
  };

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
            Direct Corporate Sales Office
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Connect With Our B2B Account Managers
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            For urgent RFQs, custom rate cards, or credit account setup, reach out directly to our regional distribution hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Send Official Procurement Inquiry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    placeholder="Rajesh Verma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Corporate / Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    placeholder="Tata Steel Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    placeholder="r.verma@tatasteel.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    placeholder="+91 98201 00000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Inquiry / Tender Details</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please specify SKUs required, target delivery dates, and volume quantities..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-amber-400" /> Submit RFQ / Inquiry
              </button>
            </form>
          </div>

          {/* Locations & Interactive Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Regional Distribution Hubs
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-extrabold text-amber-600 block">Headquarters & Central Distribution Hub</span>
                  <p className="text-slate-600 dark:text-slate-300">Kanpur, Uttar Pradesh</p>
                  <p className="text-slate-500 font-mono">Tel: +91 88876 83782 / +91 70719 79894</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-extrabold text-brand-900 dark:text-brand-400 block">Direct Trade & Customer Helpline</span>
                  <p className="text-slate-600 dark:text-slate-300">Priority B2B Account Manager Desk</p>
                  <p className="text-slate-500 font-mono">Mobile / WhatsApp: +91 88876 83782</p>
                </div>
              </div>
            </div>

            {/* Interactive Map Frame */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-2">
                Location Map (Kanpur Central Facility)
              </span>
              <div className="h-48 rounded-2xl overflow-hidden bg-slate-800 relative flex items-center justify-center p-4 text-center">
                <div className="space-y-2 z-10">
                  <MapPin className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                  <span className="text-xs font-bold text-white block">Kanpur, Uttar Pradesh</span>
                  <span className="text-[10px] text-slate-300 block">Central FMCG Distribution Facility</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-brand-950 opacity-90" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
