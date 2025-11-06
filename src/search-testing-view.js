// Search for testing view in dashboard file
const fs = require('fs');
const path = require('path');

const dashboardFile = path.join(__dirname, 'components', 'EnhancedDashboard-FIXED.tsx');
const content = fs.readFileSync(dashboardFile, 'utf8');

// Find the switch statement or conditional that renders the testing view
const lines = content.split('\n');
let inRenderMethod = false;
let testingCaseFound = false;

lines.forEach((line, index) => {
  if (line.includes('case \'testing\':') || line.includes('currentView === \'testing\'')) {
    console.log(`Found testing case at line ${index + 1}:`);
    console.log(line);
    
    // Show surrounding context
    const start = Math.max(0, index - 3);
    const end = Math.min(lines.length, index + 10);
    
    console.log('\nContext:');
    for (let i = start; i < end; i++) {
      const marker = i === index ? '>>> ' : '    ';
      console.log(`${marker}${i + 1}: ${lines[i]}`);
    }
    
    testingCaseFound = true;
  }
});

if (!testingCaseFound) {
  console.log('Testing case not found. Searching for renderCurrentView or similar...');
  
  lines.forEach((line, index) => {
    if (line.includes('renderCurrentView') || line.includes('switch (currentView)')) {
      console.log(`Found view renderer at line ${index + 1}:`);
      console.log(line);
      
      // Show context around this line
      const start = Math.max(0, index - 2);
      const end = Math.min(lines.length, index + 20);
      
      console.log('\nContext:');
      for (let i = start; i < end; i++) {
        const marker = i === index ? '>>> ' : '    ';
        console.log(`${marker}${i + 1}: ${lines[i]}`);
      }
    }
  });
}