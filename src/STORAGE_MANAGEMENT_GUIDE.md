# Storage Management System - Complete Guide

## Overview

DevTrack Africa now includes a comprehensive local storage management system to prevent and handle storage quota errors. This system automatically monitors storage usage, provides warnings, and offers cleanup options.

## What Changed

### 1. **Drastically Reduced Demo Data**
- Demo data reduced from 2 projects with many tasks to 1 project with 1 task
- Significantly reduces initial storage footprint for new users
- Users can still create unlimited projects manually

### 2. **Aggressive Emergency Cleanup**
- Automatically removes ALL completed and archived projects when storage is full
- Cleans up orphaned tasks from deleted projects
- Clears posts and messages (non-essential data)
- Trims large text fields to prevent bloat
- Always creates backup before cleanup

### 3. **Proactive Prevention**
- Checks storage health before creating projects/tasks
- Prevents creation when storage is critically full
- Shows user-friendly error messages with cleanup options
- Limits data field sizes (descriptions, notes, tags)

### 4. **Storage Monitoring Components**

#### StorageQuotaMonitor Component (`/components/StorageQuotaMonitor.tsx`)
- Real-time storage usage visualization
- Category breakdown (projects, tasks, posts, messages, etc.)
- Manual cleanup actions (auto cleanup, archive old, export/import)
- Available in Settings → Storage tab

#### StorageFullDialog Component (`/components/StorageFullDialog.tsx`)
- Appears when user tries to create data but storage is full
- Offers quick cleanup options with explanations
- Automatically backs up data before cleanup
- User-friendly interface with action buttons

#### StorageWarningToast Component (`/components/StorageWarningToast.tsx`)
- Automatic warnings at 80% storage usage
- Critical alerts at 90% storage usage
- Links to storage management settings

### 5. **Storage Context Provider**
- Global storage state management
- Accessible from any component
- Automatic periodic checks (every minute)
- Cleanup dialog state management

### 6. **Safe Storage Operations**
Utility functions in `/utils/safe-storage-operations.ts`:
- `safeCreateProject()` - Create project with quota checking
- `safeCreateTask()` - Create task with quota checking
- `safeUpdateProject()` - Update project with error handling
- `safeUpdateTask()` - Update task with error handling
- `handleStorageError()` - Show user-friendly error messages

## How It Works

### Storage Health Levels

1. **Healthy** (0-79% full)
   - ✅ All operations allowed
   - No warnings

2. **Warning** (80-89% full)
   - ⚠️ Warning toast shown once
   - All operations still allowed
   - User encouraged to clean up

3. **Critical** (90-94% full)
   - 🚨 Critical alert shown
   - User strongly urged to clean up
   - Auto-cleanup runs before saves

4. **Full** (95%+ full)
   - ❌ New project/task creation blocked
   - Emergency cleanup dialog appears
   - Existing data can still be edited

### Automatic Cleanup Process

When storage reaches critical levels or emergency cleanup is triggered:

1. **Backup First** - All data exported to JSON file
2. **Remove Completed Projects** - All completed/archived projects deleted
3. **Clean Orphaned Tasks** - Tasks for deleted projects removed
4. **Clear Social Data** - Posts and messages cleared
5. **Trim Data Fields** - Large text fields shortened
6. **Remove Temp Data** - Cleanup flags and cache cleared

### Manual Cleanup Options

Users can manually clean up storage through Settings → Storage:

1. **Auto Cleanup**
   - Removes temporary data and old demo flags
   - Safe, non-destructive
   - Frees minimal space

2. **Archive Old Projects**
   - Archives completed projects older than 60-90 days
   - Changes status to 'archived'
   - Projects remain in storage but marked as archived

3. **Emergency Cleanup**
   - Most aggressive option
   - Removes all non-active projects
   - Clears social features data
   - Creates backup automatically

4. **Export Data**
   - Downloads all DevTrack data as JSON
   - Use for backup before cleanup
   - Can be imported later

5. **Import Data**
   - Restores data from backup file
   - Overwrites existing data
   - Use with caution

## Usage Examples

### For Component Developers

```typescript
import { useStorage } from '../contexts/StorageContext';
import { safeCreateProject, handleStorageError } from '../utils/safe-storage-operations';

function MyComponent() {
  const { openCleanupDialog, canStore } = useStorage();

  const handleCreateProject = async (data) => {
    const result = await safeCreateProject(userId, data);
    
    if (!result.success) {
      handleStorageError(result, openCleanupDialog);
      return;
    }

    // Project created successfully
    console.log('Created:', result.data);
  };

  return (
    <div>
      {!canStore && (
        <Alert variant="destructive">
          Storage is full! Please clean up before creating new projects.
        </Alert>
      )}
      {/* Your component UI */}
    </div>
  );
}
```

