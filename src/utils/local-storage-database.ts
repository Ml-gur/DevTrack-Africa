import { LocalUser, LocalProfile } from '../contexts/LocalOnlyAuthContext'
import { calculateProjectStatus } from './project-status-calculator'
import { storageQuotaManager, checkStorageHealth } from './storage-quota-manager'

// Project and Task types for local storage
export interface LocalProject {
  id: string
  userId: string
  title: string
  description: string
  notes?: string // Project notes/description - editable anytime
  status: 'planning' | 'active' | 'in_progress' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  githubUrl?: string
  liveUrl?: string
  techStack: string[]
  isPublic: boolean
  created_at: string
  updated_at: string
}

export interface LocalTask {
  id: string
  projectId: string
  userId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  timeSpentMinutes?: number // Total time spent on this task in minutes
  timerStartTime?: string // ISO timestamp when timer started
  dependencies: string[]
  assignedTo?: string
  created_at: string
  updated_at: string
}

export interface LocalPost {
  id: string
  userId: string
  projectId?: string
  title: string
  content: string
  imageUrl?: string
  tags: string[]
  likes: string[] // Array of user IDs who liked
  comments: LocalComment[]
  isPublic: boolean
  created_at: string
  updated_at: string
}

export interface LocalComment {
  id: string
  postId: string
  userId: string
  content: string
  created_at: string
}

export interface LocalMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  created_at: string
}

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: 'devtrack_projects',
  TASKS: 'devtrack_tasks', 
  POSTS: 'devtrack_posts',
  MESSAGES: 'devtrack_messages',
  DEMO_INITIALIZED: 'devtrack_demo_initialized'
} as const

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9)
const getCurrentTimestamp = () => new Date().toISOString()

