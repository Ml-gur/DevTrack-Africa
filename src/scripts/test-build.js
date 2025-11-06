#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing production build...');

// Step 1: Clean previous build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('🧹 Cleaned previous build');
}

// Step 2: Run build
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'production' }
});

let buildOutput = '';
let buildErrors = '';

buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  buildOutput += output;
  process.stdout.write(output);
});

buildProcess.stderr.on('data', (data) => {
  const error = data.toString();
  buildErrors += error;
  process.stderr.write(error);
});

buildProcess.on('close', (code) => {
  console.log(`\n📊 Build process finished with code: ${code}`);
  
  if (code === 0) {
    console.log('✅ Build successful!');
    
    // Check build output
    if (fs.existsSync('dist')) {
      const distSize = getDirSize('dist');
      console.log(`📦 Build size: ${(distSize / 1024 / 1024).toFixed(2)} MB`);
      
      // Check for critical files
      const criticalFiles = [
        'dist/index.html',
        'dist/assets'
      ];
      
      const missingFiles = criticalFiles.filter(file => !fs.existsSync(file));
      
      if (missingFiles.length === 0) {
        console.log('✅ All critical build files present');
      } else {
        console.log(`❌ Missing critical files: ${missingFiles.join(', ')}`);
        process.exit(1);
      }
      
      // Check for console.log in production build
      checkProductionBuild();
      
    } else {
      console.log('❌ Build directory not found');
      process.exit(1);
    }
  } else {
    console.log('❌ Build failed');
    
    // Save build errors for analysis
    fs.writeFileSync('build-errors.log', buildErrors);
    console.log('📝 Build errors saved to build-errors.log');
    
    process.exit(1);
  }
});

function getDirSize(dirPath) {
  let size = 0;
  
  function calculateSize(filePath) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        calculateSize(path.join(filePath, file));
      });
    } else {
      size += stat.size;
    }
  }
  
  calculateSize(dirPath);
  return size;
}

function checkProductionBuild() {
  console.log('🔍 Checking production build for console statements...');
  
  const jsFiles = findJSFiles('dist');
  let consoleCount = 0;
  
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Look for console.log but allow console.warn and console.error
    const matches = content.match(/console\.log\s*\(/g);
    if (matches) {
      consoleCount += matches.length;
      console.log(`⚠️ Found ${matches.length} console.log statements in ${path.relative('dist', file)}`);
    }
  });
  
  if (consoleCount === 0) {
    console.log('✅ No console.log statements found in production build');
  } else {
    console.log(`❌ Found ${consoleCount} console.log statements in production build`);
    console.log('💡 Consider using a build tool to strip console statements in production');
  }
}

function findJSFiles(dir) {
  let jsFiles = [];
  
  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverse(filePath);
      } else if (file.endsWith('.js') && !file.endsWith('.map')) {
        jsFiles.push(filePath);
      }
    });
  }
  
  traverse(dir);
  return jsFiles;
}