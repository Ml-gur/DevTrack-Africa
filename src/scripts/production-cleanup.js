/**
 * Production Cleanup Script
 * Identifies and lists files that should be removed or gated for production
 */

const fs = require('fs');
const path = require('path');

// Files and patterns to remove/gate in production
const CLEANUP_PATTERNS = {
  // Test and debug components
  testComponents: [
    'TestAuthHelper.tsx',
    'TestingDashboard.tsx',
    'DatabaseTestPage.tsx',
    'SupabaseTestDashboard.tsx',
    'LocalStorageTest.tsx',
    'SupabasePersistenceTester.tsx',
    'ComprehensiveTestingDashboard.tsx',
    'CriticalFunctionalityTester.tsx',
    'DataPersistenceValidator.tsx',
    'DatabaseErrorTest.tsx',
    'ProfileAutoCreationTester.tsx',
    'RegistrationTestHelper.tsx',
    'ProductionAuditDashboard.tsx',
  ],

  // Debug and diagnostic components
  debugComponents: [
    'AuthDebugPanel.tsx',
    'AuthDebugStatus.tsx',
    'SupabaseConnectionDiagnostics.tsx',
    'DatabaseSetupHelper.tsx',
    'DatabaseSetupPage.tsx',
    'DatabaseSetupRequired.tsx',
    'DatabaseStatus.tsx',
    'EmergencyDatabaseSetup.tsx',
    'RegistrationDiagnostic.tsx',
    'RegistrationQuickFix.tsx',
    'ConnectionStatus.tsx',
    'DatabaseErrorInterceptor.tsx',
    'DatabaseSetupErrorHandler.tsx',
  ],

  // Duplicate/redundant components (keep only the best version)
  duplicateComponents: [
    'Dashboard.tsx', // Use EnhancedDashboard instead
    'CommunityFeed.tsx', // Use CommunityFeedFixed instead
    'LoginPage.tsx', // Use LoginPageFixed instead
    'SupabaseDashboard.tsx', // Use SupabaseDashboardComplete instead
    'EnhancedDashboard-FIXED.tsx', // Merge into EnhancedDashboard
    'FixedEnhancedDashboard.tsx', // Merge into EnhancedDashboard
    'MessagesHub.tsx', // Use EnhancedMessagingHub instead
    'PeopleDiscovery.tsx', // Use EnhancedPeopleDiscovery instead
    'ProjectForm.tsx', // Use EnhancedProjectCreationWizard instead
    'ProjectAnalytics.tsx', // Use EnhancedProjectAnalytics instead
  ],

  // Setup and migration files (not needed after deployment)
  setupFiles: [
    'DatabaseSetupHelper.tsx',
    'ProfileSetupGuide.tsx',
    'QuickStartGuide.tsx',
    'EmergencyDatabaseSetup.tsx',
    'DatabaseSetupRequired.tsx',
  ],

  // Old/deprecated context files
  deprecatedContexts: [
    'AuthProviderFixed.tsx', // Merged into AuthContext
    'SupabaseAuthContext.tsx', // Not using Supabase auth
  ],

  // Documentation files (should be in separate docs folder)
  docFiles: [
    '*.md',
    '*.sql',
  ],
};

