import { usePWAUpdate } from '@/hooks/usePWAUpdate';

const UpdateBanner = () => {
  const { 
    updateAvailable, 
    isIOS, 
    isStandalone, 
    serviceWorkerSupported,
    updateServiceWorker 
  } = usePWAUpdate();

  // Show iOS-specific note for standalone PWA users
  if (isIOS && isStandalone && updateAvailable) {
    return (
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-accent/95 text-accent-foreground px-4 py-3 text-center text-sm backdrop-blur-sm"
        role="alert"
      >
        <p className="mb-2">🐣 New, de-bugged version available</p>
        <p className="text-xs opacity-90">
          Open in Safari and refresh to get the latest updates
        </p>
      </div>
    );
  }

  // Show update banner for supported browsers
  if (updateAvailable && serviceWorkerSupported) {
    return (
      <button
        onClick={updateServiceWorker}
        className="fixed top-0 left-0 right-0 z-50 bg-accent/95 text-accent-foreground px-4 py-3 text-center text-sm backdrop-blur-sm cursor-pointer hover:bg-accent transition-colors touch-target"
        role="alert"
        aria-label="Update available, tap to refresh"
      >
        🐣 New, de-bugged version available, tap to refresh
      </button>
    );
  }

  return null;
};

export default UpdateBanner;
