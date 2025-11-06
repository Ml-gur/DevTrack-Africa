#!/usr/bin/env node

/**
 * PWA Installation Readiness Verification Script
 * Checks if all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 PWA Desktop Installation Readiness Check\n');
console.log('='.repeat(60));

let totalChecks = 0;
let passedChecks = 0;
let criticalIssues = 0;

const check = (name, condition, critical = false) => {
  totalChecks++;
  if (condition) {
    console.log(`✅ ${name}`);
    passedChecks++;
  } else {
    const icon = critical ? '❌' : '⚠️';
    console.log(`${icon} ${name} ${critical ? '(CRITICAL)' : '(Warning)'}`);
    if (critical) criticalIssues++;
  }
};

// Check manifest file
console.log('\n📄 Manifest File\n' + '-'.repeat(60));
try {
  const manifestPath = path.join(__dirname, 'public', 'site.webmanifest');
  const manifestExists = fs.existsSync(manifestPath);
  check('Manifest file exists', manifestExists, true);
  
  if (manifestExists) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    check('Manifest has name', !!manifest.name, true);
    check('Manifest has short_name', !!manifest.short_name);
    check('Manifest has start_url', !!manifest.start_url, true);
    check('Manifest has display mode', !!manifest.display, true);
    check('Manifest has theme_color', !!manifest.theme_color);
    check('Manifest has background_color', !!manifest.background_color);
    check('Manifest has icons array', Array.isArray(manifest.icons), true);
    
    if (Array.isArray(manifest.icons)) {
      const has192 = manifest.icons.some(icon => icon.sizes === '192x192');
      const has512 = manifest.icons.some(icon => icon.sizes === '512x512');
      check('Manifest declares 192x192 icon', has192, true);
      check('Manifest declares 512x512 icon', has512, true);
      check('Manifest has shortcuts', Array.isArray(manifest.shortcuts));
      check('Manifest has display_override', Array.isArray(manifest.display_override));
    }
  }
} catch (error) {
  check('Manifest file readable', false, true);
  console.log(`   Error: ${error.message}`);
}

// Check service worker
console.log('\n⚙️ Service Worker\n' + '-'.repeat(60));
try {
  const swPath = path.join(__dirname, 'public', 'service-worker.js');
  const swExists = fs.existsSync(swPath);
  check('Service worker file exists', swExists, true);
  
  if (swExists) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    check('Service worker has install event', swContent.includes("addEventListener('install'"), true);
    check('Service worker has activate event', swContent.includes("addEventListener('activate'"), true);
    check('Service worker has fetch handler', swContent.includes("addEventListener('fetch'"), true);
    check('Service worker has cache strategy', swContent.includes('cache'), true);
    check('Service worker has offline fallback', swContent.includes('offline') || swContent.includes('cache.match'));
    check('Service worker has background sync', swContent.includes("addEventListener('sync'"));
    check('Service worker has push notifications', swContent.includes("addEventListener('push'"));
  }
} catch (error) {
  check('Service worker readable', false, true);
  console.log(`   Error: ${error.message}`);
}

// Check icons (CRITICAL)
console.log('\n🎨 Icons (CRITICAL for installation)\n' + '-'.repeat(60));
const publicDir = path.join(__dirname, 'public');

const iconChecks = [
  { name: 'favicon.svg', critical: false },
  { name: 'favicon-16x16.png', critical: false },
  { name: 'favicon-32x32.png', critical: false },
  { name: 'apple-touch-icon.png', critical: false },
  { name: 'icon-192x192.png', critical: true, required: true },
  { name: 'icon-512x512.png', critical: true, required: true }
];

iconChecks.forEach(icon => {
  const iconPath = path.join(publicDir, icon.name);
  const exists = fs.existsSync(iconPath);
  const label = icon.required ? `${icon.name} (REQUIRED)` : icon.name;
  check(label, exists, icon.critical);
  
  if (exists && icon.name.includes('.png')) {
    const stats = fs.statSync(iconPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   Size: ${sizeKB} KB`);
  }
});

// Check HTML file
console.log('\n📝 HTML Configuration\n' + '-'.repeat(60));
try {
  const htmlPath = path.join(__dirname, 'index.html');
  const htmlExists = fs.existsSync(htmlPath);
  check('index.html exists', htmlExists, true);
  
  if (htmlExists) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    check('Has manifest link', htmlContent.includes('rel="manifest"'), true);
    check('Has theme-color meta', htmlContent.includes('name="theme-color"'));
    check('Has apple-mobile-web-app-capable', htmlContent.includes('apple-mobile-web-app-capable'));
    check('Has viewport meta', htmlContent.includes('name="viewport"'), true);
    check('Has PWA meta tags', htmlContent.includes('mobile-web-app-capable'));
  }
} catch (error) {
  check('HTML file readable', false, true);
  console.log(`   Error: ${error.message}`);
}

// Check PWA components
console.log('\n🔧 PWA Components\n' + '-'.repeat(60));
const componentsDir = path.join(__dirname, 'components');
const pwaComponents = [
  { name: 'PWAInstallPrompt.tsx', critical: false },
  { name: 'PWAUpdatePrompt.tsx', critical: false },
  { name: 'OfflineIndicator.tsx', critical: false },
  { name: 'hooks/usePWA.ts', critical: true }
];

pwaComponents.forEach(comp => {
  const compPath = path.join(componentsDir, comp.name);
  check(comp.name, fs.existsSync(compPath), comp.critical);
});

// Check App.tsx integration
console.log('\n🚀 App Integration\n' + '-'.repeat(60));
try {
  const appPath = path.join(__dirname, 'App.tsx');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');
    check('PWAInstallPrompt imported', appContent.includes('PWAInstallPrompt'));
    check('PWAUpdatePrompt imported', appContent.includes('PWAUpdatePrompt'));
    check('OfflineIndicator imported', appContent.includes('OfflineIndicator'));
    check('PWA components rendered', appContent.includes('<PWAInstallPrompt') || appContent.includes('<PWAUpdatePrompt'));
  }
} catch (error) {
  console.log(`   Warning: Could not check App.tsx integration`);
}

// Check vite config
console.log('\n⚡ Build Configuration\n' + '-'.repeat(60));
try {
  const viteConfigPath = path.join(__dirname, 'vite.config.ts');
  if (fs.existsSync(viteConfigPath)) {
    const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
    check('Vite config exists', true);
    check('Public directory configured', viteContent.includes('publicDir'));
    check('Build optimization configured', viteContent.includes('build'));
  }
} catch (error) {
  console.log(`   Warning: Could not check vite config`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY\n');

const percentage = Math.round((passedChecks / totalChecks) * 100);
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${totalChecks - passedChecks}`);
console.log(`Critical Issues: ${criticalIssues}`);
console.log(`\nCompletion: ${percentage}%`);

if (criticalIssues === 0) {
  console.log('\n✅ ✅ ✅ ALL CRITICAL CHECKS PASSED! ✅ ✅ ✅\n');
  console.log('🎉 Your PWA is ready for desktop installation!\n');
  console.log('Next steps:');
  console.log('1. Build: npm run build');
  console.log('2. Test locally: npm run preview');
  console.log('3. Deploy to production');
  console.log('4. Test installation on deployed URL\n');
} else {
  console.log('\n❌ CRITICAL ISSUES FOUND!\n');
  console.log('⚠️  Your PWA cannot be installed until these are fixed.\n');
  
  if (criticalIssues === 2 && 
      (!fs.existsSync(path.join(publicDir, 'icon-192x192.png')) || 
       !fs.existsSync(path.join(publicDir, 'icon-512x512.png')))) {
    console.log('🔧 QUICK FIX:\n');
    console.log('Missing icons are the only critical issue!');
    console.log('\nGenerate them now:');
    console.log('1. Open: http://localhost:5173/generate-icons.html');
    console.log('2. Click "Generate All Icons"');
    console.log('3. Move files to /public/ folder');
    console.log('4. Run this script again to verify\n');
    console.log('📖 Read: PWA_INSTALL_FIX_QUICK_START.md for detailed steps\n');
  }
}

// Icon generation reminder
if (!fs.existsSync(path.join(publicDir, 'icon-192x192.png')) ||
    !fs.existsSync(path.join(publicDir, 'icon-512x512.png'))) {
  console.log('💡 TIP: Use the icon generator tool:');
  console.log('   → Open: /public/generate-icons.html in your browser\n');
}

console.log('='.repeat(60) + '\n');

// Exit code
process.exit(criticalIssues > 0 ? 1 : 0);
