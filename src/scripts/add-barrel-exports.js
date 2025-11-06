#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Component directories that might need barrel exports
const componentDirs = [
  'components',
  'components/ui',
  'components/figma',
  'contexts',
  'utils',
  'utils/supabase',
  'lib'
];

// Create barrel exports for component directories
function createBarrelExports() {
  componentDirs.forEach(dir => {
    const fullPath = path.resolve(process.cwd(), dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏩ Skipping ${dir} - directory doesn't exist`);
      return;
    }

    const files = fs.readdirSync(fullPath);
    const componentFiles = files.filter(file => 
      (file.endsWith('.tsx') || file.endsWith('.ts')) && 
      !file.startsWith('index.') &&
      !file.includes('.test.') &&
      !file.includes('.spec.')
    );

    if (componentFiles.length === 0) {
      console.log(`⏩ Skipping ${dir} - no component files found`);
      return;
    }

    const indexPath = path.join(fullPath, 'index.ts');
    
    // Don't overwrite existing index files that have substantial content
    if (fs.existsSync(indexPath)) {
      const existingContent = fs.readFileSync(indexPath, 'utf8');
      if (existingContent.length > 200) {
        console.log(`⏩ Skipping ${dir} - index.ts already exists with substantial content`);
        return;
      }
    }

    // Generate barrel exports
    const exports = componentFiles.map(file => {
      const name = path.parse(file).name;
      const extension = path.parse(file).ext;
      
      // Handle different export patterns
      if (name.includes('Context') || name.includes('Provider')) {
        // For contexts, export both named and default
        return `export { default as ${name}, ${name.replace('Context', '').replace('Provider', '')} } from './${name}${extension === '.tsx' ? '' : extension}';`;
      } else {
        // For regular components, export both patterns for compatibility
        return `export { default as ${name} } from './${name}${extension === '.tsx' ? '' : extension}';
export { default as ${name}Component } from './${name}${extension === '.tsx' ? '' : extension}';`;
      }
    }).join('\n');

    const content = `// Auto-generated barrel exports for ${dir}
// This file provides compatibility between different import styles

${exports}
`;

    fs.writeFileSync(indexPath, content);
    console.log(`✅ Created barrel exports for ${dir} (${componentFiles.length} files)`);
  });
}

// Create specific compatibility exports for known issues
function createSpecificFixes() {
  // Fix for ImageWithFallback if not already fixed
  const figmaIndexPath = path.resolve(process.cwd(), 'components/figma/index.ts');
  if (!fs.existsSync(figmaIndexPath)) {
    const content = `// Barrel export for figma components to fix import compatibility
export { ImageWithFallback } from './ImageWithFallback';
export { ImageWithFallback as default } from './ImageWithFallback';
`;
    fs.writeFileSync(figmaIndexPath, content);
    console.log('✅ Fixed ImageWithFallback import compatibility');
  }

  // Create lib index for new client
  const libIndexPath = path.resolve(process.cwd(), 'lib/index.ts');
  if (!fs.existsSync(libIndexPath)) {
    const content = `// Main lib exports
export { default as supabase, auth, hasSupabaseConfig, testConnection, dbQuery } from './supabaseClient';
export * from './legacySupabaseWrappers';
`;
    fs.writeFileSync(libIndexPath, content);
    console.log('✅ Created lib barrel exports');
  }
}

// Main execution
console.log('🔧 Adding barrel exports for component compatibility...');

try {
  createBarrelExports();
  createSpecificFixes();
  console.log('✅ Barrel export creation complete');
} catch (error) {
  console.error('❌ Error creating barrel exports:', error);
  process.exit(1);
}