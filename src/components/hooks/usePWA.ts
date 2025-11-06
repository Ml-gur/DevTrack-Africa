import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<void>;
  dismissInstall: () => void;
}

export function usePWA(): PWAState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIOS] = useState(/iPad|iPhone|iPod/.test(navigator.userAgent));

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Listen for online/offline changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted install prompt');
    }

    setDeferredPrompt(null);
  };

  const dismissInstall = () => {
    setDeferredPrompt(null);
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    isOnline,
    isIOS,
    promptInstall,
    dismissInstall
  };
}

// Service Worker registration hook
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Only register service worker in production or on localhost
      const isProduction = window.location.protocol === 'https:' || 
                          window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';
      
      // Don't register in Figma preview or other iframe contexts
      const isFigmaPreview = window.location.hostname.includes('figma');
      
      if (!isProduction || isFigmaPreview) {
        console.log('[PWA] Service Worker registration skipped (not in production or in Figma preview)');
        return;
      }

      // Register service worker
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg);
          setRegistration(reg);

          // Check for updates periodically
          const updateInterval = setInterval(() => {
            reg.update();
          }, 60 * 60 * 1000); // Check every hour

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Cleanup interval on unmount
          return () => clearInterval(updateInterval);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error.message);
          // Don't show error to user - service worker is optional
        });
    } else {
      console.log('[PWA] Service Worker not supported in this browser');
    }
  }, []);

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ action: 'skipWaiting' });
      window.location.reload();
    }
  };

  return {
    registration,
    updateAvailable,
    updateServiceWorker
  };
}

// Offline detection hook
export function useOfflineDetection() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        // User came back online
        console.log('Back online!');
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOffline, wasOffline };
}
