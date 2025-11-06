/**
 * Production Readiness Check
 * Comprehensive validation before deployment
 */

const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPass(name, detail) {
  checks.passed.push({ name, detail });
  log(`✓ ${name}`, 'green');
  if (detail) log(`  ${detail}`, 'cyan');
}

function checkFail(name, detail) {
  checks.failed.push({ name, detail });
  log(`✗ ${name}`, 'red');
  if (detail) log(`  ${detail}`, 'yellow');
}

function checkWarn(name, detail) {
  checks.warnings.push({ name, detail });
  log(`⚠ ${name}`, 'yellow');
  if (detail) log(`  ${detail}`, 'cyan');
}

// Check 1: Required files exist
function checkRequiredFiles() {
  log('\n📁 Checking Required Files...', 'blue');
  
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'index.html',
    'production.config.ts',
    'components/ProductionErrorBoundary.tsx',
    'utils/production-performance-monitor.ts',
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      checkPass(`${file} exists`);
    } else {
      checkFail(`${file} missing`, 'This file is required for production');
    }
  });
}

// Check 2: Package.json validation
function checkPackageJson() {
  log('\n📦 Checking package.json...', 'blue');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for required scripts
    const requiredScripts = ['build', 'preview', 'dev'];
    requiredScripts.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        checkPass(`Script "${script}" defined`);
      } else {
        checkFail(`Script "${script}" missing`);
      }
    });

    // Check for critical dependencies
    const criticalDeps = ['react', 'react-dom', 'vite'];
    criticalDeps.forEach(dep => {
      if (pkg.dependencies && pkg.dependencies[dep]) {
        checkPass(`Dependency "${dep}" installed`);
      } else {
        checkFail(`Dependency "${dep}" missing`);
      }
    });

    // Check version
    if (pkg.version) {
      checkPass(`Version: ${pkg.version}`);
    } else {
      checkWarn('No version specified');
    }

  } catch (error) {
    checkFail('Failed to parse package.json', error.message);
  }
}

// Check 3: TypeScript configuration
function checkTypeScript() {
  log('\n📘 Checking TypeScript...', 'blue');
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    if (tsconfig.compilerOptions) {
      checkPass('TypeScript config valid');
      
      // Check strict mode
      if (tsconfig.compilerOptions.strict) {
        checkPass('Strict mode enabled');
      } else {
        checkWarn('Strict mode disabled', 'Consider enabling for better type safety');
      }
    }
  } catch (error) {
    checkFail('TypeScript config invalid', error.message);
  }
}

// Check 4: Environment configuration
function checkEnvironment() {
  log('\n🌍 Checking Environment...', 'blue');
  
  // Check for .env files (should not exist in repo)
  if (fs.existsSync('.env')) {
    checkWarn('.env file exists', 'Ensure it\'s in .gitignore');
  }

  // Check production config
  if (fs.existsSync('production.config.ts')) {
    try {
      const config = fs.readFileSync('production.config.ts', 'utf8');
      
      if (config.includes('enableDebugTools: false')) {
        checkPass('Debug tools disabled in production');
      } else {
        checkWarn('Debug tools may be enabled', 'Review production.config.ts');
      }

      if (config.includes('enableConsoleLogging: false')) {
        checkPass('Console logging disabled in production');
      } else {
        checkWarn('Console logging may be enabled');
      }
    } catch (error) {
      checkFail('Failed to read production config', error.message);
    }
  }
}

// Check 5: Security checks
function checkSecurity() {
  log('\n🔒 Checking Security...', 'blue');
  
  // Check for sensitive data in code
  const sensitivePatterns = [
    { pattern: /password\s*=\s*['"]/i, name: 'Hardcoded password' },
    { pattern: /api[_-]?key\s*=\s*['"]/i, name: 'Hardcoded API key' },
    { pattern: /secret\s*=\s*['"]/i, name: 'Hardcoded secret' },
    { pattern: /token\s*=\s*['"][^'"]{20,}/i, name: 'Hardcoded token' },
  ];

  let foundSensitive = false;
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      sensitivePatterns.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
          checkWarn(`${name} found in ${filePath}`, 'Review and remove sensitive data');
          foundSensitive = true;
        }
      });
    } catch (error) {
      // Ignore read errors
    }
  }

  // Scan main files
  ['App.tsx', 'production.config.ts'].forEach(file => {
    if (fs.existsSync(file)) {
      scanFile(file);
    }
  });

  if (!foundSensitive) {
    checkPass('No hardcoded sensitive data found');
  }
}

// Check 6: Build test
function checkBuild() {
  log('\n🔨 Checking Build Configuration...', 'blue');
  
  // Check vite config
  if (fs.existsSync('vite.config.ts')) {
    try {
      const config = fs.readFileSync('vite.config.ts', 'utf8');
      
      if (config.includes('build:')) {
        checkPass('Build configuration exists');
      }

      if (config.includes('minify')) {
        checkPass('Minification enabled');
      } else {
        checkWarn('Minification may not be configured');
      }
    } catch (error) {
      checkFail('Failed to read vite config', error.message);
    }
  }

  // Check for dist directory (from previous builds)
  if (fs.existsSync('dist')) {
    checkPass('Dist directory exists (previous build)');
  } else {
    checkWarn('No dist directory', 'Run npm run build to test');
  }
}

// Check 7: Code quality
function checkCodeQuality() {
  log('\n✨ Checking Code Quality...', 'blue');
  
  // Check for ESLint
  if (fs.existsSync('eslint.config.js') || fs.existsSync('.eslintrc.json')) {
    checkPass('ESLint configured');
  } else {
    checkWarn('ESLint not configured', 'Consider adding linting');
  }

  // Check for console.log in components (should be minimal)
  const componentsDir = 'components';
  if (fs.existsSync(componentsDir)) {
    let consoleLogCount = 0;
    
    function scanDir(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
          scanDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = content.match(/console\.(log|debug|info)/g);
            if (matches) {
              consoleLogCount += matches.length;
            }
          } catch (error) {
            // Ignore
          }
        }
      });
    }

    scanDir(componentsDir);
    
    if (consoleLogCount === 0) {
      checkPass('No console.log statements found');
    } else if (consoleLogCount < 10) {
      checkWarn(`${consoleLogCount} console statements found`, 'Consider using logger instead');
    } else {
      checkFail(`${consoleLogCount} console statements found`, 'Clean up console statements');
    }
  }
}

