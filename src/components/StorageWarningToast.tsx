/**
 * Storage Warning Toast
 * 
 * Automatically displays warnings when storage is running low
 */

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { checkStorageHealth } from '../utils/storage-quota-manager';
import { AlertTriangle, AlertCircle, HardDrive } from 'lucide-react';

export function StorageWarningToast() {
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [hasShownCritical, setHasShownCritical] = useState(false);

  useEffect(() => {
    // Check storage on mount and periodically
    const checkStorage = () => {
      const health = checkStorageHealth();

      // Show critical alert
      if (health.isCritical && !hasShownCritical) {
        toast.error('Storage Critically Full', {
          description: `Your local storage is ${(health.percentage * 100).toFixed(1)}% full. Please clean up old data immediately.`,
          duration: 10000,
          icon: <AlertCircle className="w-5 h-5" />,
          action: {
            label: 'Manage Storage',
            onClick: () => {
              // Navigate to settings or storage management
              window.location.hash = '#/settings?tab=storage';
            }
          }
        });
        setHasShownCritical(true);
      }
      // Show warning
      else if (health.isWarning && !hasShownWarning && !health.isCritical) {
        toast.warning('Storage Running Low', {
          description: `Your local storage is ${(health.percentage * 100).toFixed(1)}% full. Consider archiving old projects.`,
          duration: 7000,
          icon: <AlertTriangle className="w-5 h-5" />,
          action: {
            label: 'View Storage',
            onClick: () => {
              window.location.hash = '#/settings?tab=storage';
            }
          }
        });
        setHasShownWarning(true);
      }
    };

    // Check immediately
    checkStorage();

    // Check every 5 minutes
    const interval = setInterval(checkStorage, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [hasShownWarning, hasShownCritical]);

  // Reset warnings daily
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setHasShownWarning(false);
      setHasShownCritical(false);
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(resetInterval);
  }, []);

  return null; // This component doesn't render anything
}
