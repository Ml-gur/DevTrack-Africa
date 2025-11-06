/**
 * Storage Quota Monitor Component
 * 
 * Displays storage usage and provides cleanup options
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  HardDrive,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  Trash2,
  Archive,
  RefreshCw
} from 'lucide-react';
import { storageQuotaManager, checkStorageHealth, StorageQuotaInfo } from '../utils/storage-quota-manager';

export function StorageQuotaMonitor() {
  const [storageInfo, setStorageInfo] = useState<StorageQuotaInfo | null>(null);
  const [storageByCategory, setStorageByCategory] = useState<{ [key: string]: number }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStorageInfo = () => {
    setIsRefreshing(true);
    const info = checkStorageHealth();
    const categories = storageQuotaManager.getStorageByCategory();
    setStorageInfo(info);
    setStorageByCategory(categories);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    refreshStorageInfo();
  }, []);

  const handleAutoCleanup = () => {
    if (confirm('This will remove temporary data and old demo flags. Continue?')) {
      storageQuotaManager.autoCleanup();
      refreshStorageInfo();
    }
  };

  const handleArchiveOldProjects = () => {
    if (confirm('This will archive completed projects older than 90 days. Continue?')) {
      const count = storageQuotaManager.archiveOldProjects(90);
      alert(`Archived ${count} old projects`);
      refreshStorageInfo();
    }
  };

  const handleExportData = () => {
    const data = storageQuotaManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (confirm('This will import data and may overwrite existing data. Continue?')) {
        const success = storageQuotaManager.importData(content);
        if (success) {
          alert('Data imported successfully');
          refreshStorageInfo();
        } else {
          alert('Failed to import data');
        }
      }
    };
    reader.readAsText(file);
  };

  if (!storageInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading storage information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (storageInfo.isCritical) return 'text-red-600';
    if (storageInfo.isWarning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (storageInfo.isCritical) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (storageInfo.isWarning) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const getStatusBadge = () => {
    if (storageInfo.isCritical) return <Badge variant="destructive">Critical</Badge>;
    if (storageInfo.isWarning) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Warning</Badge>;
    return <Badge variant="outline" className="border-green-500 text-green-600">Healthy</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Status Alert */}
      {storageInfo.isCritical && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Storage Critically Full</AlertTitle>
          <AlertDescription>
            Your local storage is {(storageInfo.percentage * 100).toFixed(1)}% full. 
            Please clean up old data or archive projects to free up space.
          </AlertDescription>
        </Alert>
      )}

      {storageInfo.isWarning && !storageInfo.isCritical && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Storage Running Low</AlertTitle>
          <AlertDescription>
            Your local storage is {(storageInfo.percentage * 100).toFixed(1)}% full. 
            Consider cleaning up old data to prevent issues.
          </AlertDescription>
        </Alert>
      )}

      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              <CardTitle>Storage Usage</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshStorageInfo}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            Monitor your local storage usage and manage data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className={getStatusColor()}>
                  {(storageInfo.percentage * 100).toFixed(1)}% Used
                </span>
              </div>
              <span className="text-gray-500">
                {storageQuotaManager.formatBytes(storageInfo.used)} / {storageQuotaManager.formatBytes(storageInfo.available)}
              </span>
            </div>
            <Progress value={storageInfo.percentage * 100} className="h-2" />
          </div>

          {/* Storage by Category */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Storage by Category</h4>
            {Object.entries(storageByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, size]) => {
                const percentage = (size / storageInfo.used) * 100;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <span className="text-gray-500">
                        {storageQuotaManager.formatBytes(size)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1" />
                  </div>
                );
              })}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoCleanup}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Auto Cleanup
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchiveOldProjects}
              className="w-full"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive Old
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportData}
            />
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-blue-900">Storage Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Archive completed projects older than 90 days</li>
              <li>Use the auto cleanup to remove temporary data</li>
              <li>Export data regularly for backup</li>
              <li>Delete unnecessary projects and tasks</li>
              <li>Files and images are stored in IndexedDB, not local storage</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
