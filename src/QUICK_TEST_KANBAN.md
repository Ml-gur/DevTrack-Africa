# 🧪 Quick Test - Kanban WIP & Colors

## Access the Test Page

I've created a dedicated test page at `/components/KanbanTestPage.tsx`

### To access it:

**Option 1: Direct URL (if routing configured)**
```
http://localhost:5173/#kanban-test
```

**Option 2: Via Console**
1. Open your app
2. Press F12 to open DevTools
3. Go to Console tab
4. Run this:
```javascript
window.location.hash = 'kanban-test';
```

**Option 3: Test in existing project**
1. Go to Projects tab in your dashboard
2. Click on any project (or create one)
3. Click on "Tasks" or "Kanban" tab
4. Open browser console (F12 → Console tab)
5. Create 4 tasks
6. Test the drag and drop

## What to Look For

### In the Console (F12):
```
🔍 WIP Check: {newStatus: 'in_progress', currentInProgressCount: 0, wipLimit: 3, willBlock: false}
✅ WIP Check PASSED - Moving task: {taskId: '...', from: 'todo', to: 'in_progress'}
💾 Task updated in storage with new status: {taskId: '...', newStatus: 'in_progress'}
🎨 TaskCard color update: {taskStatus: 'in_progress', statusColor: 'border-l-4 border-l-blue-500 bg-blue-50/30'}
```

### When 4th task is dragged (should FAIL):
```
🔍 WIP Check: {currentInProgressCount: 3, wipLimit: 3, willBlock: true}
❌ WIP LIMIT BLOCKED - Cannot add more tasks to In Progress
```

### Visual Changes:
- **To Do tasks**: White background, gray left border
- **In Progress tasks**: Light blue background, blue left border  
- **Completed tasks**: Light green background, green left border

## Verify Files Have Changes

Run this in your terminal:

```bash
# Check KanbanBoard has the new WIP logic
grep -n "safeTasksArray.filter" components/KanbanBoard.tsx

# Should show lines with the new WIP check code
```

Expected output should show line numbers with:
```typescript
const currentInProgressTasks = safeTasksArray.filter(t => 
  t.status === 'in_progress' && t.id !== taskId
);
```

## If Nothing Works - Nuclear Option

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear all caches
rm -rf node_modules/.vite
rm -rf dist
rm -rf .cache

# 3. Restart
npm run dev

# 4. Open in INCOGNITO window
# Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox)

# 5. Navigate to: http://localhost:5173
```

## Expected Test Results

| Action | Expected Result |
|--------|----------------|
| Drag Task 1 to In Progress | ✅ Moves, turns BLUE |
| Drag Task 2 to In Progress | ✅ Moves, turns BLUE |
| Drag Task 3 to In Progress | ✅ Moves, turns BLUE |
| Drag Task 4 to In Progress | ❌ **BLOCKED** - Error shown |
| Drag Task 1 to Completed | ✅ Moves, turns GREEN |
| Now drag Task 4 to In Progress | ✅ Moves (space available) |

## Debugging Steps

1. **Check file actually changed:**
   ```bash
   cat components/KanbanBoard.tsx | grep "🔍 WIP Check"
   ```
   Should show the console.log line

2. **Check TaskCard has color logging:**
   ```bash
   cat components/TaskCard.tsx | grep "🎨 TaskCard color"
   ```
   Should show the color logging useEffect

3. **Verify service worker updated:**
   - Open DevTools → Application → Service Workers
   - Should show version `v1.0.2-kanban-fix`
   - If not, click "Unregister" and refresh

4. **Check browser console for errors:**
   - Any red errors?
   - Any warnings about undefined variables?
   - Any TypeScript errors?
