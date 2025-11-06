import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Github, 
  Globe, 
  Eye,
  TrendingUp,
  Calendar,
  Users,
  Code2,
  Star,
  ArrowRight
} from 'lucide-react';
import { Project, ProjectCategory, ProjectStatus } from '../types/project';
import { getAllPublicProjects, toggleProjectLike, getProjectLikeStatus } from '../utils/database-service';
import { getDemoMode } from '../utils/supabase/client';

interface ProjectShowcaseProps {
  currentUserId?: string;
  userProjects?: Project[];
  onProjectClick?: (project: Project) => void;
  onViewProfile?: (userId: string) => void;
  onRefresh?: () => void;
  featured?: boolean;
}

interface DeveloperProfile {
  id: string;
  fullName: string;
  title: string;
  profilePicture?: string;
  projectCount: number;
  totalLikes: number;
  isFollowing?: boolean;
}

// Mock featured developers with static images
const mockFeaturedDevelopers: DeveloperProfile[] = [
  {
    id: 'dev1',
    fullName: 'Amara Okafor',
    title: 'Full Stack Developer',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    projectCount: 8,
    totalLikes: 234,
    isFollowing: false
  },
  {
    id: 'dev2',
    fullName: 'Kwame Asante',
    title: 'Mobile Developer', 
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    projectCount: 5,
    totalLikes: 187,
    isFollowing: true
  },
  {
    id: 'dev3',
    fullName: 'Fatima Adebayo',
    title: 'AI/ML Engineer',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    projectCount: 12,
    totalLikes: 456,
    isFollowing: false
  }
];

