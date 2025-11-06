/**
 * Data Backup & Export Manager - Critical for Local Storage
 * Provides import/export, backup, and data recovery functionality
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Download,
  Upload,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileJson,
  HardDrive,
  Clock,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BackupData {
  version: string;
  timestamp: string;
  data: {
    users: any;
    profiles: any;
    projects: any;
    tasks: any;
    posts: any;
    messages: any;
  };
  metadata: {
    projectCount: number;
    taskCount: number;
    userCount: number;
  };
}

export default function DataBackupManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    available: number;
    percentage: number;
  } | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('devtrack_last_backup')
  );

  // Calculate storage usage
  React.useEffect(() => {
    calculateStorageUsage();
  }, []);

  const calculateStorageUsage = () => {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      // Convert to KB
      const usedKB = totalSize / 1024;
      // Typical localStorage limit is 5-10MB, we'll use 5MB as conservative estimate
      const availableKB = 5120; // 5MB in KB
      const percentage = Math.min((usedKB / availableKB) * 100, 100);

      setStorageInfo({
        used: usedKB,
        available: availableKB,
        percentage: percentage
      });
    } catch (error) {
      console.error('Error calculating storage:', error);
    }
  };

  const exportData = async () => {
    try {
      setIsExporting(true);
      
      // Gather all data from localStorage
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          users: localStorage.getItem('devtrack_users') || '{}',
          profiles: localStorage.getItem('devtrack_profiles') || '{}',
          projects: localStorage.getItem('devtrack_projects') || '{}',
          tasks: localStorage.getItem('devtrack_tasks') || '{}',
          posts: localStorage.getItem('devtrack_posts') || '{}',
          messages: localStorage.getItem('devtrack_messages') || '{}'
        },
        metadata: {
          projectCount: Object.keys(JSON.parse(localStorage.getItem('devtrack_projects') || '{}')).length,
          taskCount: Object.keys(JSON.parse(localStorage.getItem('devtrack_tasks') || '{}')).length,
          userCount: Object.keys(JSON.parse(localStorage.getItem('devtrack_users') || '{}')).length
        }
      };

      // Create downloadable file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `devtrack-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update last backup timestamp
      const timestamp = new Date().toISOString();
      localStorage.setItem('devtrack_last_backup', timestamp);
      setLastBackup(timestamp);

      toast.success('Data exported successfully!', {
        description: 'Your backup file has been downloaded.'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const backupData: BackupData = JSON.parse(content);

          // Validate backup data structure
          if (!backupData.version || !backupData.data) {
            throw new Error('Invalid backup file format');
          }

          // Confirm before importing
          const confirmed = window.confirm(
            `This will replace your current data with the backup from ${new Date(backupData.timestamp).toLocaleString()}.\n\n` +
            `Backup contains:\n` +
            `- ${backupData.metadata.projectCount} projects\n` +
            `- ${backupData.metadata.taskCount} tasks\n` +
            `- ${backupData.metadata.userCount} users\n\n` +
            `Do you want to continue?`
          );

          if (!confirmed) {
            setIsImporting(false);
            return;
          }

          // Import data
          localStorage.setItem('devtrack_users', backupData.data.users);
          localStorage.setItem('devtrack_profiles', backupData.data.profiles);
          localStorage.setItem('devtrack_projects', backupData.data.projects);
          localStorage.setItem('devtrack_tasks', backupData.data.tasks);
          localStorage.setItem('devtrack_posts', backupData.data.posts);
          localStorage.setItem('devtrack_messages', backupData.data.messages);

          toast.success('Data imported successfully!', {
            description: 'Please refresh the page to see your restored data.'
          });

          // Refresh page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Failed to import data', {
            description: 'The file may be corrupted or in an invalid format.'
          });
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('File reading error:', error);
      toast.error('Failed to read file');
      setIsImporting(false);
    }
  };

  const clearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL your data!\n\n' +
      'This includes:\n' +
      '- All projects and tasks\n' +
      '- User accounts and profiles\n' +
      '- All posts and messages\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Type "DELETE" to confirm:'
    );

    if (!confirmed) return;

    const verification = prompt('Type DELETE to confirm:');
    if (verification !== 'DELETE') {
      toast.error('Deletion cancelled', {
        description: 'Verification text did not match.'
      });
      return;
    }

    try {
      // Clear all DevTrack data
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('devtrack_')
      );
      
      keysToRemove.forEach(key => localStorage.removeItem(key));

      toast.success('All data cleared', {
        description: 'The page will reload in 2 seconds.'
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
    }
  };

  const getStorageWarningLevel = () => {
    if (!storageInfo) return 'safe';
    if (storageInfo.percentage > 90) return 'critical';
    if (storageInfo.percentage > 75) return 'warning';
    return 'safe';
  };

  return (
    <div className="space-y-6">
      {/* Storage Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <CardTitle>Storage Status</CardTitle>
            </div>
            <Badge variant={
              getStorageWarningLevel() === 'critical' ? 'destructive' :
              getStorageWarningLevel() === 'warning' ? 'default' : 'secondary'
            }>
              {storageInfo ? `${storageInfo.percentage.toFixed(1)}% Used` : 'Calculating...'}
            </Badge>
          </div>
          <CardDescription>
            Local browser storage usage for DevTrack Africa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {storageInfo && (
            <>
              <Progress value={storageInfo.percentage} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{storageInfo.used.toFixed(2)} KB used</span>
                <span>{storageInfo.available.toFixed(2)} KB available</span>
              </div>

              {getStorageWarningLevel() === 'critical' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Storage is critically low! Export your data and consider clearing old data.
                  </AlertDescription>
                </Alert>
              )}

              {getStorageWarningLevel() === 'warning' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Storage usage is high. Consider exporting and archiving old projects.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Backup & Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <CardTitle>Backup & Export</CardTitle>
          </div>
          <CardDescription>
            Download a complete backup of your DevTrack Africa data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastBackup && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
              <span>Last backup: {new Date(lastBackup).toLocaleString()}</span>
            </div>
          )}

          <Button
            onClick={exportData}
            disabled={isExporting}
            className="w-full gap-2"
            size="lg"
          >
            {isExporting ? (
              <>
                <Database className="w-4 h-4 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export All Data
              </>
            )}
          </Button>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Exports a JSON file containing all your projects, tasks, and settings.
              Store this file safely as a backup.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Import & Restore */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <CardTitle>Import & Restore</CardTitle>
          </div>
          <CardDescription>
            Restore your data from a previous backup file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              disabled={isImporting}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button
                as="span"
                variant="outline"
                disabled={isImporting}
                className="w-full gap-2 cursor-pointer"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <Upload className="w-4 h-4 animate-pulse" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileJson className="w-4 h-4" />
                    Select Backup File
                  </>
                )}
              </Button>
            </label>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Importing will replace all your current data.
              Export your current data first if you want to keep it.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible actions - proceed with extreme caution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={clearAllData}
            variant="destructive"
            className="w-full gap-2"
            size="lg"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </Button>
          <p className="text-xs text-red-600 mt-2 text-center">
            This will permanently delete everything. Cannot be undone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