// Check 8: Accessibility
function checkAccessibility() {
  log('\n♿ Checking Accessibility...', 'blue');
  
  // Check for common accessibility issues in index.html
  if (fs.existsSync('index.html')) {
    const html = fs.readFileSync('index.html', 'utf8');
    
    if (html.includes('lang=')) {
      checkPass('HTML lang attribute set');
    } else {
      checkFail('HTML lang attribute missing');
    }

    if (html.includes('<title>')) {
      checkPass('Page title exists');
    } else {
      checkFail('Page title missing');
    }

    if (html.includes('meta name="description"')) {
      checkPass('Meta description exists');
    } else {
      checkWarn('Meta description missing', 'Add for better SEO');
    }

    if (html.includes('theme-color')) {
      checkPass('Theme color set');
    } else {
      checkWarn('Theme color not set');
    }
  }
}

// Check 9: Performance
function checkPerformance() {
  log('\n⚡ Checking Performance...', 'blue');
  
  // Check for lazy loading
  const appFile = 'App.tsx';
  if (fs.existsSync(appFile)) {
    const content = fs.readFileSync(appFile, 'utf8');
    
    if (content.includes('lazy(')) {
      checkPass('Lazy loading implemented');
    } else {
      checkWarn('No lazy loading found', 'Consider code splitting');
    }
  }

  // Check for production config
  if (fs.existsSync('production.config.ts')) {
    const config = fs.readFileSync('production.config.ts', 'utf8');
    
    if (config.includes('enablePerformanceMonitoring')) {
      checkPass('Performance monitoring configured');
    }
  }
}

// Check 10: Error handling
function checkErrorHandling() {
  log('\n🛡️  Checking Error Handling...', 'blue');
  
  if (fs.existsSync('components/ProductionErrorBoundary.tsx')) {
    checkPass('Error boundary exists');
  } else {
    checkFail('Error boundary missing', 'Critical for production');
  }

  // Check if error boundary is used in App
  const appFile = 'App.tsx';
  if (fs.existsSync(appFile)) {
    const content = fs.readFileSync(appFile, 'utf8');
    
    if (content.includes('ErrorBoundary')) {
      checkPass('Error boundary implemented in App');
    } else {
      checkWarn('Error boundary not used in App', 'Wrap your app with error boundary');
    }
  }
}

// Generate report
function generateReport() {
  log('\n' + '='.repeat(60), 'cyan');
  log('         PRODUCTION READINESS REPORT', 'cyan');
  log('='.repeat(60), 'cyan');

  log(`\n✓ Passed: ${checks.passed.length}`, 'green');
  log(`⚠ Warnings: ${checks.warnings.length}`, 'yellow');
  log(`✗ Failed: ${checks.failed.length}`, 'red');

  const totalChecks = checks.passed.length + checks.warnings.length + checks.failed.length;
  const score = ((checks.passed.length / totalChecks) * 100).toFixed(1);

  log(`\n📊 Score: ${score}%`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');

  if (checks.failed.length > 0) {
    log('\n❌ Critical Issues (Must Fix):', 'red');
    checks.failed.forEach((check, i) => {
      log(`${i + 1}. ${check.name}`, 'red');
      if (check.detail) log(`   ${check.detail}`, 'yellow');
    });
  }

  if (checks.warnings.length > 0) {
    log('\n⚠️  Warnings (Should Review):', 'yellow');
    checks.warnings.forEach((check, i) => {
      log(`${i + 1}. ${check.name}`, 'yellow');
      if (check.detail) log(`   ${check.detail}`, 'cyan');
    });
  }

  log('\n' + '='.repeat(60), 'cyan');

  if (checks.failed.length === 0) {
    log('\n🎉 Ready for Production!', 'green');
    log('All critical checks passed. Review warnings before deploying.\n', 'cyan');
    return true;
  } else {
    log('\n⛔ Not Ready for Production', 'red');
    log('Fix critical issues before deploying.\n', 'yellow');
    return false;
  }
}

// Run all checks
function runAllChecks() {
  log('\n🚀 Running Production Readiness Checks...', 'blue');
  log('='.repeat(60) + '\n', 'cyan');

  checkRequiredFiles();
  checkPackageJson();
  checkTypeScript();
  checkEnvironment();
  checkSecurity();
  checkBuild();
  checkCodeQuality();
  checkAccessibility();
  checkPerformance();
  checkErrorHandling();

  const ready = generateReport();
  
  // Exit with error code if not ready
  process.exit(ready ? 0 : 1);
}

// Run checks
runAllChecks();