export default function ProjectShowcase({ 
  currentUserId, 
  userProjects,
  onProjectClick, 
  onViewProfile,
  onRefresh,
  featured = false 
}: ProjectShowcaseProps) {
  // Ensure userProjects is always an array
  const safeUserProjects = Array.isArray(userProjects) ? userProjects : [];
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [featuredDevelopers, setFeaturedDevelopers] = useState<DeveloperProfile[]>(mockFeaturedDevelopers);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());

  // Mock projects moved outside of function for better performance
  const createMockProjects = useCallback((): Project[] => [
    {
      id: 'showcase1',
      userId: 'dev1',
      title: 'African E-Commerce Platform',
      description: 'A comprehensive e-commerce solution tailored for African markets with mobile money integration and multilingual support.',
      category: 'web-app',
      status: 'completed',
      techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      startDate: '2024-01-01',
      endDate: '2024-03-15',
      githubUrl: 'https://github.com/example/ecommerce',
      liveUrl: 'https://african-commerce.example.com',
      images: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop'
      ],
      likes: 45,
      comments: [],
      isPublic: true,
      progress: 100,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z'
    },
    {
      id: 'showcase2',
      userId: 'dev2',
      title: 'Agricultural IoT Management',
      description: 'Smart farming solution using IoT sensors to monitor crop conditions and optimize irrigation systems for small-scale farmers.',
      category: 'ai-ml',
      status: 'in-progress',
      techStack: ['Python', 'TensorFlow', 'React Native', 'PostgreSQL'],
      startDate: '2024-02-01',
      githubUrl: 'https://github.com/example/smart-farm',
      images: [
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop'
      ],
      likes: 32,
      comments: [],
      isPublic: true,
      progress: 75,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-03-10T00:00:00Z'
    },
    {
      id: 'showcase3',
      userId: 'dev3',
      title: 'Decentralized Education Platform',
      description: 'Blockchain-based platform for verifying educational credentials and enabling peer-to-peer learning across Africa.',
      category: 'blockchain',
      status: 'in-progress',
      techStack: ['Solidity', 'Web3.js', 'React', 'IPFS'],
      startDate: '2024-01-15',
      githubUrl: 'https://github.com/example/edu-chain',
      images: [
        'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400&fit=crop'
      ],
      likes: 67,
      comments: [],
      isPublic: true,
      progress: 60,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-03-08T00:00:00Z'
    },
    {
      id: 'showcase4',
      userId: 'dev1',
      title: 'Fintech Payment Gateway',
      description: 'Secure payment processing system for African businesses with support for multiple currencies and payment methods.',
      category: 'web-app',
      status: 'completed',
      techStack: ['Node.js', 'Express', 'PostgreSQL', 'Stripe'],
      startDate: '2023-11-01',
      endDate: '2024-02-20',
      githubUrl: 'https://github.com/example/fintech-gateway',
      liveUrl: 'https://pay.africa-fintech.com',
      images: [
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop'
      ],
      likes: 89,
      comments: [],
      isPublic: true,
      progress: 100,
      createdAt: '2023-11-01T00:00:00Z',
      updatedAt: '2024-02-20T00:00:00Z'
    },
    {
      id: 'showcase5',
      userId: 'dev2',
      title: 'Healthcare Management System',
      description: 'Digital health platform connecting patients with healthcare providers across rural and urban areas in Africa.',
      category: 'mobile-app',
      status: 'in-progress',
      techStack: ['React Native', 'Firebase', 'Node.js', 'MongoDB'],
      startDate: '2024-01-20',
      githubUrl: 'https://github.com/example/health-connect',
      images: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop'
      ],
      likes: 53,
      comments: [],
      isPublic: true,
      progress: 40,
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-03-12T00:00:00Z'
    },
    {
      id: 'showcase6',
      userId: 'dev3',
      title: 'Renewable Energy Tracker',
      description: 'IoT and data analytics platform for monitoring and optimizing solar energy systems across African communities.',
      category: 'ai-ml',
      status: 'planning',
      techStack: ['Python', 'Django', 'React', 'PostgreSQL', 'TensorFlow'],
      startDate: '2024-04-01',
      githubUrl: 'https://github.com/example/solar-tracker',
      images: [
        'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=400&fit=crop'
      ],
      likes: 28,
      comments: [],
      isPublic: true,
      progress: 15,
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z'
    }
  ], []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      
      // Organize projects logically: User's projects first, then community projects
      const publicUserProjects = safeUserProjects.filter(p => p.isPublic);
      
      // In demo mode, use mock data for community showcase
      if (getDemoMode()) {
        console.log('🎭 Demo mode - showcasing user projects + community examples');
        const mockCommunityProjects = createMockProjects();
        // Show user's projects first, then community examples
        const organizedProjects = [...publicUserProjects, ...mockCommunityProjects];
        setProjects(organizedProjects);
      } else {
        // Try to load community projects from database
        try {
          const result = await getAllPublicProjects();
          
          if (result.error) {
            console.log('Database not available, using user projects + mock community projects');
            const mockCommunityProjects = createMockProjects();
            const organizedProjects = [...publicUserProjects, ...mockCommunityProjects];
            setProjects(organizedProjects);
          } else {
            // Combine user's projects with community projects from database
            const dbCommunityProjects = (result.data || []).filter(p => 
              !publicUserProjects.some(userP => userP.id === p.id)
            );
            
            // Organize: User projects first, then community projects
            const organizedProjects = [...publicUserProjects, ...dbCommunityProjects];
            
            // If no community projects, add some mock examples for showcase
            if (dbCommunityProjects.length === 0) {
              const mockCommunityProjects = createMockProjects();
              organizedProjects.push(...mockCommunityProjects);
            }
            
            setProjects(organizedProjects);
            
            console.log(`✅ Showcase organized: ${publicUserProjects.length} user projects, ${dbCommunityProjects.length} community projects`);
          }
        } catch (error) {
          console.log('Error loading community projects, using user projects + mock examples:', error);
          const mockCommunityProjects = createMockProjects();
          const organizedProjects = [...publicUserProjects, ...mockCommunityProjects];
          setProjects(organizedProjects);
        }
      }
    } catch (error) {
      console.error('Error in loadProjects:', error);
      // Fallback: at least show user's projects and some examples
      const mockCommunityProjects = createMockProjects();
      const publicUserProjects = safeUserProjects.filter(p => p.isPublic);
      const fallbackProjects = [...publicUserProjects, ...mockCommunityProjects];
      setProjects(fallbackProjects);
    } finally {
      setLoading(false);
    }
  }, [safeUserProjects, createMockProjects]);

  const loadLikedProjects = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const liked = new Set<string>();
      // In real app, we'd load all liked projects for the user
      setLikedProjects(liked);
    } catch (error) {
      console.error('Error loading liked projects:', error);
      setLikedProjects(new Set());
    }
  }, [currentUserId]);

  const filterAndSortProjects = useCallback(() => {
    try {
      let filtered = projects.filter(project => {
        if (!project || typeof project !== 'object') return false;
        
        const title = project.title || '';
        const description = project.description || '';
        // Ensure techStack is always an array - this prevents length errors
        const techStack = Array.isArray(project.techStack) ? project.techStack : [];
        
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (techStack.length > 0 && techStack.some(tech => typeof tech === 'string' && tech.toLowerCase().includes(searchQuery.toLowerCase())));
        
        const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
      });

      // Organize projects: User projects first, then community projects
      const userProjects = filtered.filter(p => safeUserProjects.some(up => up.id === p.id));
      const communityProjects = filtered.filter(p => !safeUserProjects.some(up => up.id === p.id));

      // Sort each section independently
      const sortProjects = (projectList: Project[]) => {
        return projectList.sort((a, b) => {
          if (!a || !b) return 0;
          
          switch (sortBy) {
            case 'popular':
              return (b.likes || 0) - (a.likes || 0);
            case 'trending':
              // Simple trending algorithm: likes + recent activity weight
              const aTrending = (a.likes || 0) + (new Date(a.updatedAt || Date.now()).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 ? 10 : 0);
              const bTrending = (b.likes || 0) + (new Date(b.updatedAt || Date.now()).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 ? 10 : 0);
              return bTrending - aTrending;
            case 'newest':
            default:
              return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
          }
        });
      };

      // Combine sorted sections: user projects first, then community projects
      const sortedUserProjects = sortProjects([...userProjects]);
      const sortedCommunityProjects = sortProjects([...communityProjects]);
      const organizedProjects = [...sortedUserProjects, ...sortedCommunityProjects];

      setFilteredProjects(organizedProjects);
    } catch (error) {
      console.error('Error filtering projects:', error);
      setFilteredProjects([]);
    }
  }, [projects, searchQuery, categoryFilter, sortBy, safeUserProjects]);

  // Effects - now that functions are defined above
  useEffect(() => {
    loadProjects();
    if (currentUserId) {
      loadLikedProjects();
    }
  }, [loadProjects, loadLikedProjects, currentUserId]);

  useEffect(() => {
    filterAndSortProjects();
  }, [filterAndSortProjects]);

  const handleLike = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!currentUserId) {
      alert('Please sign in to like projects');
      return;
    }

    try {
      // In demo mode, just update local state
      if (getDemoMode()) {
        console.log('🎭 Demo mode - updating like status locally');
        
        const newLikedProjects = new Set(likedProjects);
        const isLiked = !likedProjects.has(projectId);
        
        if (isLiked) {
          newLikedProjects.add(projectId);
        } else {
          newLikedProjects.delete(projectId);
        }
        
        setLikedProjects(newLikedProjects);
        
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { ...project, likes: isLiked ? project.likes + 1 : project.likes - 1 }
            : project
        ));
        return;
      }

      const result = await toggleProjectLike(projectId, currentUserId);
      
      if (result.error) {
        console.log('Error toggling like (using local state):', result.error);
        // Fallback to local state update
        const newLikedProjects = new Set(likedProjects);
        const isLiked = !likedProjects.has(projectId);
        
        if (isLiked) {
          newLikedProjects.add(projectId);
        } else {
          newLikedProjects.delete(projectId);
        }
        
        setLikedProjects(newLikedProjects);
        
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { ...project, likes: isLiked ? project.likes + 1 : project.likes - 1 }
            : project
        ));
        return;
      }

      // Update from database response
      const newLikedProjects = new Set(likedProjects);
      const isLiked = result.data?.liked;
      
      if (isLiked) {
        newLikedProjects.add(projectId);
      } else {
        newLikedProjects.delete(projectId);
      }
      
      setLikedProjects(newLikedProjects);
      
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, likes: isLiked ? project.likes + 1 : project.likes - 1 }
          : project
      ));
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const handleFollowDeveloper = (developerId: string) => {
    setFeaturedDevelopers(prev => prev.map(dev => 
      dev.id === developerId 
        ? { ...dev, isFollowing: !dev.isFollowing }
        : dev
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {featured ? 'Featured Projects' : 'Project Showcase'}
          </h2>
          <p className="text-muted-foreground">
            Discover amazing projects from developers across Africa
          </p>
        </div>
        
        <div className="flex gap-2">
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button onClick={loadProjects} variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Reload Showcase
          </Button>
        </div>
      </div>

      {/* Featured Developers Section */}
      {featured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Featured Developers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredDevelopers.map(developer => (
                <div key={developer.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={developer.profilePicture} />
                    <AvatarFallback>
                      {developer.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{developer.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{developer.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{developer.projectCount} projects</span>
                      <span>{developer.totalLikes} likes</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={developer.isFollowing ? "secondary" : "outline"}
                    onClick={() => handleFollowDeveloper(developer.id)}
                  >
                    {developer.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ProjectCategory | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="web-app">Web Apps</SelectItem>
              <SelectItem value="mobile-app">Mobile Apps</SelectItem>
              <SelectItem value="api">APIs</SelectItem>
              <SelectItem value="ai-ml">AI/ML</SelectItem>
              <SelectItem value="blockchain">Blockchain</SelectItem>
              <SelectItem value="game">Games</SelectItem>
              <SelectItem value="library">Libraries</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Liked</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Sections */}
      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Code2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No public projects available yet'
              }
            </p>
            {safeUserProjects.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  💡 You have {safeUserProjects.length} project{safeUserProjects.length !== 1 ? 's' : ''}, but {safeUserProjects.filter(p => p.isPublic).length} of them {safeUserProjects.filter(p => p.isPublic).length === 1 ? 'is' : 'are'} set to public.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={loadProjects} variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Reload Showcase
                  </Button>
                  {onRefresh && (
                    <Button onClick={onRefresh} variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Refresh Projects
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* User Projects Section */}
          {(() => {
            const userProjectsInFiltered = filteredProjects.filter(p => 
              safeUserProjects.some(up => up.id === p.id)
            );
            
            return userProjectsInFiltered.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-semibold">Your Public Projects</h3>
                  <Badge variant="secondary">{userProjectsInFiltered.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjectsInFiltered.map(project => (
                    <ProjectCard 
                      key={project.id}
                      project={project}
                      onProjectClick={onProjectClick}
                      onLike={handleLike}
                      isLiked={likedProjects.has(project.id)}
                      currentUserId={currentUserId}
                      isOwner={true}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Community Projects Section */}
          {(() => {
            const communityProjectsInFiltered = filteredProjects.filter(p => 
              !safeUserProjects.some(up => up.id === p.id)
            );
            
            return communityProjectsInFiltered.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Community Showcase</h3>
                  <Badge variant="outline">{communityProjectsInFiltered.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityProjectsInFiltered.map(project => (
                    <ProjectCard 
                      key={project.id}
                      project={project}
                      onProjectClick={onProjectClick}
                      onLike={handleLike}
                      isLiked={likedProjects.has(project.id)}
                      currentUserId={currentUserId}
                      isOwner={false}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Load More */}
      {filteredProjects.length > 0 && (
        <div className="text-center">
          <Button variant="outline" disabled={loading}>
            Load More Projects
          </Button>
        </div>
      )}
    </div>
  );
}

// Project Card Component for better organization
interface ProjectCardProps {
  project: Project;
  onProjectClick?: (project: Project) => void;
  onLike: (projectId: string, event: React.MouseEvent) => void;
  isLiked: boolean;
  currentUserId?: string;
  isOwner: boolean;
}

function ProjectCard({ 
  project, 
  onProjectClick, 
  onLike, 
  isLiked, 
  currentUserId,
  isOwner 
}: ProjectCardProps) {
  // Ensure all array properties are safe to prevent length errors
  const safeProject = {
    ...project,
    techStack: Array.isArray(project.techStack) ? project.techStack : [],
    images: Array.isArray(project.images) ? project.images : [],
    comments: Array.isArray(project.comments) ? project.comments : [],
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return '1 day ago';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'planning': return 'outline';
      default: return 'outline';
    }
  };

  const handleCardClick = () => {
    if (onProjectClick) {
      onProjectClick(safeProject);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(safeProject.id, e);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        {safeProject.images.length > 0 ? (
          <ImageWithFallback
            src={safeProject.images[0]}
            alt={safeProject.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Code2 className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={getStatusBadgeVariant(safeProject.status)} className="capitalize">
            {safeProject.status.replace('-', ' ')}
          </Badge>
        </div>

        {/* Owner Badge */}
        {isOwner && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Your Project
            </Badge>
          </div>
        )}

        {/* Progress Bar for in-progress projects */}
        {safeProject.status === 'in-progress' && typeof safeProject.progress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, safeProject.progress))}%` }}
            />
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Project Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {safeProject.title}
        </h3>

        {/* Project Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {safeProject.description}
        </p>

        {/* Tech Stack */}
        {safeProject.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {safeProject.techStack.slice(0, 3).map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {safeProject.techStack.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{safeProject.techStack.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Project Meta Information */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatTimeAgo(safeProject.createdAt)}</span>
          </div>
          {safeProject.status === 'in-progress' && typeof safeProject.progress === 'number' && (
            <div className="flex items-center gap-1">
              <span className="text-xs">{Math.round(safeProject.progress)}% complete</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{safeProject.likes || 0}</span>
            </button>

            {/* Comments */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span>{safeProject.comments.length}</span>
            </div>
          </div>

          {/* External Links */}
          <div className="flex items-center gap-2">
            {safeProject.githubUrl && (
              <a
                href={safeProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {safeProject.liveUrl && (
              <a
                href={safeProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}