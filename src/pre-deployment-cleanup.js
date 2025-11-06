#!/usr/bin/env node

/**
 * Pre-deployment cleanup script for DevTrack Africa
 * Ensures no edge functions or server-side code causes deployment issues
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting pre-deployment cleanup...');

// Remove problematic edge function files
const filesToRemove = [
  'supabase/functions/server/index.tsx',
  'supabase/functions/server/kv_store.tsx',
  'supabase/functions/server/REMOVED.md'
];

const directoriesToRemove = [
  'supabase/functions/server'
];

// Remove files
filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ Removed file: ${file}`);
    } catch (error) {
      console.log(`⚠️ Could not remove file ${file}:`, error.message);
    }
  }
});

// Remove directories
directoriesToRemove.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dir}`);
    } catch (error) {
      console.log(`⚠️ Could not remove directory ${dir}:`, error.message);
    }
  }
});

// Verify Supabase config
const configPath = 'supabase/config.toml';
if (fs.existsSync(configPath)) {
  const config = fs.readFileSync(configPath, 'utf8');
  if (config.includes('enabled = false') && config.includes('[edge_functions]')) {
    console.log('✅ Supabase config properly disables edge functions');
  } else {
    console.log('⚠️ Supabase config may need edge functions disabled');
  }
}

// Verify Vercel config
const vercelPath = 'vercel.json';
if (fs.existsSync(vercelPath)) {
  const vercel = fs.readFileSync(vercelPath, 'utf8');
  if (vercel.includes('functions/**') && vercel.includes('ignore')) {
    console.log('✅ Vercel config properly ignores edge functions');
  } else {
    console.log('⚠️ Vercel config may need edge function ignores');
  }
}

console.log('🎉 Pre-deployment cleanup complete!');
console.log('📦 DevTrack Africa is ready for client-side deployment');