function analyzeProject() {
  const componentsDir = path.join(process.cwd(), 'components');
  const contextsDir = path.join(process.cwd(), 'contexts');
  
  const report = {
    testComponents: [],
    debugComponents: [],
    duplicateComponents: [],
    setupFiles: [],
    deprecatedContexts: [],
    totalSize: 0,
    recommendations: [],
  };

  // Scan components directory
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    
    files.forEach(file => {
      if (!file.endsWith('.tsx')) return;
      
      const filePath = path.join(componentsDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;

      if (CLEANUP_PATTERNS.testComponents.includes(file)) {
        report.testComponents.push({ file, size });
        report.totalSize += size;
      }
      
      if (CLEANUP_PATTERNS.debugComponents.includes(file)) {
        report.debugComponents.push({ file, size });
        report.totalSize += size;
      }
      
      if (CLEANUP_PATTERNS.duplicateComponents.includes(file)) {
        report.duplicateComponents.push({ file, size });
        report.totalSize += size;
      }
      
      if (CLEANUP_PATTERNS.setupFiles.includes(file)) {
        report.setupFiles.push({ file, size });
        report.totalSize += size;
      }
    });
  }

  // Scan contexts directory
  if (fs.existsSync(contextsDir)) {
    const files = fs.readdirSync(contextsDir);
    
    files.forEach(file => {
      if (!file.endsWith('.tsx')) return;
      
      const filePath = path.join(contextsDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;

      if (CLEANUP_PATTERNS.deprecatedContexts.includes(file)) {
        report.deprecatedContexts.push({ file, size });
        report.totalSize += size;
      }
    });
  }

  return report;
}

function generateRecommendations(report) {
  const recommendations = [];

  if (report.testComponents.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Test Components',
      action: 'Remove or gate behind feature flag',
      files: report.testComponents.length,
      savings: formatBytes(report.testComponents.reduce((acc, f) => acc + f.size, 0)),
      details: report.testComponents.map(f => f.file),
    });
  }

  if (report.debugComponents.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Debug Components',
      action: 'Remove or gate behind isDevelopment flag',
      files: report.debugComponents.length,
      savings: formatBytes(report.debugComponents.reduce((acc, f) => acc + f.size, 0)),
      details: report.debugComponents.map(f => f.file),
    });
  }

  if (report.duplicateComponents.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Duplicate Components',
      action: 'Consolidate and remove duplicates',
      files: report.duplicateComponents.length,
      savings: formatBytes(report.duplicateComponents.reduce((acc, f) => acc + f.size, 0)),
      details: report.duplicateComponents.map(f => f.file),
    });
  }

  if (report.setupFiles.length > 0) {
    recommendations.push({
      priority: 'LOW',
      category: 'Setup Files',
      action: 'Remove after initial setup complete',
      files: report.setupFiles.length,
      savings: formatBytes(report.setupFiles.reduce((acc, f) => acc + f.size, 0)),
      details: report.setupFiles.map(f => f.file),
    });
  }

  if (report.deprecatedContexts.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Deprecated Contexts',
      action: 'Remove and update imports',
      files: report.deprecatedContexts.length,
      savings: formatBytes(report.deprecatedContexts.reduce((acc, f) => acc + f.size, 0)),
      details: report.deprecatedContexts.map(f => f.file),
    });
  }

  return recommendations;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function printReport(report, recommendations) {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('         PRODUCTION CLEANUP ANALYSIS');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('📊 Summary:');
  console.log(`   Test Components:       ${report.testComponents.length} files`);
  console.log(`   Debug Components:      ${report.debugComponents.length} files`);
  console.log(`   Duplicate Components:  ${report.duplicateComponents.length} files`);
  console.log(`   Setup Files:           ${report.setupFiles.length} files`);
  console.log(`   Deprecated Contexts:   ${report.deprecatedContexts.length} files`);
  console.log(`   Total Potential Savings: ${formatBytes(report.totalSize)}\n`);

  if (recommendations.length > 0) {
    console.log('🎯 Recommendations:\n');
    
    recommendations.forEach((rec, index) => {
      const priorityColor = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`${index + 1}. ${priorityColor} ${rec.category} [${rec.priority} Priority]`);
      console.log(`   Action: ${rec.action}`);
      console.log(`   Files: ${rec.files} | Savings: ${rec.savings}`);
      console.log(`   Files to review:`);
      rec.details.forEach(file => console.log(`      - ${file}`));
      console.log('');
    });
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('💡 Next Steps:');
  console.log('   1. Review the files listed above');
  console.log('   2. Gate test/debug components behind feature flags');
  console.log('   3. Remove duplicate components');
  console.log('   4. Update imports for consolidated components');
  console.log('   5. Run build to verify everything works');
  console.log('═══════════════════════════════════════════════════\n');
}

// Run analysis
const report = analyzeProject();
const recommendations = generateRecommendations(report);
printReport(report, recommendations);

// Export for programmatic use
module.exports = {
  analyzeProject,
  generateRecommendations,
  CLEANUP_PATTERNS,
};
