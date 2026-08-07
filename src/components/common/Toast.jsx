import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast = () => {
  const context = useApp();
  const toast = context?.toast;

  if (!toast?.show) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-brand-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/80';
      case 'warning':
        return 'border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/80';
      case 'error':
        return 'border-red-500/30 bg-red-50/90 dark:bg-red-950/80';
      default:
        return 'border-brand-500/30 bg-brand-50/90 dark:bg-brand-950/80';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 max-w-md"
      >
        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-premium backdrop-blur-md ${getBorderColor()}`}>
          {getIcon()}
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 pr-2">
            {toast.message}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
