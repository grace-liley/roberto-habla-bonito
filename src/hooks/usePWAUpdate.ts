import { useState, useEffect, useCallback } from 'react';

interface PWAUpdateState {
  updateAvailable: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  serviceWorkerSupported: boolean;
}

export const usePWAUpdate = () => {
  const [state, setState] = useState<PWAUpdateState>({
    updateAvailable: false,
    isIOS: false,
    isStandalone: false,
    serviceWorkerSupported: false,
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Detect iOS
  const detectIOS = useCallback(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }, []);

  // Detect if running as standalone PWA
  const detectStandalone = useCallback(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  // Clean up old caches
  const cleanOldCaches = useCallback(async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const currentCacheNames = ['workbox-precache-v2', 'google-fonts-cache'];
        
        await Promise.all(
          cacheNames
            .filter(name => !currentCacheNames.some(current => name.includes(current.split('-')[0])))
            .map(name => {
              console.log('Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      } catch (err) {
        console.log('Cache cleanup failed:', err);
      }
    }
  }, []);

  // Force update the service worker
  const updateServiceWorker = useCallback(async () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting and activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Clean old caches
    await cleanOldCaches();
    
    // Reload to get the new version
    window.location.reload();
  }, [registration, cleanOldCaches]);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (registration) {
      try {
        await registration.update();
        console.log('Service worker update check completed');
      } catch (err) {
        console.log('Service worker update check failed:', err);
      }
    }
  }, [registration]);

  useEffect(() => {
    const isIOS = detectIOS();
    const isStandalone = detectStandalone();
    const serviceWorkerSupported = 'serviceWorker' in navigator;

    setState(prev => ({
      ...prev,
      isIOS,
      isStandalone,
      serviceWorkerSupported,
    }));

    if (!serviceWorkerSupported) {
      console.log('Service Worker not supported');
      return;
    }

    // Listen for service worker updates
    const handleServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);

        // Check for updates on app open
        reg.update();

        // Listen for new service worker waiting
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New update available');
                setState(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        // Check if there's already a waiting worker
        if (reg.waiting) {
          setState(prev => ({ ...prev, updateAvailable: true }));
        }
      } catch (err) {
        console.log('Service worker registration failed:', err);
      }
    };

    handleServiceWorker();

    // Listen for controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker activated');
    });

    // Check for updates when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean old caches on startup
    cleanOldCaches();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [detectIOS, detectStandalone, checkForUpdates, cleanOldCaches]);

  return {
    ...state,
    updateServiceWorker,
    checkForUpdates,
  };
};
