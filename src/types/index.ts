// Re-export all types for better module resolution
// Note: Project type is exported from database.ts to avoid conflicts
export * from './task';
export * from './social';
export * from './analytics';
export * from './collaboration';
export * from './messaging';
export * from './template';
export * from './projectTemplate';

// Export database types as the source of truth for Supabase
export * from './database';

// Legacy project types for backwards compatibility (renamed to avoid conflicts)
export type { 
  Project as LegacyProject, 
  ProjectStatus, 
  ProjectCategory, 
  Comment as LegacyComment, 
  Activity 
} from './project';