class LocalStorageDatabase {
  // Generic storage helpers
  private getStoredData<T>(key: string): Record<string, T> {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  private setStoredData<T>(key: string, data: Record<string, T>): void {
    try {
      // Check storage health before attempting to store
      const health = checkStorageHealth();
      
      if (health.isCritical) {
        console.warn('Storage is critically full. Running cleanup...');
        storageQuotaManager.autoCleanup();
      }

      const jsonString = JSON.stringify(data);
      
      // Try to store
      try {
        localStorage.setItem(key, jsonString);
      } catch (error: any) {
        if (error?.name === 'QuotaExceededError') {
          console.error(`Storage quota exceeded for ${key}. Running emergency cleanup...`);
          
          // Run emergency cleanup
          storageQuotaManager.emergencyCleanup();
          
          // Try again after cleanup
          try {
            localStorage.setItem(key, jsonString);
            console.log('Successfully stored after emergency cleanup');
          } catch (retryError: any) {
            // If still failing, the data is just too large
            console.error('Data too large even after cleanup');
            throw new Error('Storage quota exceeded. Please archive or delete old projects.');
          }
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error(`Failed to store data for ${key}:`, error);
      throw error;
    }
  }

  // Test connection (always succeeds for local storage)
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test localStorage availability
      const testKey = 'devtrack_test'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      
      return { 
        success: true, 
        message: 'Local storage is available and working' 
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Local storage is not available' 
      }
    }
  }

  // Initialize demo data
  async initializeDemoData(userId: string): Promise<void> {
    const demoKey = `${STORAGE_KEYS.DEMO_INITIALIZED}_${userId}`
    
    if (localStorage.getItem(demoKey)) {
      console.log('Demo data already initialized for user:', userId)
      return
    }

    try {
      console.log('Initializing demo data for user:', userId)
      
      // Create minimal demo project (reduced to prevent storage issues)
      const demoProjects: LocalProject[] = [
        {
          id: generateId(),
          userId,
          title: 'My First Project',
          description: 'Get started with project tracking',
          status: 'active',
          priority: 'high',
          tags: ['Getting Started'],
          techStack: ['React'],
          isPublic: true,
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp()
        }
      ]

      // Store demo projects
      const projects = this.getStoredData<LocalProject>(STORAGE_KEYS.PROJECTS)
      demoProjects.forEach(project => {
        projects[project.id] = project
      })
      this.setStoredData(STORAGE_KEYS.PROJECTS, projects)

      // Create minimal demo tasks (reduced to prevent storage issues)
      const demoTasks: LocalTask[] = [
        {
          id: generateId(),
          projectId: demoProjects[0].id,
          userId,
          title: 'Create first task',
          description: 'Start tracking your work',
          status: 'todo',
          priority: 'medium',
          tags: [],
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp(),
          dependencies: []
        }
      ]

      // Store demo tasks
      const tasks = this.getStoredData<LocalTask>(STORAGE_KEYS.TASKS)
      demoTasks.forEach(task => {
        tasks[task.id] = task
      })
      this.setStoredData(STORAGE_KEYS.TASKS, tasks)

      // Create demo posts
      const demoPosts: LocalPost[] = [
        {
          id: generateId(),
          userId,
          projectId: demoProjects[0].id,
          title: 'Just launched DevTrack Africa! 🚀',
          content: 'Excited to share my latest project - a comprehensive project management platform built specifically for African developers. Features include Kanban boards, project showcases, and community engagement tools.',
          tags: ['Launch', 'Project Management', 'Community'],
          likes: [],
          comments: [],
          isPublic: true,
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp()
        }
      ]

      // Store demo posts
      const posts = this.getStoredData<LocalPost>(STORAGE_KEYS.POSTS)
      demoPosts.forEach(post => {
        posts[post.id] = post
      })
      this.setStoredData(STORAGE_KEYS.POSTS, posts)

      // Mark demo data as initialized
      localStorage.setItem(demoKey, 'true')
      console.log('✅ Demo data initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize demo data:', error)
    }
  }

  // Project methods
  async getProjects(userId: string): Promise<LocalProject[]> {
    const projects = this.getStoredData<LocalProject>(STORAGE_KEYS.PROJECTS)
    return Object.values(projects).filter(project => project.userId === userId)
  }

  async getPublicProjects(): Promise<LocalProject[]> {
    const projects = this.getStoredData<LocalProject>(STORAGE_KEYS.PROJECTS)
    return Object.values(projects).filter(project => project.isPublic)
  }

  async createProject(userId: string, projectData: Omit<LocalProject, 'id' | 'userId' | 'created_at' | 'updated_at'>): Promise<LocalProject> {
    // Check storage health before creating project
    const health = checkStorageHealth();
    
    if (health.isCritical) {
      throw new Error('Storage is full. Please archive or delete old projects before creating new ones.');
    }
    
    if (health.isWarning) {
      console.warn('Storage is running low. Consider cleaning up old projects.');
    }

    const projects = this.getStoredData<LocalProject>(STORAGE_KEYS.PROJECTS)
    
    // Limit data size
    const trimmedProjectData = {
      ...projectData,
      description: projectData.description?.substring(0, 500) || '',
      notes: projectData.notes?.substring(0, 1000) || '',
      tags: projectData.tags?.slice(0, 10) || [],
      techStack: projectData.techStack?.slice(0, 10) || []
    };
    
    const newProject: LocalProject = {
      id: generateId(),
      userId,
      ...trimmedProjectData,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    }
    
    projects[newProject.id] = newProject
    this.setStoredData(STORAGE_KEYS.PROJECTS, projects)
    
    return newProject
  }

  async updateProject(projectId: string, updates: Partial<LocalProject>): Promise<LocalProject | null> {
    const projects = this.getStoredData<LocalProject>(STORAGE_KEYS.PROJECTS)
    const project = projects[projectId]
    
    if (!project) return null
    
    const updatedProject = {
      ...project,
      ...updates,
      updated_at: getCurrentTimestamp()
    }
    
    projects[projectId] = updatedProject
    this.setStoredData(STORAGE_KEYS.PROJECTS, projects)
    
    return updatedProject
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const projects = this.getStoredData<LocalProject>(STORAGE_KEYS.PROJECTS)
    
    if (!projects[projectId]) return false
    
    delete projects[projectId]
    this.setStoredData(STORAGE_KEYS.PROJECTS, projects)
    
    // Also delete associated tasks
    const tasks = this.getStoredData<LocalTask>(STORAGE_KEYS.TASKS)
    Object.keys(tasks).forEach(taskId => {
      if (tasks[taskId].projectId === projectId) {
        delete tasks[taskId]
      }
    })
    this.setStoredData(STORAGE_KEYS.TASKS, tasks)
    
    return true
  }

  // Task methods
  async getTasks(projectId: string): Promise<LocalTask[]> {
    const tasks = this.getStoredData<LocalTask>(STORAGE_KEYS.TASKS)
    return Object.values(tasks).filter(task => task.projectId === projectId)
  }

  async getUserTasks(userId: string): Promise<LocalTask[]> {
    const tasks = this.getStoredData<LocalTask>(STORAGE_KEYS.TASKS)
    return Object.values(tasks).filter(task => task.userId === userId)
  }

  async createTask(taskData: Omit<LocalTask, 'id' | 'created_at' | 'updated_at'>): Promise<LocalTask> {
    // Check storage health before creating task
    const health = checkStorageHealth();
    
    if (health.isCritical) {
      throw new Error('Storage is full. Please clean up old data before creating new tasks.');
    }

    const tasks = this.getStoredData<LocalTask>(STORAGE_KEYS.TASKS)
    
    // Limit data size
    const trimmedTaskData = {
      ...taskData,
      description: taskData.description?.substring(0, 500) || '',
      tags: taskData.tags?.slice(0, 5) || [],
      dependencies: taskData.dependencies?.slice(0, 5) || []
    };
    
    const newTask: LocalTask = {
      id: generateId(),
      ...trimmedTaskData,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    }
    
    tasks[newTask.id] = newTask
    this.setStoredData(STORAGE_KEYS.TASKS, tasks)
    
    // Auto-update project status after task creation
    await this.updateProjectStatusFromTasks(taskData.projectId)
    
    return newTask
  }

  async updateTask(taskId: string, updates: Partial<LocalTask>): Promise<LocalTask | null> {
    const tasks = this.getStoredData<LocalTask>(STORAGE_KEYS.TASKS)
    const task = tasks[taskId]
    
    if (!task) return null
    
    const updatedTask = {
      ...task,
      ...updates,
      updated_at: getCurrentTimestamp()
    }
    
    tasks[taskId] = updatedTask
    this.setStoredData(STORAGE_KEYS.TASKS, tasks)
    
    // Auto-update project status after task update
    await this.updateProjectStatusFromTasks(updatedTask.projectId)
    
    return updatedTask
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const tasks = this.getStoredData<LocalTask>(STORAGE_KEYS.TASKS)
    
    if (!tasks[taskId]) return false
    
    const projectId = tasks[taskId].projectId
    delete tasks[taskId]
    this.setStoredData(STORAGE_KEYS.TASKS, tasks)
    
    // Auto-update project status after task deletion
    await this.updateProjectStatusFromTasks(projectId)
    
    return true
  }

  // Helper method to update project status based on tasks
  private async updateProjectStatusFromTasks(projectId: string): Promise<void> {
    try {
      const projects = this.getStoredData<LocalProject>(STORAGE_KEYS.PROJECTS)
      const project = projects[projectId]
      
      if (!project) return
      
      // Get all tasks for this project
      const projectTasks = await this.getTasks(projectId)
      
      // Calculate the new status
      const newStatus = await calculateProjectStatus(projectId, projectTasks, project.status)
      
      // Only update if status has changed
      if (newStatus !== project.status) {
        project.status = newStatus
        project.updated_at = getCurrentTimestamp()
        projects[projectId] = project
        this.setStoredData(STORAGE_KEYS.PROJECTS, projects)
      }
    } catch (error) {
      console.error('Failed to auto-update project status:', error)
      // Don't throw - status update is non-critical
    }
  }

  // Post methods for community features
  async getPosts(): Promise<LocalPost[]> {
    const posts = this.getStoredData<LocalPost>(STORAGE_KEYS.POSTS)
    return Object.values(posts)
      .filter(post => post.isPublic)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async getUserPosts(userId: string): Promise<LocalPost[]> {
    const posts = this.getStoredData<LocalPost>(STORAGE_KEYS.POSTS)
    return Object.values(posts).filter(post => post.userId === userId)
  }

  async createPost(postData: Omit<LocalPost, 'id' | 'created_at' | 'updated_at' | 'likes' | 'comments'>): Promise<LocalPost> {
    const posts = this.getStoredData<LocalPost>(STORAGE_KEYS.POSTS)
    
    const newPost: LocalPost = {
      id: generateId(),
      ...postData,
      likes: [],
      comments: [],
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    }
    
    posts[newPost.id] = newPost
    this.setStoredData(STORAGE_KEYS.POSTS, posts)
    
    return newPost
  }

  async deletePost(postId: string): Promise<boolean> {
    const posts = this.getStoredData<LocalPost>(STORAGE_KEYS.POSTS)
    
    if (!posts[postId]) return false
    
    delete posts[postId]
    this.setStoredData(STORAGE_KEYS.POSTS, posts)
    
    return true
  }

  // Analytics methods
  async getProjectStats(userId: string): Promise<{
    totalProjects: number
    activeProjects: number
    completedProjects: number
    totalTasks: number
    completedTasks: number
  }> {
    const projects = await this.getProjects(userId)
    const tasks = await this.getUserTasks(userId)
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length
    }
  }
}

// Export singleton instance
export const localDatabase = new LocalStorageDatabase()