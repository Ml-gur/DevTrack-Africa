# 🔄 FORCE REFRESH - Clear All Caches

Your changes aren't showing because the PWA Service Worker is caching old code.

## Step 1: Clear Service Worker Cache (CRITICAL)

### Option A: Via Browser DevTools (Recommended)
1. Open your app in the browser
2. Press **F12** (or right-click → Inspect)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. In the left sidebar, find **Service Workers**
5. Click **Unregister** next to all service workers
6. Then go to **Cache Storage** (in the same left sidebar)
7. Right-click each cache → **Delete**
8. Close DevTools

### Option B: Via Browser Settings
**Chrome:**
1. Settings → Privacy and Security → Clear browsing data
2. Choose **Advanced** tab
3. Select ONLY:
   - ✅ Cached images and files
   - ✅ Cookies and other site data
4. Click **Clear data**

**Firefox:**
1. Settings → Privacy & Security → Cookies and Site Data
2. Click **Clear Data**
3. Select both checkboxes
4. Click **Clear**

## Step 2: Hard Refresh

After clearing caches:

- **Windows/Linux:** Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** Press `Cmd + Shift + R` or `Cmd + Option + R`

## Step 3: Restart Dev Server

In your terminal:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Step 4: Verify Changes Loaded

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for these logs when dragging tasks:
   - `🔍 WIP Check:` - Shows WIP limit checking
   - `🎨 TaskCard color update:` - Shows color changes
   - `✅ WIP Check PASSED` - When move is allowed
   - `❌ WIP LIMIT BLOCKED` - When 4th task is blocked

## Step 5: Test the Features

1. Create 4 tasks in "To Do"
2. Drag Task 1 to "In Progress" → Should turn BLUE
3. Drag Task 2 to "In Progress" → Should turn BLUE  
4. Drag Task 3 to "In Progress" → Should turn BLUE
5. Try to drag Task 4 to "In Progress" → Should be **BLOCKED** with error message
6. Drag any task from "In Progress" to "Completed" → Should turn GREEN

## Troubleshooting

### If changes still don't show:

1. **Check file timestamp:**
   - Look at `/components/KanbanBoard.tsx` 
   - Verify it has the recent changes (console.logs, WIP check using `safeTasksArray.filter`)

2. **Clear ALL browser data:**
   ```
   Chrome: chrome://settings/clearBrowserData
   Firefox: about:preferences#privacy
   ```
   - Select "All time"
   - Check all boxes
   - Clear

3. **Try Incognito/Private window:**
   - Open new incognito/private window
   - Navigate to your app
   - Test there (no cache/service worker)

4. **Rebuild from scratch:**
   ```bash
   # Stop dev server
   rm -rf node_modules/.vite
   rm -rf dist
   npm run dev
   ```

## Expected Behavior After Fix

✅ **WIP Limit:**
- Maximum 3 tasks in "In Progress" column
- 4th task drag shows error: "Cannot move task to In Progress. WIP limit reached (3 tasks maximum)"

✅ **Dynamic Colors:**
- **To Do** tasks: Gray left border (`border-l-gray-500`)
- **In Progress** tasks: Blue left border + blue background (`border-l-blue-500 bg-blue-50/30`)
- **Completed** tasks: Green left border + green background (`border-l-green-500 bg-green-50/30`)

✅ **Console Logs:**
- You'll see detailed logs in console showing the WIP checks and color updates
