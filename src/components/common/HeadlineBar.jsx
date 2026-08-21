import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, ArrowRight, Sparkles, AlertCircle, Phone, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeadlineBar = () => {
  const { headlineConfig } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!headlineConfig || !headlineConfig.isVisible || isDismissed) {
    return null;
  }

  const variantStyles = {
    amber: {
      bg: "bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 dark:from-amber-950/70 dark:via-slate-900/90 dark:to-amber-950/70",
      border: "border-amber-500/30 dark:border-amber-500/40",
      badge: "bg-amber-500 text-slate-950 shadow-amber-500/20",
      text: "text-slate-800 dark:text-amber-100",
      accent: "text-amber-600 dark:text-amber-400"
    },
    blue: {
      bg: "bg-gradient-to-r from-blue-500/15 via-brand-500/10 to-blue-500/15 dark:from-slate-900 dark:via-brand-950/80 dark:to-slate-900",
      border: "border-blue-500/30 dark:border-blue-500/40",
      badge: "bg-blue-600 text-white shadow-blue-600/20",
      text: "text-slate-800 dark:text-blue-100",
      accent: "text-blue-600 dark:text-blue-400"
    },
    emerald: {
      bg: "bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-500/15 dark:from-emerald-950/70 dark:via-slate-900/90 dark:to-emerald-950/70",
      border: "border-emerald-500/30 dark:border-emerald-500/40",
      badge: "bg-emerald-600 text-white shadow-emerald-600/20",
      text: "text-slate-800 dark:text-emerald-100",
      accent: "text-emerald-600 dark:text-emerald-400"
    }
  };

  const style = variantStyles[headlineConfig.variant] || variantStyles.amber;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`fixed top-20 sm:top-22 left-0 right-0 z-40 w-full backdrop-blur-xl border-b ${style.border} ${style.bg} py-2 px-3 sm:px-6 shadow-sm transition-all`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          
          {/* Badge & Continuous Scrolling Headline Text */}
          <div className="flex items-center gap-3 flex-1 overflow-hidden min-w-0">
            {/* Pulsing Alert Tag */}
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-sm ${style.badge} z-10`}>
              <Megaphone className="w-3 h-3 animate-pulse" />
              <span>{headlineConfig.tag || 'ANNOUNCEMENT'}</span>
            </span>

            {/* Continuous Marquee Text Container */}
            <div className="overflow-hidden flex-1 relative select-none">
              <div className="animate-marquee whitespace-nowrap flex items-center">
                <span className={`font-extrabold text-xs sm:text-sm tracking-tight ${style.text} pr-20 inline-flex items-center gap-2`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {headlineConfig.text}
                </span>
                <span className={`font-extrabold text-xs sm:text-sm tracking-tight ${style.text} pr-20 inline-flex items-center gap-2`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {headlineConfig.text}
                </span>
                <span className={`font-extrabold text-xs sm:text-sm tracking-tight ${style.text} pr-20 inline-flex items-center gap-2`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {headlineConfig.text}
                </span>
                <span className={`font-extrabold text-xs sm:text-sm tracking-tight ${style.text} pr-20 inline-flex items-center gap-2`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {headlineConfig.text}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Links & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://wa.me/918887683782?text=Hello%20Anuj%20Enterprises,%20I%20am%20inquiring%20about%20the%20latest%20FMCG%20wholesale%20announcement."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors shadow-sm"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp Inquiry</span>
            </a>

            <button
              onClick={() => setIsDismissed(true)}
              title="Dismiss announcement"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
