import React, { useState, useEffect } from 'react'
import { LocalUser, LocalProfile, useAuth } from '../contexts/LocalOnlyAuthContext'
import { localDatabase, LocalProject, LocalTask, LocalPost } from '../utils/local-storage-database'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { toast } from 'sonner@2.0.3'
import SettingsPanel from './SettingsPanel'
import CommandPalette from './CommandPalette'
import OnboardingTour from './OnboardingTour'
import PerformanceDashboard from './PerformanceDashboard'
import ProductivityTips from './ProductivityTips'
import {
  FolderOpen,
  Plus,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Edit,
  Trash2,
  ExternalLink,
  Github,
  Globe,
  Calendar,
  Tag,
  BarChart3,
  Activity,
  Brain,
  Rocket,
  Star,
  Heart,
  MessageCircle,
  Command,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'

interface LocalDashboardProps {
  user: LocalUser
  profile: LocalProfile | null
  onLogout: () => Promise<void>
}

interface NewProjectForm {
  title: string
  description: string
  status: 'planning' | 'active' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  githubUrl: string
  liveUrl: string
  techStack: string[]
  isPublic: boolean
}

interface NewTaskForm {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  projectId: string
}

interface NewPostForm {
  title: string
  content: string
  tags: string[]
  projectId?: string
  imageUrl?: string
  isPublic: boolean
}

export default function LocalDashboard({ user, profile, onLogout }: LocalDashboardProps) {
  const { signOut } = useAuth()
  const [projects, setProjects] = useState<LocalProject[]>([])
  const [tasks, setTasks] = useState<LocalTask[]>([])
  const [posts, setPosts] = useState<LocalPost[]>([])
  const [publicPosts, setPublicPosts] = useState<LocalPost[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  })
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedProject, setSelectedProject] = useState<LocalProject | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [currentTab, setCurrentTab] = useState<string>('projects')

  // Form states
  const [newProject, setNewProject] = useState<NewProjectForm>({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    tags: [],
    githubUrl: '',
    liveUrl: '',
    techStack: [],
    isPublic: true
  })

  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    projectId: ''
  })

  const [newPost, setNewPost] = useState<NewPostForm>({
    title: '',
    content: '',
    tags: [],
    projectId: 'none',
    imageUrl: '',
    isPublic: true
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [user.id])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('📊 Loading dashboard data...')

      // Load user's projects
      const userProjects = await localDatabase.getProjects(user.id)
      setProjects(userProjects)

      // Load user's tasks
      const userTasks = await localDatabase.getUserTasks(user.id)
      setTasks(userTasks)

      // Load user's posts
      const userPosts = await localDatabase.getUserPosts(user.id)
      setPosts(userPosts)

      // Load public posts for community feed
      const allPublicPosts = await localDatabase.getPosts()
      setPublicPosts(allPublicPosts)

      // Load stats
      const projectStats = await localDatabase.getProjectStats(user.id)
      setStats(projectStats)

      console.log('✅ Dashboard data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      await onLogout()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleCreateProject = async () => {
    try {
      if (!newProject.title.trim()) {
        toast.error('Project title is required')
        return
      }

      const project = await localDatabase.createProject(user.id, {
        ...newProject,
        tags: newProject.tags.filter(tag => tag.trim()),
        techStack: newProject.techStack.filter(tech => tech.trim())
      })

      setProjects(prev => [...prev, project])
      setNewProject({
        title: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        tags: [],
        githubUrl: '',
        liveUrl: '',
        techStack: [],
        isPublic: true
      })
      setShowNewProject(false)
      toast.success('Project created successfully!')
      
      // Refresh stats
      const newStats = await localDatabase.getProjectStats(user.id)
      setStats(newStats)
    } catch (error) {
      console.error('❌ Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  const handleCreateTask = async () => {
    try {
      if (!newTask.title.trim()) {
        toast.error('Task title is required')
        return
      }

      if (!newTask.projectId) {
        toast.error('Please select a project for this task')
        return
      }

      const task = await localDatabase.createTask({
        ...newTask,
        userId: user.id,
        status: 'todo',
        dependencies: []
      })

      setTasks(prev => [...prev, task])
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        tags: [],
        projectId: ''
      })
      setShowNewTask(false)
      toast.success('Task created successfully!')
      
      // Refresh stats
      const newStats = await localDatabase.getProjectStats(user.id)
      setStats(newStats)
    } catch (error) {
      console.error('❌ Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleCreatePost = async () => {
    try {
      if (!newPost.title.trim() || !newPost.content.trim()) {
        toast.error('Post title and content are required')
        return
      }

      const post = await localDatabase.createPost({
        ...newPost,
        userId: user.id,
        projectId: newPost.projectId === 'none' ? undefined : newPost.projectId,
        tags: newPost.tags.filter(tag => tag.trim())
      })

      setPosts(prev => [...prev, post])
      
      // If post is public, add to public posts
      if (post.isPublic) {
        setPublicPosts(prev => [post, ...prev])
      }

      setNewPost({
        title: '',
        content: '',
        tags: [],
        projectId: 'none',
        imageUrl: '',
        isPublic: true
      })
      setShowNewPost(false)
      toast.success('Post created successfully!')
    } catch (error: any) {
      console.error('❌ Error creating post:', error)
      
      // Check if it's a quota exceeded error
      if (error?.name === 'QuotaExceededError' || error?.message?.includes('quota')) {
        toast.error('Storage full! Please remove the image or delete old posts to free up space.')
      } else {
        toast.error('Failed to create post')
      }
    }
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Calculate new dimensions (max 1200px width, maintain aspect ratio)
          const maxWidth = 1200
          const maxHeight = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to base64 with compression (0.7 quality for JPEG)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
          resolve(compressedBase64)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const checkStorageQuota = (): { available: boolean; usedPercentage: number } => {
    try {
      const totalSize = new Blob(Object.values(localStorage)).size
      const maxSize = 5 * 1024 * 1024 // 5MB typical limit
      const usedPercentage = (totalSize / maxSize) * 100
      return {
        available: usedPercentage < 90, // Warning at 90%
        usedPercentage
      }
    } catch {
      return { available: true, usedPercentage: 0 }
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 10MB')
      return
    }

    // Check storage quota
    const { available, usedPercentage } = checkStorageQuota()
    if (!available) {
      toast.error(`Storage is ${usedPercentage.toFixed(0)}% full. Please delete old posts or export your data.`)
      return
    }

    try {
      setUploadingImage(true)
      
      // Compress image
      const compressedBase64 = await compressImage(file)
      
      // Check if compressed image is still too large (max ~500KB in base64)
      const sizeInBytes = (compressedBase64.length * 3) / 4
      const sizeInKB = sizeInBytes / 1024
      
      if (sizeInKB > 500) {
        toast.error('Image is still too large after compression. Try a smaller image.')
        setUploadingImage(false)
        return
      }
      
      setNewPost(prev => ({ ...prev, imageUrl: compressedBase64 }))
      toast.success(`Image uploaded and compressed to ${sizeInKB.toFixed(0)}KB!`)
      setUploadingImage(false)
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      toast.error('Failed to upload and compress image')
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setNewPost(prev => ({ ...prev, imageUrl: '' }))
    toast.success('Image removed')
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      await localDatabase.deletePost(postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
      setPublicPosts(prev => prev.filter(p => p.id !== postId))
      toast.success('Post deleted successfully!')
    } catch (error) {
      console.error('❌ Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: LocalTask['status']) => {
    try {
      const updatedTask = await localDatabase.updateTask(taskId, { status })
      if (updatedTask) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? updatedTask : task
        ))
        toast.success('Task status updated!')
        
        // Refresh stats
        const newStats = await localDatabase.getProjectStats(user.id)
        setStats(newStats)
      }
    } catch (error) {
      console.error('❌ Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const addTag = (tags: string[], setTags: (tags: string[]) => void, newTag: string) => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
    }
  }

  const removeTag = (tags: string[], setTags: (tags: string[]) => void, tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Task status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">DevTrack Africa</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Local Storage
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Welcome, {profile?.fullName || user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCommandPalette(true)}
                className="hidden md:flex"
              >
                <Command className="w-4 h-4 mr-2" />
                ⌘K
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <div className="text-xs text-muted-foreground">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% complete
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Projects</h2>
              <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Start a new project to track your development journey.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        value={newProject.title}
                        onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter project title..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your project..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={newProject.status} onValueChange={(value: any) => setNewProject(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newProject.priority} onValueChange={(value: any) => setNewProject(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPublic"
                        checked={newProject.isPublic}
                        onCheckedChange={(checked) => setNewProject(prev => ({ ...prev, isPublic: checked as boolean }))}
                      />
                      <Label htmlFor="isPublic">Make this project public in the community showcase</Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleCreateProject} className="flex-1">
                        Create Project
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewProject(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        {project.isPublic && (
                          <Badge variant="outline">
                            <Globe className="w-3 h-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>

                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                        <div className="flex space-x-2">
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4 hover:text-gray-900" />
                            </a>
                          )}
                          {project.liveUrl && (
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 hover:text-gray-900" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {projects.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Create your first project to start tracking your development journey.</p>
                  <Button onClick={() => setShowNewProject(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Tasks</h2>
              <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
                <DialogTrigger asChild>
                  <Button disabled={projects.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task to one of your projects.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="taskTitle">Task Title</Label>
                      <Input
                        id="taskTitle"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter task title..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="taskDescription">Description</Label>
                      <Textarea
                        id="taskDescription"
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the task..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="taskProject">Project</Label>
                        <Select value={newTask.projectId} onValueChange={(value) => setNewTask(prev => ({ ...prev, projectId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="taskPriority">Priority</Label>
                        <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleCreateTask} className="flex-1">
                        Create Task
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewTask(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Todo Tasks */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  To Do ({tasks.filter(t => t.status === 'todo').length})
                </h3>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'todo').map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)} size="sm">
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {projects.find(p => p.id === task.projectId)?.title}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                            className="text-xs"
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* In Progress Tasks */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  In Progress ({tasks.filter(t => t.status === 'in-progress').length})
                </h3>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'in-progress').map((task) => (
                    <Card key={task.id} className="p-4 border-blue-200">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)} size="sm">
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {projects.find(p => p.id === task.projectId)?.title}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                            className="text-xs"
                          >
                            Complete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Completed Tasks */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed ({tasks.filter(t => t.status === 'completed').length})
                </h3>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === 'completed').map((task) => (
                    <Card key={task.id} className="p-4 bg-green-50 border-green-200">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm text-green-800">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)} size="sm">
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-green-700 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-green-600">
                            {projects.find(p => p.id === task.projectId)?.title}
                          </span>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {tasks.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600 mb-4">
                  {projects.length === 0 
                    ? "Create a project first, then add tasks to track your progress."
                    : "Add your first task to start organizing your work."
                  }
                </p>
                {projects.length > 0 && (
                  <Button onClick={() => setShowNewTask(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Task
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Community Feed</h2>
              <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
                <DialogTrigger asChild>
                  <Button className="relative">
                    <Plus className="w-4 h-4 mr-2" />
                    Share Update
                    <ImageIcon className="w-3 h-3 ml-2 opacity-60" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Share Your Progress</DialogTitle>
                    <DialogDescription>
                      Share an update about your projects with the community. You can add images, link to projects, and tag your posts.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="postTitle">Title</Label>
                      <Input
                        id="postTitle"
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What's your update about?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="postContent">Content</Label>
                      <Textarea
                        id="postContent"
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your progress, learnings, or achievements..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Image (Optional)</Label>
                      {!newPost.imageUrl ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="imageUpload"
                            disabled={uploadingImage}
                          />
                          <label 
                            htmlFor="imageUpload" 
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            {uploadingImage ? (
                              <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="text-sm text-gray-600">Compressing and uploading...</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Click to upload an image
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Images are automatically compressed for storage
                                  </p>
                                </div>
                              </>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={newPost.imageUrl} 
                            alt="Upload preview" 
                            className="w-full h-48 object-cover"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="postProject">Related Project (Optional)</Label>
                      <Select value={newPost.projectId} onValueChange={(value) => setNewPost(prev => ({ ...prev, projectId: value === 'none' ? '' : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="postPublic"
                        checked={newPost.isPublic}
                        onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, isPublic: checked as boolean }))}
                      />
                      <Label htmlFor="postPublic">Share publicly in community feed</Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleCreatePost} className="flex-1">
                        Share Update
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewPost(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Community Posts */}
              <div className="lg:col-span-2 space-y-6">
                {publicPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            {post.imageUrl && (
                              <ImageIcon className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <CardDescription>
                            By {post.userId === user.id ? 'You' : 'Developer'} • {new Date(post.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.projectId && (
                            <Badge variant="outline">
                              {projects.find(p => p.id === post.projectId)?.title || 'Project'}
                            </Badge>
                          )}
                          {post.userId === user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{post.content}</p>
                      
                      {post.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300"
                            onClick={() => window.open(post.imageUrl, '_blank')}
                          />
                        </div>
                      )}
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <button className="flex items-center space-x-1 hover:text-red-600">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes.length}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments.length}</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {publicPosts.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No community posts yet</h3>
                    <p className="text-gray-600 mb-2">Be the first to share your development journey!</p>
                    <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Share updates with images, projects, and more
                    </p>
                    <Button onClick={() => setShowNewPost(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Share Your First Update
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Posts Shared</span>
                        <span className="font-semibold">{posts.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Projects Created</span>
                        <span className="font-semibold">{projects.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tasks Completed</span>
                        <span className="font-semibold">{stats.completedTasks}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'API'].map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Completion</span>
                        <span>{stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%</span>
                      </div>
                      <Progress value={stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Task Completion</span>
                        <span>{stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</span>
                      </div>
                      <Progress value={stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Active Projects</span>
                      </div>
                      <span className="font-semibold">{stats.activeProjects}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Tasks in Progress</span>
                      </div>
                      <span className="font-semibold">{tasks.filter(t => t.status === 'in-progress').length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">Community Posts</span>
                      </div>
                      <span className="font-semibold">{posts.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent projects */}
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{project.title}</p>
                        <p className="text-xs text-gray-600">Created {new Date(project.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getStatusColor(project.status)} size="sm">
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <p>No activity data yet. Start creating projects to see analytics!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <h2 className="text-xl font-semibold">Performance Metrics</h2>
            <PerformanceDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        open={showSettings} 
        onOpenChange={setShowSettings}
        isDarkMode={false}
        onThemeToggle={() => toast.info('Dark mode coming soon!')}
      />

      {/* Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onCreateProject={() => {
          setShowNewProject(true)
        }}
        onCreateTask={() => {
          setShowNewTask(true)
        }}
        onOpenSettings={() => {
          setShowSettings(true)
        }}
        onExportData={() => {
          setShowSettings(true)
          toast.info('Open Settings → Data tab to export your data')
        }}
        onLogout={handleLogout}
        onNavigate={(tab) => {
          setCurrentTab(tab)
        }}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        onComplete={() => {
          toast.success('Welcome to DevTrack Africa! 🚀')
        }}
        onSkip={() => {
          console.log('Tour skipped')
        }}
      />

      {/* Productivity Tips */}
      <ProductivityTips />
    </div>
  )
}