/**
 * Storage Monitor Hook
 * 
 * Provides storage monitoring and cleanup dialog functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { checkStorageHealth, StorageQuotaInfo } from '../../utils/storage-quota-manager';

export function useStorageMonitor() {
  const [storageInfo, setStorageInfo] = useState<StorageQuotaInfo | null>(null);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);

  // Check storage on mount and periodically
  useEffect(() => {
    const checkStorage = () => {
      const info = checkStorageHealth();
      setStorageInfo(info);
    };

    checkStorage();

    // Check every minute
    const interval = setInterval(checkStorage, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Refresh storage info manually
  const refreshStorage = useCallback(() => {
    const info = checkStorageHealth();
    setStorageInfo(info);
    return info;
  }, []);

  // Open cleanup dialog
  const openCleanupDialog = useCallback(() => {
    setShowCleanupDialog(true);
  }, []);

  // Close cleanup dialog
  const closeCleanupDialog = useCallback(() => {
    setShowCleanupDialog(false);
    // Refresh storage info after dialog closes
    refreshStorage();
  }, [refreshStorage]);

  return {
    storageInfo,
    showCleanupDialog,
    openCleanupDialog,
    closeCleanupDialog,
    refreshStorage,
    isFull: storageInfo?.isCritical || false,
    isWarning: storageInfo?.isWarning || false,
    canStore: storageInfo?.canStore ?? true
  };
}
