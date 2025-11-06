import React, { useState, useEffect } from 'react'
import { Plus, FolderOpen, BarChart3, Users, MessageCircle, Bell, Search, Menu, X, Star, Calendar, UserCircle, Database, Lightbulb, Check, Wifi } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useAuth } from '../contexts/SupabaseAuthContext'
import { supabaseService } from '../utils/supabase/database-service'
import { Project, Task, CommunityPost, Notification } from '../types/database'

interface SupabaseDashboardProps {
  user: any
  profile?: any
  onLogout: () => void
  onNavigateToSetup?: () => void
  databaseConnected?: boolean
}

type DashboardView = 'overview' | 'projects' | 'project-details' | 'analytics' | 'community' | 'messaging' | 'profile'

export default function SupabaseDashboard({ 
  user, 
  profile, 
  onLogout, 
  onNavigateToSetup, 
  databaseConnected 
}: SupabaseDashboardProps) {
  const { updateProfile } = useAuth()
  const [currentView, setCurrentView] = useState<DashboardView>('overview')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Show connection error if there's a critical issue
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="font-semibold text-red-900 mb-2">
              Connection Error
            </div>
            <p className="text-sm text-red-700 mb-4">
              {connectionError}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setConnectionError(null)
                  window.location.reload()
                }}
                className="w-full"
              >
                Retry Connection
              </Button>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="w-full"
              >
                Back to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show connection required message if database not connected
  if (!databaseConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-yellow-200">
          <div className="text-center">
            <Database className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <div className="font-semibold text-yellow-900 mb-2">
              Initializing Connection
            </div>
            <p className="text-sm text-yellow-700 mb-4">
              Setting up your DevTrack Africa workspace...
            </p>
            <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh if this takes too long
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Test connection and load dashboard data
  useEffect(() => {
    let isMounted = true
    
    const initializeDashboard = async () => {
      try {
        // First test the database connection
        console.log('🔍 Testing database connection...')
        const connectionTest = await supabaseService.testConnection()
        
        if (!connectionTest.success) {
          console.error('❌ Database connection failed:', connectionTest.error)
          if (isMounted) {
            setConnectionError(`Database connection failed: ${connectionTest.error}`)
            setLoading(false)
          }
          return
        }
        
        console.log('✅ Database connection verified')
        
        if (!user) {
          console.log('ℹ️ No user available, skipping data load')
          if (isMounted) {
            setLoading(false)
          }
          return
        }
        
        console.log('📊 Loading dashboard data for user:', user.email)
        await loadDashboardData(isMounted)
        
      } catch (error) {
        console.error('❌ Dashboard initialization failed:', error)
        if (isMounted) {
          setConnectionError('Failed to initialize dashboard. Please try refreshing the page.')
          setLoading(false)
        }
      }
    }
    
    initializeDashboard()
    
    return () => {
      isMounted = false
    }
  }, [user])

  const loadDashboardData = async (isMounted = true) => {
    if (!user) return
    
    try {
      console.log('🔄 Starting dashboard data load...')
      setLoading(true)
      
      // Load data with error handling for each section
      const loadPromises = [
        supabaseService.getUserProjects(user.id).catch(err => {
          console.warn('⚠️ Failed to load projects:', err.message)
          return []
        }),
        supabaseService.getUserTasks(user.id).catch(err => {
          console.warn('⚠️ Failed to load tasks:', err.message)
          return []
        }),
        supabaseService.getCommunityPosts(10).catch(err => {
          console.warn('⚠️ Failed to load community posts:', err.message)
          return []
        }),
        supabaseService.getUserNotifications(user.id, 20).catch(err => {
          console.warn('⚠️ Failed to load notifications:', err.message)
          return []
        })
      ]
      
      const [userProjects, userTasks, posts, userNotifications] = await Promise.all(loadPromises)
      
      if (!isMounted) return
      
      setProjects(userProjects)
      setTasks(userTasks)
      setCommunityPosts(posts)
      setNotifications(userNotifications)
      setUnreadNotifications(userNotifications.filter(n => !n.is_read).length)
      
      console.log('✅ Dashboard data loaded:', {
        projects: userProjects.length,
        tasks: userTasks.length,
        posts: posts.length,
        notifications: userNotifications.length
      })

    } catch (error) {
      console.error('❌ Dashboard data load failed:', error)
      if (isMounted) {
        // Set empty arrays instead of leaving undefined
        setProjects([])
        setTasks([])
        setCommunityPosts([])
        setNotifications([])
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  const handleCreateProject = async (projectData: any) => {
    try {
      setIsLoading(true)
      
      const newProject = await supabaseService.createProject({
        title: projectData.title,
        description: projectData.description,
        user_id: user.id,
        status: projectData.status || 'planning',
        priority: projectData.priority || 'medium',
        category: projectData.category || 'Web Development',
        tags: projectData.tags || [],
        tech_stack: projectData.techStack || [],
        github_repo: projectData.githubRepo,
        live_url: projectData.liveUrl,
        is_public: projectData.isPublic || false
      })

      if (newProject) {
        setProjects(prev => [newProject, ...prev])
        setShowProjectForm(false)
        
        // Create notification
        await supabaseService.createNotification({
          user_id: user.id,
          type: 'project_update',
          title: 'Project Created',
          message: `Successfully created project "${newProject.title}"`,
          metadata: { project_id: newProject.id }
        })
        
        loadDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setCurrentView('project-details')
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'My Projects', icon: FolderOpen, badge: projects.length },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messaging', label: 'Messages', icon: MessageCircle }
  ]

  const SidebarContent = () => (
    <div className="space-y-2">
      <div className="p-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-accent rounded-lg p-2 -m-2"
          onClick={() => {
            setCurrentView('profile')
            setIsMobileMenuOpen(false)
          }}
        >
          <Avatar className="h-10 w-10">
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user?.email || 'User')}&background=f0f0f0&color=333`}
              alt={profile?.full_name || user?.email || 'User'}
            />
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-sm text-muted-foreground truncate">{profile?.bio || 'Developer'}</p>
          </div>
        </div>
      </div>

      <Separator />

      <nav className="p-2 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id as DashboardView)
              setIsMobileMenuOpen(false)
            }}
            className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors hover:bg-accent ${
              currentView === item.id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>

      <Separator />

      <div className="p-4 space-y-2">
        <Button
          onClick={() => setShowProjectForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
        
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle>DevTrack Africa</SheetTitle>
                <SheetDescription>Project management for African developers</SheetDescription>
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DT</span>
              </div>
              <span className="font-bold text-lg">DevTrack</span>
            </div>
          </div>

          <div className="flex-1 max-w-sm mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center space-x-1 text-sm">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarContent />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentView === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Developer'}!</h1>
                    <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
                  </div>
                  <Button onClick={() => setShowProjectForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{projects.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {projects.filter(p => p.status === 'active').length} active
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                      <Check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tasks.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {tasks.filter(t => t.status === 'done').length} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{communityPosts.length}</div>
                      <p className="text-xs text-muted-foreground">
                        From the community
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{unreadNotifications}</div>
                      <p className="text-xs text-muted-foreground">
                        Unread notifications
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {projects.slice(0, 3).map((project) => (
                          <div 
                            key={project.id} 
                            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                            onClick={() => handleProjectClick(project)}
                          >
                            <div>
                              <h4 className="font-medium">{project.title}</h4>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                            </div>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </div>
                        ))}
                        {projects.length === 0 && (
                          <div className="text-center py-8">
                            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-medium mb-2">No projects yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">Start by creating your first project</p>
                            <Button onClick={() => setShowProjectForm(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Project
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {notifications.slice(0, 5).map((notification) => (
                          <div key={notification.id} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentView === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">My Projects</h1>
                    <p className="text-muted-foreground">Manage and track your development projects</p>
                  </div>
                  <Button onClick={() => setShowProjectForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {projects
                    .filter(project => 
                      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((project) => (
                    <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                          </div>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {project.tech_stack.slice(0, 3).map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.tech_stack.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tech_stack.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center space-x-2">
                              {project.is_public && <Star className="h-3 w-3" />}
                              <span className="capitalize">{project.priority}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {projects.length === 0 && (
                  <div className="text-center py-12">
                    <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first project to get started with DevTrack Africa</p>
                    <Button onClick={() => setShowProjectForm(true)} size="lg">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentView === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">My Profile</h1>
                  <p className="text-muted-foreground">Manage your profile and account settings</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <img
                          src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user?.email || 'User')}&background=f0f0f0&color=333`}
                          alt={profile?.full_name || user?.email || 'User'}
                        />
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-medium text-lg">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <p className="text-sm text-muted-foreground">{profile?.bio || 'No bio provided'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <p className="text-sm text-muted-foreground">{profile?.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Experience Level</label>
                        <p className="text-sm text-muted-foreground capitalize">{profile?.experience_level || 'beginner'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Website</label>
                        <p className="text-sm text-muted-foreground">{profile?.website || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">GitHub</label>
                        <p className="text-sm text-muted-foreground">{profile?.github_username || 'Not provided'}</p>
                      </div>
                    </div>

                    {profile?.skills && profile.skills.length > 0 && (
                      <div>
                        <label className="text-sm font-medium">Skills</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button>Edit Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other views would go here */}
            {currentView !== 'overview' && currentView !== 'projects' && currentView !== 'profile' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                <p className="text-muted-foreground">This feature is under development</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Project Creation Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project Title</label>
                  <Input placeholder="Enter project title" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Brief description" />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      // This would normally collect form data
                      handleCreateProject({
                        title: 'Sample Project',
                        description: 'A sample project created from the dashboard',
                        status: 'planning',
                        priority: 'medium',
                        isPublic: false
                      })
                    }}
                  >
                    Create Project
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowProjectForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}