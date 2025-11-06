import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { WifiOff, Wifi, CloudOff } from 'lucide-react';
import { useOfflineDetection } from './hooks/usePWA';

export default function OfflineIndicator() {
  const { isOffline, wasOffline } = useOfflineDetection();

  if (!isOffline && !wasOffline) return null;

  if (!isOffline && wasOffline) {
    // Show "back online" message briefly
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✅ You're back online! All changes will sync automatically.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
      <Alert variant="destructive" className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4" />
            <span>You're offline. Changes will be saved locally and synced when you reconnect.</span>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Compact offline badge for header/navbar
export function OfflineBadge() {
  const { isOffline } = useOfflineDetection();

  if (!isOffline) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium">
      <WifiOff className="w-3 h-3" />
      <span>Offline</span>
    </div>
  );
}
