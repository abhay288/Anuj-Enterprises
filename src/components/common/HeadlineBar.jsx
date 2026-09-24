import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Sparkles, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeadlineBar = () => {
  const { headlineConfig, isHeadlineDismissed, dismissHeadline } = useApp();

  if (!headlineConfig || !headlineConfig.isVisible || isHeadlineDismissed) {
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
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`w-full border-t ${style.border} ${style.bg} py-1.5 sm:py-2 px-3 sm:px-6 shadow-xs transition-all`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 text-xs">
          
          {/* Badge & Continuous Scrolling Headline Text */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden min-w-0">
            {/* Pulsing Alert Tag */}
            <span className={`px-2 py-0.5 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs ${style.badge} z-10`}>
              <Megaphone className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse" />
              <span className="truncate max-w-[120px] sm:max-w-none">{headlineConfig.tag || 'ANNOUNCEMENT'}</span>
            </span>

            {/* Continuous Marquee Text Container */}
            <div className="overflow-hidden flex-1 relative select-none min-w-0">
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="https://wa.me/918887683782?text=Hello%20Anuj%20Enterprises,%20I%20am%20inquiring%20about%20the%20latest%20FMCG%20wholesale%20announcement."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] sm:text-[11px] transition-colors shadow-xs shrink-0 whitespace-nowrap"
              title="WhatsApp Inquiry"
            >
              <MessageSquare className="w-3 h-3 shrink-0" />
              <span>WhatsApp Inquiry</span>
            </a>

            <button
              onClick={dismissHeadline}
              aria-label="Dismiss announcement"
              title="Dismiss announcement"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
