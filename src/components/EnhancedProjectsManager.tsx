import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  BarChart3,
  Folder,
  Star,
  Archive,
  Download,
  Upload,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { Project } from '../types/database';
import ProjectCard from './ProjectCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

interface EnhancedProjectsManagerProps {
  projects: Project[];
  currentUser: any;
  onCreateProject: () => void;
  onSelectProject: (project: Project) => void;
  onArchiveProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onExportProjects: () => void;
  onImportProjects: () => void;
  onCreateFromTemplate: () => void;
}

type ViewMode = 'grid' | 'list' | 'calendar';
type FilterStatus = 'all' | 'active' | 'planning' | 'completed' | 'on-hold';
type SortBy = 'recent' | 'name' | 'progress' | 'dueDate';

export default function EnhancedProjectsManager({
  projects = [],
  currentUser,
  onCreateProject,
  onSelectProject,
  onArchiveProject,
  onDuplicateProject,
  onExportProjects,
  onImportProjects,
  onCreateFromTemplate
}: EnhancedProjectsManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteProjects, setFavoriteProjects] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('favoriteProjects');
    if (stored) {
      setFavoriteProjects(new Set(JSON.parse(stored)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (projectId: string) => {
    setFavoriteProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      localStorage.setItem('favoriteProjects', JSON.stringify([...next]));
      return next;
    });
  };

  // Filter and sort projects
  const filteredProjects = projects.filter(project => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'progress':
        return (b.progress || 0) - (a.progress || 0);
      case 'dueDate':
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      case 'recent':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  // Separate favorites
  const favorites = sortedProjects.filter(p => favoriteProjects.has(p.id));
  const regular = sortedProjects.filter(p => !favoriteProjects.has(p.id));
  const displayProjects = [...favorites, ...regular];

  // Calculate statistics
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
    avgProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      : 0
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedProjects(new Set(displayProjects.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedProjects(new Set());
  };

  const bulkArchive = () => {
    selectedProjects.forEach(id => onArchiveProject(id));
    clearSelection();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Projects</h1>
              <p className="text-slate-600">
                Manage your development projects and track progress
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onImportProjects}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onExportProjects}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>

              <Button
                variant="outline"
                onClick={onCreateFromTemplate}
                className="gap-2"
              >
                <Zap className="w-4 h-4" />
                Use Template
              </Button>
              
              <Button
                onClick={onCreateProject}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Planning</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.planning}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Progress</p>
                    <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Updated</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="gap-2"
                  >
                    <Grid className="w-4 h-4" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="gap-2"
                  >
                    <List className="w-4 h-4" />
                    List
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedProjects.size > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={bulkArchive}>
                      <Archive className="w-4 h-4 mr-1" />
                      Archive
                    </Button>
                    <Button size="sm" variant="ghost" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Projects Display */}
        {displayProjects.length === 0 ? (
          <Card className="bg-white border-slate-200">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Folder className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your filters or search query'
                  : 'Get started by creating your first project or using a template'}
              </p>
              <div className="flex gap-3 justify-center">
                {(searchQuery || filterStatus !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button onClick={onCreateProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
                <Button variant="outline" onClick={onCreateFromTemplate}>
                  <Zap className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Favorites Section */}
            {favorites.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-xl font-semibold">Favorites</h2>
                  <Badge variant="secondary">{favorites.length}</Badge>
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {favorites.map((project) => (
                    <ProjectCardWithActions
                      key={project.id}
                      project={project}
                      viewMode={viewMode}
                      isSelected={selectedProjects.has(project.id)}
                      isFavorite={favoriteProjects.has(project.id)}
                      onSelect={onSelectProject}
                      onToggleSelection={() => toggleProjectSelection(project.id)}
                      onToggleFavorite={() => toggleFavorite(project.id)}
                      onDuplicate={() => onDuplicateProject(project.id)}
                      onArchive={() => onArchiveProject(project.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Projects Section */}
            {regular.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">All Projects</h2>
                    <Badge variant="secondary">{regular.length}</Badge>
                  </div>
                  {regular.length > 1 && selectedProjects.size === 0 && (
                    <Button variant="ghost" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                  )}
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {regular.map((project) => (
                    <ProjectCardWithActions
                      key={project.id}
                      project={project}
                      viewMode={viewMode}
                      isSelected={selectedProjects.has(project.id)}
                      isFavorite={favoriteProjects.has(project.id)}
                      onSelect={onSelectProject}
                      onToggleSelection={() => toggleProjectSelection(project.id)}
                      onToggleFavorite={() => toggleFavorite(project.id)}
                      onDuplicate={() => onDuplicateProject(project.id)}
                      onArchive={() => onArchiveProject(project.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Enhanced Project Card with Actions
interface ProjectCardWithActionsProps {
  project: Project;
  viewMode: ViewMode;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (project: Project) => void;
  onToggleSelection: () => void;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}

function ProjectCardWithActions({
  project,
  viewMode,
  isSelected,
  isFavorite,
  onSelect,
  onToggleSelection,
  onToggleFavorite,
  onDuplicate,
  onArchive
}: ProjectCardWithActionsProps) {
  const [showActions, setShowActions] = useState(false);

  if (viewMode === 'list') {
    return (
      <Card 
        className={`bg-white border-slate-200 hover:border-blue-300 transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
              <div 
                className="col-span-4 cursor-pointer"
                onClick={() => onSelect(project)}
              >
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                    }}
                  >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
                  </Button>
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>

              <div className="col-span-2">
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex gap-1">
                    {project.tech_stack.slice(0, 2).map((tech, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.tech_stack.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tech_stack.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-1.5" />
                </div>
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                {showActions && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate();
                      }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive();
                      }}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <div className="relative group">
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelection}
          className="bg-white shadow-md"
          onClick={(e) => e.stopPropagation()}
        />
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-auto bg-white shadow-md hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
        </Button>
      </div>

      <div onClick={() => onSelect(project)}>
        <ProjectCard project={project} onClick={() => onSelect(project)} />
      </div>

      {/* Hover Actions */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          Duplicate
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onArchive();
          }}
        >
          <Archive className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'planning': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'on-hold': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
