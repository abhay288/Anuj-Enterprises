import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Smartphone, ShieldCheck, X, Zap, 
  CheckCircle2, ArrowRight, Share, PlusSquare 
} from 'lucide-react';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA
    const checkStandalone = () => {
      const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches ||
                              window.navigator.standalone === true;
      setIsStandalone(isStandalonePWA);
    };

    checkStandalone();

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user dismissed prompt recently
      const hasDismissed = localStorage.getItem('anuj_pwa_prompt_dismissed');
      if (!hasDismissed) {
        // Delayed reveal for smooth user onboarding
        setTimeout(() => setShowPrompt(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, offer gentle PWA prompt if not dismissed
    if (isIosDevice && !isStandalone) {
      const hasDismissed = localStorage.getItem('anuj_pwa_prompt_dismissed');
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 3500);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      // Fallback message
      alert("To install the Anuj Enterprises PWA app, open your browser menu and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('anuj_pwa_prompt_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* PWA INSTALL PROMPT POPUP / MODAL */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md z-50 bg-slate-900/95 backdrop-blur-2xl text-white rounded-3xl p-5 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 ring-4 ring-slate-950/50"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Official PWA Logo Badge */}
              <div className="flex items-center gap-3.5">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-amber-400 shadow-xl flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-amber-500/20">
                    <img 
                      src="/pwa-192x192.png" 
                      alt="Anuj Enterprises PWA Logo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border-2 border-slate-900 shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-tight text-white">ANUJ ENTERPRISES</span>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-amber-400/30">
                      PWA APP
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Install official app for 1-tap ordering & fast access
                  </p>
                </div>
              </div>

              {/* Close / Dismiss */}
              <button 
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* App Features List */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-300">
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 flex flex-col items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Load</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 flex flex-col items-center gap-1">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Fast & Fluid</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Net-30 Orders</span>
              </div>
            </div>

            {/* iOS Specific Instructions Accordion */}
            {showIOSInstructions && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 space-y-2"
              >
                <p className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Share className="w-4 h-4" /> Install on iPhone / iPad:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                  <li>Tap the <strong>Share</strong> button in Safari toolbar.</li>
                  <li>Scroll down and select <strong className="text-white flex-inline items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline mx-0.5" /> Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong> to complete installation.</li>
                </ol>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all group"
              >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                <span>Install PWA App</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleDismiss}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Not Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
