#!/usr/bin/env node

/**
 * DevTrack Africa - Deployment Readiness Verification
 * 
 * This script verifies that your application is ready for production deployment.
 * Run this before deploying to catch any potential issues.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 DevTrack Africa - Deployment Readiness Check\n');
console.log('='.repeat(50));
console.log('');

let allChecksPassed = true;
const issues = [];
const warnings = [];

// Helper function to check file exists
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(path.join(__dirname, filePath));
  if (exists) {
    console.log(`✅ ${description}`);
  } else {
    console.log(`❌ ${description}`);
    issues.push(`Missing file: ${filePath}`);
    allChecksPassed = false;
  }
  return exists;
}

// Helper function to check file content
function checkFileContent(filePath, searchString, description) {
  try {
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    const found = content.includes(searchString);
    if (found) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`⚠️  ${description}`);
      warnings.push(`${filePath}: ${description}`);
    }
    return found;
  } catch (error) {
    console.log(`❌ ${description} (file not readable)`);
    issues.push(`Cannot read file: ${filePath}`);
    allChecksPassed = false;
    return false;
  }
}

console.log('📁 Checking Essential Files...\n');

// Check core files
checkFileExists('package.json', 'package.json exists');
checkFileExists('App.tsx', 'App.tsx exists');
checkFileExists('index.html', 'index.html exists');
checkFileExists('vite.config.ts', 'vite.config.ts exists');
checkFileExists('tsconfig.json', 'tsconfig.json exists');
checkFileExists('vercel.json', 'vercel.json exists (deployment config)');
checkFileExists('.gitignore', '.gitignore exists');

console.log('\n📚 Checking Documentation...\n');

// Check documentation
checkFileExists('README.md', 'README.md exists');
checkFileExists('LICENSE', 'LICENSE file exists');
checkFileExists('DEPLOYMENT_READY.md', 'DEPLOYMENT_READY.md exists');
checkFileExists('QUICK_START.md', 'QUICK_START.md exists');

console.log('\n🔧 Checking Core Components...\n');

// Check core components
checkFileExists('components/StreamlinedDashboard.tsx', 'Main Dashboard component');
checkFileExists('components/KanbanBoard.tsx', 'Kanban Board component');
checkFileExists('components/AnalyticsDashboard.tsx', 'Analytics Dashboard');
checkFileExists('components/LoginPageFixed.tsx', 'Login Page');
checkFileExists('components/RegistrationPage.tsx', 'Registration Page');
checkFileExists('components/Homepage.tsx', 'Homepage');

console.log('\n🎨 Checking UI Components...\n');

// Check UI components
checkFileExists('components/ui/button.tsx', 'Button component');
checkFileExists('components/ui/card.tsx', 'Card component');
checkFileExists('components/ui/dialog.tsx', 'Dialog component');

console.log('\n🔐 Checking Contexts...\n');

// Check contexts
checkFileExists('contexts/LocalOnlyAuthContext.tsx', 'Auth Context');
checkFileExists('contexts/StorageContext.tsx', 'Storage Context');

console.log('\n💾 Checking Utils...\n');

// Check utils
checkFileExists('utils/local-storage-database.ts', 'Local Storage Database');
checkFileExists('utils/storage-quota-manager.ts', 'Storage Quota Manager');

console.log('\n🎨 Checking Styles...\n');

// Check styles
checkFileExists('styles/globals.css', 'Global CSS');

console.log('\n🔍 Checking Configuration...\n');

// Check package.json content
if (checkFileExists('package.json', 'package.json readable')) {
  checkFileContent('package.json', '"build":', 'Build script configured');
  checkFileContent('package.json', '"dev":', 'Dev script configured');
  checkFileContent('package.json', '"preview":', 'Preview script configured');
  checkFileContent('package.json', '"react":', 'React dependency present');
  checkFileContent('package.json', '"typescript":', 'TypeScript dependency present');
  checkFileContent('package.json', '"vite":', 'Vite dependency present');
}

console.log('\n📦 Checking Build Configuration...\n');

// Check vite config
if (checkFileExists('vite.config.ts', 'vite.config.ts readable')) {
  checkFileContent('vite.config.ts', 'react()', 'React plugin configured');
  checkFileContent('vite.config.ts', 'tailwindcss', 'Tailwind CSS configured');
  checkFileContent('vite.config.ts', 'build:', 'Build settings present');
}

console.log('\n🌐 Checking Deployment Config...\n');

// Check vercel.json
if (checkFileExists('vercel.json', 'vercel.json readable')) {
  checkFileContent('vercel.json', '"buildCommand":', 'Build command configured');
  checkFileContent('vercel.json', '"outputDirectory":', 'Output directory configured');
  checkFileContent('vercel.json', 'rewrites', 'SPA rewrites configured');
}

console.log('\n📄 Checking HTML Template...\n');

// Check index.html
if (checkFileExists('index.html', 'index.html readable')) {
  checkFileContent('index.html', 'DevTrack Africa', 'Title set correctly');
  checkFileContent('index.html', 'meta name="description"', 'Meta description present');
  checkFileContent('index.html', 'og:title', 'Open Graph tags present');
}

console.log('\n🔒 Checking Security...\n');

// Check .gitignore
if (checkFileExists('.gitignore', '.gitignore readable')) {
  checkFileContent('.gitignore', 'node_modules', '.gitignore includes node_modules');
  checkFileContent('.gitignore', '.env', '.gitignore includes .env files');
  checkFileContent('.gitignore', 'dist', '.gitignore includes dist folder');
}

console.log('\n' + '='.repeat(50));
console.log('\n📊 SUMMARY\n');

if (allChecksPassed && issues.length === 0) {
  console.log('🎉 ALL CHECKS PASSED! Your app is ready for deployment!\n');
  
  if (warnings.length > 0) {
    console.log(`⚠️  You have ${warnings.length} warning(s):\n`);
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
    console.log('\nThese warnings are not critical but should be reviewed.\n');
  }
  
  console.log('Next Steps:');
  console.log('1. Run: npm run build');
  console.log('2. Test: npm run preview');
  console.log('3. Deploy: Push to GitHub and import to Vercel');
  console.log('\nSee DEPLOYMENT_GUIDE_SIMPLE.md for detailed instructions.');
  
  process.exit(0);
} else {
  console.log(`❌ CHECKS FAILED! Found ${issues.length} critical issue(s):\n`);
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Also found ${warnings.length} warning(s):\n`);
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  console.log('\nPlease fix the critical issues before deploying.');
  console.log('See documentation for help: README.md\n');
  
  process.exit(1);
}
