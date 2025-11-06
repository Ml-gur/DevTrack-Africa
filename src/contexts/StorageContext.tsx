/**
 * Storage Context
 * 
 * Provides global storage monitoring and cleanup dialog access
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { checkStorageHealth, StorageQuotaInfo } from '../utils/storage-quota-manager';

interface StorageContextType {
  storageInfo: StorageQuotaInfo | null;
  showCleanupDialog: boolean;
  openCleanupDialog: () => void;
  closeCleanupDialog: () => void;
  refreshStorage: () => StorageQuotaInfo;
  isFull: boolean;
  isWarning: boolean;
  canStore: boolean;
}

const StorageContext = createContext<StorageContextType | null>(null);

export function StorageProvider({ children }: { children: React.ReactNode }) {
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

  const value: StorageContextType = {
    storageInfo,
    showCleanupDialog,
    openCleanupDialog,
    closeCleanupDialog,
    refreshStorage,
    isFull: storageInfo?.isCritical || false,
    isWarning: storageInfo?.isWarning || false,
    canStore: storageInfo?.canStore ?? true
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
}
