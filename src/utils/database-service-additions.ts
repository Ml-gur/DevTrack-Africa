import { getDemoMode, dbHelpers } from './supabase/client'
import { Project } from '../types/project'

// Mock storage utility for fallback
const ProjectStorage = {
  getProjects: (): Project[] => {
    try {
      const stored = localStorage.getItem('devtrack_projects')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
}

// Utility functions
const isDatabaseAvailable = (): boolean => {
  // Simple check - can be enhanced
  return true
}

const withDatabaseCheck = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  timeout: number = 3000
): Promise<T> => {
  try {
    return await Promise.race([
      operation(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), timeout)
      )
    ])
  } catch (error) {
    console.warn('Database operation failed, using fallback:', error)
    return fallback
  }
}

const mapDbProjectToProject = (dbProject: any): Project => {
  return {
    id: dbProject.id,
    userId: dbProject.user_id || dbProject.userId,
    title: dbProject.title,
    description: dbProject.description || '',
    category: dbProject.category || 'other',
    status: dbProject.status || 'planning',
    techStack: dbProject.tech_stack || dbProject.techStack || [],
    startDate: dbProject.start_date || dbProject.startDate || new Date().toISOString(),
    endDate: dbProject.end_date || dbProject.endDate || '',
    githubUrl: dbProject.github_repo || dbProject.githubUrl || '',
    liveUrl: dbProject.live_url || dbProject.liveUrl || '',
    images: dbProject.images || [],
    likes: dbProject.likes || 0,
    comments: dbProject.comments || [],
    isPublic: dbProject.is_public ?? dbProject.isPublic ?? false,
    progress: dbProject.progress || 0,
    createdAt: dbProject.created_at || dbProject.createdAt || new Date().toISOString(),
    updatedAt: dbProject.updated_at || dbProject.updatedAt || new Date().toISOString()
  }
}

// Function to toggle project likes
export async function toggleProjectLike(projectId: string, userId: string): Promise<{ data?: { liked: boolean }; error?: any }> {
  try {
    if (getDemoMode()) {
      // In demo mode, just return success
      return { data: { liked: true } };
    }

    // In a real implementation, this would check if user already liked the project
    // and toggle the like status in the database
    console.log('Would toggle like for project:', projectId, 'by user:', userId);
    return { data: { liked: true } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to toggle like' };
  }
}

// Function to get project like status  
export async function getProjectLikeStatus(projectId: string, userId: string): Promise<{ data?: { liked: boolean }; error?: any }> {
  try {
    if (getDemoMode()) {
      // In demo mode, return random like status
      return { data: { liked: Math.random() > 0.5 } };
    }

    // In a real implementation, this would check the database
    console.log('Would check like status for project:', projectId, 'by user:', userId);
    return { data: { liked: false } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to get like status' };
  }
}

// Function to get all public projects
export async function getAllPublicProjects(): Promise<{ data: Project[] | null; error: any }> {
  const localProjects = ProjectStorage.getProjects().filter(p => p.isPublic);
  
  if (!isDatabaseAvailable()) {
    console.log(`📱 Database not available, using ${localProjects.length} local public projects`);
    return { data: localProjects, error: null };
  }

  return await withDatabaseCheck(
    async () => {
      const result = await dbHelpers.query('projects', async (table) => {
        const { data, error } = await table
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
          
        return { data, error };
      });
      
      if (result.data) {
        const dbProjects = result.data.map(mapDbProjectToProject);
        
        // Get only temporary projects that aren't already in database and are public
        const tempPublicProjects = localProjects.filter(p => 
          p.id.startsWith('temp-') && 
          !dbProjects.some(db => db.title === p.title && db.userId === p.userId)
        );
        
        // Merge projects - database projects first, then temporary
        const allPublicProjects = [...dbProjects, ...tempPublicProjects];
        
        console.log(`✅ Loaded ${dbProjects.length} database public projects and ${tempPublicProjects.length} temporary public projects`);
        return { data: allPublicProjects, error: null };
      }
      
      return { data: localProjects, error: result.error };
    },
    { data: localProjects, error: null },
    3000
  );
}

// Export additional utility functions needed by other modules
// getDemoMode is now available from supabase/client.ts