### Checking Storage Health

```typescript
import { checkStorageHealth } from '../utils/storage-quota-manager';

const health = checkStorageHealth();
console.log('Storage used:', health.percentage * 100 + '%');
console.log('Is warning:', health.isWarning);
console.log('Is critical:', health.isCritical);
console.log('Can store:', health.canStore);
```

### Manual Cleanup

```typescript
import { storageQuotaManager } from '../utils/storage-quota-manager';

// Auto cleanup
storageQuotaManager.autoCleanup();

// Archive old projects
const count = storageQuotaManager.archiveOldProjects(90); // 90 days
console.log(`Archived ${count} projects`);

// Emergency cleanup
storageQuotaManager.emergencyCleanup();

// Export/Import
const backupData = storageQuotaManager.exportData();
// Save to file...

// Later, restore
storageQuotaManager.importData(backupData);
```

## Storage Limits

### LocalStorage Limits
- **Typical browser limit**: 5-10MB
- **System assumes**: 5MB for safety
- **Warning threshold**: 4MB (80%)
- **Critical threshold**: 4.5MB (90%)
- **Block threshold**: 4.75MB (95%)

### Data Size Limits (Per Item)
- **Project description**: Max 500 characters
- **Project notes**: Max 1000 characters
- **Project tags**: Max 10 tags
- **Project tech stack**: Max 10 items
- **Task description**: Max 500 characters
- **Task tags**: Max 5 tags
- **Task dependencies**: Max 5 dependencies

### Recommended Practices

1. **Regular Cleanup**
   - Archive completed projects monthly
   - Export data for backup regularly
   - Delete old, unnecessary projects

2. **Data Hygiene**
   - Keep descriptions concise
   - Use tags sparingly
   - Delete test projects

3. **Monitoring**
   - Check storage tab in settings occasionally
   - Respond to warning toasts
   - Don't ignore critical alerts

4. **Backup Strategy**
   - Export data before major cleanup
   - Keep external backups of important projects
   - Use export feature regularly

## Troubleshooting

### "Storage Full" Error When Creating Project
**Cause**: localStorage has exceeded 95% capacity

**Solutions**:
1. Click "Clean Up" in the error dialog
2. Go to Settings → Storage → Emergency Cleanup
3. Manually delete old projects
4. Export data and clear all storage

### "Emergency Cleanup" Removes My Projects
**Cause**: Emergency cleanup removes all completed/archived projects

**Prevention**:
1. Set important projects to "active" or "in_progress"
2. Export data before emergency cleanup
3. Use regular cleanup instead of emergency cleanup

**Recovery**:
- Import the backup file created during cleanup
- File is automatically downloaded before cleanup

### Storage Warning Keeps Appearing
**Cause**: Storage is at 80%+ capacity

**Solutions**:
1. Archive old projects
2. Delete unnecessary projects
3. Run auto cleanup
4. Clear social features data (posts/messages)

### Lost Data After Cleanup
**Cause**: Emergency cleanup removed completed projects

**Recovery**:
1. Find the backup file downloaded during cleanup
2. Go to Settings → Storage → Import Data
3. Select the backup file
4. Data will be restored

## Technical Details

### Storage Calculation
- Each character in localStorage = ~2 bytes (UTF-16)
- Total size = Sum of (key.length + value.length) * 2 bytes
- Includes all localStorage keys, not just DevTrack data

### Files and Images
- Files/images are stored in **IndexedDB**, not localStorage
- IndexedDB has much larger limits (often 50MB+)
- Storage quota manager only monitors localStorage
- File storage issues are separate from localStorage issues

### Performance Impact
- Storage checks run every 60 seconds
- Minimal performance overhead
- Cleanup operations may take 1-2 seconds
- No impact on normal app usage

## Future Enhancements

Potential improvements for future versions:

1. **Compression** - Compress data before storing
2. **Selective Sync** - Move old projects to cloud backup
3. **Smart Archival** - AI-based project importance detection
4. **Storage Analytics** - Detailed usage trends over time
5. **Custom Thresholds** - User-configurable warning levels

## Support

If you encounter storage issues:

1. Check Settings → Storage tab for current usage
2. Try auto cleanup first
3. Export data as backup
4. Use emergency cleanup if needed
5. Report persistent issues with storage health info

---

**Last Updated**: November 3, 2025
**Version**: 2.0.0
