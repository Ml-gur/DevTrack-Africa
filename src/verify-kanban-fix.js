#!/usr/bin/env node

/**
 * Verification script for Kanban WIP Limit & Color Fix
 * Run with: node verify-kanban-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Kanban Fix Implementation...\n');

let allChecksPassed = true;

// Check 1: KanbanBoard.tsx has new WIP logic
console.log('✓ Checking KanbanBoard.tsx...');
try {
  const kanbanPath = path.join(__dirname, 'components', 'KanbanBoard.tsx');
  const kanbanContent = fs.readFileSync(kanbanPath, 'utf8');
  
  const checks = [
    {
      name: 'WIP_LIMIT constant',
      pattern: /const WIP_LIMIT = 3;/,
      required: true
    },
    {
      name: 'STATUS_COLORS definition',
      pattern: /const STATUS_COLORS = \{[\s\S]*?todo:.*?border-l-gray-500/,
      required: true
    },
    {
      name: 'In Progress blue color',
      pattern: /in_progress:.*?border-l-blue-500.*?bg-blue-50/,
      required: true
    },
    {
      name: 'Completed green color',
      pattern: /completed:.*?border-l-green-500.*?bg-green-50/,
      required: true
    },
    {
      name: 'currentInProgressTasks filter',
      pattern: /const currentInProgressTasks = safeTasksArray\.filter/,
      required: true
    },
    {
      name: 'WIP check excludes current task',
      pattern: /t\.status === 'in_progress' && t\.id !== taskId/,
      required: true
    },
    {
      name: 'WIP debug logging',
      pattern: /console\.log\('🔍 WIP Check:'/,
      required: true
    },
    {
      name: 'WIP limit error message',
      pattern: /Cannot move task to In Progress\. WIP limit reached/,
      required: true
    },
    {
      name: 'statusColor prop passed to TaskCard',
      pattern: /statusColor=\{STATUS_COLORS\[task\.status\]\}/,
      required: true
    }
  ];
  
  let kanbanPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(kanbanContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name} - NOT FOUND`);
      kanbanPassed = false;
      allChecksPassed = false;
    }
  });
  
  if (kanbanPassed) {
    console.log('  ✅ KanbanBoard.tsx is correctly updated\n');
  } else {
    console.log('  ❌ KanbanBoard.tsx is missing some changes\n');
  }
  
} catch (error) {
  console.log(`  ❌ Error reading KanbanBoard.tsx: ${error.message}\n`);
  allChecksPassed = false;
}

// Check 2: TaskCard.tsx has color logging
console.log('✓ Checking TaskCard.tsx...');
try {
  const taskCardPath = path.join(__dirname, 'components', 'TaskCard.tsx');
  const taskCardContent = fs.readFileSync(taskCardPath, 'utf8');
  
  const checks = [
    {
      name: 'statusColor prop in interface',
      pattern: /statusColor\?:\s*string/,
      required: true
    },
    {
      name: 'statusColor in destructuring',
      pattern: /statusColor[\s\S]*?\}:\s*TaskCardProps\)/,
      required: true
    },
    {
      name: 'Color logging useEffect',
      pattern: /console\.log\('🎨 TaskCard color update:'/,
      required: true
    },
    {
      name: 'statusColor applied to Card',
      pattern: /\$\{[\s\S]*?statusColor/,
      required: true
    }
  ];
  
  let taskCardPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(taskCardContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name} - NOT FOUND`);
      taskCardPassed = false;
      allChecksPassed = false;
    }
  });
  
  if (taskCardPassed) {
    console.log('  ✅ TaskCard.tsx is correctly updated\n');
  } else {
    console.log('  ❌ TaskCard.tsx is missing some changes\n');
  }
  
} catch (error) {
  console.log(`  ❌ Error reading TaskCard.tsx: ${error.message}\n`);
  allChecksPassed = false;
}

// Check 3: Service Worker version updated
console.log('✓ Checking service-worker.js...');
try {
  const swPath = path.join(__dirname, 'public', 'service-worker.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  if (swContent.includes('devtrack-africa-v1.0.2-kanban-fix')) {
    console.log('  ✅ Service worker version updated to v1.0.2-kanban-fix\n');
  } else if (swContent.includes('v1.0.2')) {
    console.log('  ⚠️  Service worker has v1.0.2 but not exact kanban-fix name\n');
  } else {
    console.log('  ❌ Service worker version not updated (still old version)\n');
    allChecksPassed = false;
  }
  
} catch (error) {
  console.log(`  ❌ Error reading service-worker.js: ${error.message}\n`);
  allChecksPassed = false;
}

// Check 4: Test page exists
console.log('✓ Checking KanbanTestPage.tsx...');
try {
  const testPath = path.join(__dirname, 'components', 'KanbanTestPage.tsx');
  if (fs.existsSync(testPath)) {
    console.log('  ✅ KanbanTestPage.tsx exists for testing\n');
  } else {
    console.log('  ⚠️  KanbanTestPage.tsx not found (optional)\n');
  }
} catch (error) {
  console.log(`  ⚠️  Could not check for KanbanTestPage.tsx\n`);
}

// Final summary
console.log('\n' + '='.repeat(60));
if (allChecksPassed) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nThe code is correctly updated. If you still don\'t see changes:');
  console.log('1. Clear browser cache and service worker');
  console.log('2. Open: http://localhost:5173/clear-cache.html');
  console.log('3. Use incognito/private browsing mode');
  console.log('4. Hard refresh with Ctrl+Shift+R');
  console.log('\nSee KANBAN_FIX_COMPLETE_GUIDE.md for detailed instructions.');
} else {
  console.log('❌ SOME CHECKS FAILED!');
  console.log('\nPlease review the errors above.');
  console.log('Some files may not have been updated correctly.');
}
console.log('='.repeat(60) + '\n');

process.exit(allChecksPassed ? 0 : 1);
