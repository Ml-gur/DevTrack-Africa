/**
 * Storage Full Dialog
 * 
 * Displays when user tries to create data but storage is full
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Archive, Trash2, HardDrive, Download } from 'lucide-react';
import { storageQuotaManager } from '../utils/storage-quota-manager';
import { toast } from 'sonner@2.0.3';

interface StorageFullDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCleanupComplete?: () => void;
}

export function StorageFullDialog({ open, onOpenChange, onCleanupComplete }: StorageFullDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleEmergencyCleanup = async () => {
    setIsProcessing(true);
    try {
      // Export data first for safety
      const data = storageQuotaManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devtrack-emergency-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Wait a moment for download to start
      await new Promise(resolve => setTimeout(resolve, 500));

      // Run emergency cleanup
      storageQuotaManager.emergencyCleanup();

      toast.success('Storage cleaned up successfully', {
        description: 'A backup has been downloaded. You can now create new projects.'
      });

      onCleanupComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
      toast.error('Cleanup failed. Please try manual cleanup.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchiveOld = () => {
    setIsProcessing(true);
    try {
      const count = storageQuotaManager.archiveOldProjects(60); // Archive projects older than 60 days
      
      if (count > 0) {
        toast.success(`Archived ${count} old projects`);
        onCleanupComplete?.();
        onOpenChange(false);
      } else {
        toast.info('No old projects found to archive');
      }
    } catch (error) {
      console.error('Archive failed:', error);
      toast.error('Archive failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualCleanup = () => {
    onOpenChange(false);
    // Navigate to settings storage tab
    setTimeout(() => {
      window.location.hash = '#/settings?tab=storage';
      // Trigger settings panel to open
      const event = new CustomEvent('openSettings', { detail: { tab: 'storage' } });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Storage Full
          </DialogTitle>
          <DialogDescription>
            Your local storage is full and cannot save new data. Please clean up old projects and data to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You cannot create new projects or tasks until you free up storage space.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Actions</h4>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleEmergencyCleanup}
              disabled={isProcessing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Emergency Cleanup (Recommended)
              <span className="ml-auto text-xs text-gray-500">Removes completed projects</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleArchiveOld}
              disabled={isProcessing}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive Old Projects
              <span className="ml-auto text-xs text-gray-500">60+ days</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleManualCleanup}
              disabled={isProcessing}
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Manual Storage Management
              <span className="ml-auto text-xs text-gray-500">Full control</span>
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">What happens during cleanup?</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>All data is backed up before cleanup</li>
              <li>Completed and archived projects are removed</li>
              <li>Only active projects are kept</li>
              <li>Posts and messages are cleared</li>
              <li>You can import the backup later if needed</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleEmergencyCleanup}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? 'Processing...' : 'Clean Up Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
