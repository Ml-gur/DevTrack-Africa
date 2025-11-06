#!/usr/bin/env node

/**
 * Pre-deployment checks for DevTrack Africa
 * 
 * This script runs various checks to ensure the application
 * is ready for production deployment.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logSuccess(message) {
  log(COLORS.GREEN, `✅ ${message}`);
}

function logWarning(message) {
  log(COLORS.YELLOW, `⚠️  ${message}`);
}

function logError(message) {
  log(COLORS.RED, `❌ ${message}`);
}

function logInfo(message) {
  log(COLORS.BLUE, `ℹ️  ${message}`);
}

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkImports() {
  logInfo('Checking import/export consistency...');
  
  const criticalFiles = [
    'components/figma/ImageWithFallback.tsx',
    'components/ProjectShowcaseCreator.tsx',
    'components/EnhancedDashboard-FIXED.tsx',
    'utils/supabase/unified-connection-manager.ts',
    'utils/production-logger.ts'
  ];

  let hasErrors = false;

  for (const file of criticalFiles) {
    const exists = await checkFileExists(file);
    if (!exists) {
      logError(`Critical file missing: ${file}`);
      hasErrors = true;
    } else {
      logSuccess(`File exists: ${file}`);
    }
  }

  return !hasErrors;
}

async function checkPackageJson() {
  logInfo('Checking package.json configuration...');
  
  try {
    const packageJson = JSON.parse(
      await fs.promises.readFile('package.json', 'utf8')
    );

    // Check required scripts
    const requiredScripts = ['build', 'dev', 'preview'];
    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        logError(`Missing script: ${script}`);
        return false;
      }
    }

    // Check critical dependencies
    const criticalDeps = [
      '@supabase/supabase-js',
      'react',
      'react-dom',
      'lucide-react',
      'motion'
    ];

    for (const dep of criticalDeps) {
      if (!packageJson.dependencies[dep]) {
        logError(`Missing dependency: ${dep}`);
        return false;
      }
    }

    logSuccess('Package.json configuration looks good');
    return true;
  } catch (error) {
    logError(`Error reading package.json: ${error.message}`);
    return false;
  }
}

async function checkEnvironmentTemplate() {
  logInfo('Checking environment setup...');
  
  const envExample = await checkFileExists('.env.example');
  if (!envExample) {
    logWarning('No .env.example file found - consider creating one for deployment guidance');
  } else {
    logSuccess('Environment template exists');
  }

  return true;
}

async function runTypeCheck() {
  logInfo('Running TypeScript type check...');
  
  try {
    await execAsync('npx tsc --noEmit --skipLibCheck');
    logSuccess('TypeScript type check passed');
    return true;
  } catch (error) {
    logError('TypeScript type check failed:');
    console.log(error.stdout);
    console.log(error.stderr);
    return false;
  }
}

async function runBuildTest() {
  logInfo('Testing production build...');
  
  try {
    const { stdout, stderr } = await execAsync('npm run build');
    
    if (stderr && stderr.includes('error')) {
      logError('Build failed with errors:');
      console.log(stderr);
      return false;
    }

    logSuccess('Production build completed successfully');
    
    // Check if dist folder was created
    const distExists = await checkFileExists('dist');
    if (!distExists) {
      logError('Build output directory (dist) not found');
      return false;
    }

    logSuccess('Build output directory created');
    return true;
  } catch (error) {
    logError('Build failed:');
    console.log(error.stdout);
    console.log(error.stderr);
    return false;
  }
}

async function checkVercelConfig() {
  logInfo('Checking Vercel configuration...');
  
  const vercelConfigExists = await checkFileExists('vercel.json');
  if (!vercelConfigExists) {
    logError('vercel.json not found');
    return false;
  }

  try {
    const vercelConfig = JSON.parse(
      await fs.promises.readFile('vercel.json', 'utf8')
    );

    // Check required configuration
    if (!vercelConfig.buildCommand) {
      logWarning('No buildCommand specified in vercel.json');
    }

    if (!vercelConfig.outputDirectory) {
      logWarning('No outputDirectory specified in vercel.json');
    }

    if (!vercelConfig.rewrites) {
      logWarning('No rewrites configured for SPA routing');
    }

    logSuccess('Vercel configuration exists');
    return true;
  } catch (error) {
    logError(`Error reading vercel.json: ${error.message}`);
    return false;
  }
}

async function runAllChecks() {
  log(COLORS.BLUE, '🚀 Running DevTrack Africa Pre-Deployment Checks...\n');

  const checks = [
    { name: 'Import/Export Consistency', fn: checkImports },
    { name: 'Package Configuration', fn: checkPackageJson },
    { name: 'Environment Setup', fn: checkEnvironmentTemplate },
    { name: 'TypeScript Check', fn: runTypeCheck },
    { name: 'Production Build', fn: runBuildTest },
    { name: 'Vercel Configuration', fn: checkVercelConfig }
  ];

  let allPassed = true;

  for (const check of checks) {
    logInfo(`\n--- ${check.name} ---`);
    try {
      const passed = await check.fn();
      if (!passed) {
        allPassed = false;
      }
    } catch (error) {
      logError(`${check.name} failed with error: ${error.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    logSuccess('🎉 All pre-deployment checks passed!');
    logInfo('Your application is ready for production deployment.');
    process.exit(0);
  } else {
    logError('❌ Some checks failed. Please fix the issues before deploying.');
    process.exit(1);
  }
}

// Run checks if script is executed directly
if (require.main === module) {
  runAllChecks().catch(error => {
    logError(`Pre-deployment checks failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllChecks,
  checkImports,
  checkPackageJson,
  runTypeCheck,
  runBuildTest,
  checkVercelConfig
};