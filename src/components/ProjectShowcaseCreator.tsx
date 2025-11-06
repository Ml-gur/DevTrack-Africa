import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Rocket, 
  Trophy,
  Play,
  CheckCircle2,
  Clock,
  Upload,
  Camera,
  Eye,
  Github,
  ExternalLink,
  Hash,
  Lightbulb,
  Target,
  Zap,
  Star,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Project, ProjectStatus } from '../types/project';

interface ProjectShowcaseCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateShowcase: (showcaseData: ProjectShowcaseData) => Promise<void>;
  projects: Project[];
  currentUser: {
    id: string;
    fullName: string;
    profilePicture?: string;
    title?: string;
  };
}

export interface ProjectShowcaseData {
  projectId: string;
  status: ProjectStatus;
  showcaseTitle: string;
  description: string;
  highlights: string[];
  challenges: string;
  techStack: string[];
  features: string[];
  demoUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  images: string[];
  tags: string[];
  lessonsLearned: string;
  futureImprovements: string;
  targetAudience: string;
  visibility: 'public' | 'community';
}

const PROJECT_STATUS_CONFIG = {
  'planning': {
    icon: <Lightbulb className="w-5 h-5" />,
    label: 'Just Started',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    progressRange: [0, 25],
    description: 'Share your project idea and initial planning',
    prompts: {
      highlights: ['What inspired this project?', 'What problem are you solving?', 'What\'s your vision?'],
      challenges: 'What challenges do you anticipate?',
      features: ['Core features you plan to build', 'MVP requirements', 'Future enhancements'],
      lessons: 'What research have you done so far?'
    }
  },
  'in-progress': {
    icon: <Clock className="w-5 h-5" />,
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    progressRange: [25, 80],
    description: 'Showcase your development progress and journey',
    prompts: {
      highlights: ['What have you built so far?', 'Major milestones achieved', 'Current development focus'],
      challenges: 'What obstacles have you overcome or are currently facing?',
      features: ['Completed features', 'Features in development', 'Upcoming features'],
      lessons: 'What have you learned during development?'
    }
  },
  'completed': {
    icon: <Trophy className="w-5 h-5" />,
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    progressRange: [80, 100],
    description: 'Present your finished project to the community',
    prompts: {
      highlights: ['Final product achievements', 'Key features delivered', 'Project outcomes'],
      challenges: 'What were the biggest challenges and how did you solve them?',
      features: ['All implemented features', 'Performance metrics', 'User feedback'],
      lessons: 'What would you do differently? What did you learn?'
    }
  }
} as const;

const TECH_SUGGESTIONS = [
  'React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
  'Node.js', 'Express', 'Python', 'Django', 'Flask', 'FastAPI',
  'TypeScript', 'JavaScript', 'Go', 'Rust', 'Java', 'Kotlin',
  'PostgreSQL', 'MongoDB', 'Firebase', 'Supabase', 'MySQL',
  'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Chakra UI',
  'AWS', 'Vercel', 'Netlify', 'Heroku', 'Docker', 'Kubernetes'
];

const TAG_SUGGESTIONS = [
  'fintech', 'edtech', 'healthtech', 'agritech', 'ecommerce', 'social',
  'ai', 'ml', 'blockchain', 'iot', 'startup', 'opensource', 'mvp',
  'africa', 'innovation', 'mobile', 'web', 'api', 'dashboard'
];

export default function ProjectShowcaseCreator({ 
  isOpen, 
  onClose, 
  onCreateShowcase,
  projects,
  currentUser 
}: ProjectShowcaseCreatorProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showcaseData, setShowcaseData] = useState<ProjectShowcaseData>({
    projectId: '',
    status: 'in-progress',
    showcaseTitle: '',
    description: '',
    highlights: ['', '', ''],
    challenges: '',
    techStack: [],
    features: ['', '', ''],
    demoUrl: '',
    githubUrl: '',
    liveUrl: '',
    images: [],
    tags: [],
    lessonsLearned: '',
    futureImprovements: '',
    targetAudience: '',
    visibility: 'public'
  });
  const [currentTab, setCurrentTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newTech, setNewTech] = useState('');
  const [newTag, setNewTag] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    console.log('📋 ProjectShowcaseCreator projects updated:', projects.length);
  }, [projects]);

  useEffect(() => {
    if (selectedProject) {
      setShowcaseData(prev => ({
        ...prev,
        projectId: selectedProject.id,
        showcaseTitle: `${selectedProject.title} - ${PROJECT_STATUS_CONFIG[selectedProject.status].label}`,
        description: selectedProject.description || '',
        techStack: selectedProject.techStack || [],
        githubUrl: selectedProject.githubUrl || '',
        liveUrl: selectedProject.liveUrl || '',
        status: selectedProject.status,
        tags: getDefaultTags(selectedProject)
      }));
    }
  }, [selectedProject]);

  const getDefaultTags = (project: Project): string[] => {
    const tags = [];
    
    if (project.category) {
      tags.push(project.category.replace('-', ''));
    }
    
    tags.push(project.status === 'completed' ? 'launch' : 'wip');
    
    return tags.slice(0, 3);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!showcaseData.projectId) {
      newErrors.projectId = 'Please select a project to showcase';
    }

    if (!showcaseData.showcaseTitle.trim()) {
      newErrors.showcaseTitle = 'Showcase title is required';
    }

    if (!showcaseData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (showcaseData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    const validHighlights = showcaseData.highlights.filter(h => h.trim());
    if (validHighlights.length < 2) {
      newErrors.highlights = 'Please provide at least 2 project highlights';
    }

    if (!showcaseData.challenges.trim()) {
      newErrors.challenges = 'Please describe the challenges faced';
    }

    const validFeatures = showcaseData.features.filter(f => f.trim());
    if (validFeatures.length < 2) {
      newErrors.features = 'Please provide at least 2 features';
    }

    if (showcaseData.techStack.length === 0) {
      newErrors.techStack = 'Please add at least one technology';
    }

    if (!showcaseData.lessonsLearned.trim()) {
      newErrors.lessonsLearned = 'Please share what you learned';
    }

    if (!showcaseData.targetAudience.trim()) {
      newErrors.targetAudience = 'Please describe your target audience';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error if validation fails
      const firstErrorTab = Object.keys(errors)[0];
      if (firstErrorTab === 'projectId' || firstErrorTab === 'showcaseTitle' || firstErrorTab === 'description' || firstErrorTab === 'targetAudience') {
        setCurrentTab('basic');
      } else if (firstErrorTab === 'highlights' || firstErrorTab === 'challenges' || firstErrorTab === 'features' || firstErrorTab === 'lessonsLearned') {
        setCurrentTab('content');
      } else if (firstErrorTab === 'techStack') {
        setCurrentTab('technical');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Process images
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(imageUrl);
      }

      const finalShowcaseData = {
        ...showcaseData,
        highlights: showcaseData.highlights.filter(h => h.trim()),
        features: showcaseData.features.filter(f => f.trim()),
        images: imageUrls
      };

      await onCreateShowcase(finalShowcaseData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating showcase:', error);
      setErrors({ submit: 'Failed to create showcase. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProject(null);
    setShowcaseData({
      projectId: '',
      status: 'in-progress',
      showcaseTitle: '',
      description: '',
      highlights: ['', '', ''],
      challenges: '',
      techStack: [],
      features: ['', '', ''],
      demoUrl: '',
      githubUrl: '',
      liveUrl: '',
      images: [],
      tags: [],
      lessonsLearned: '',
      futureImprovements: '',
      targetAudience: '',
      visibility: 'public'
    });
    setCurrentTab('basic');
    setErrors({});
    setImageFiles([]);
  };

  const handleInputChange = (field: keyof ProjectShowcaseData, value: any) => {
    setShowcaseData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...showcaseData.highlights];
    newHighlights[index] = value;
    handleInputChange('highlights', newHighlights);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...showcaseData.features];
    newFeatures[index] = value;
    handleInputChange('features', newFeatures);
  };

  const addTechnology = (tech?: string) => {
    const techToAdd = tech || newTech.trim();
    if (techToAdd && !showcaseData.techStack.includes(techToAdd) && showcaseData.techStack.length < 10) {
      handleInputChange('techStack', [...showcaseData.techStack, techToAdd]);
      if (!tech) setNewTech('');
    }
  };

  const removeTechnology = (techToRemove: string) => {
    handleInputChange('techStack', showcaseData.techStack.filter(tech => tech !== techToRemove));
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || newTag.trim().toLowerCase();
    if (tagToAdd && !showcaseData.tags.includes(tagToAdd) && showcaseData.tags.length < 8) {
      handleInputChange('tags', [...showcaseData.tags, tagToAdd]);
      if (!tag) setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', showcaseData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length + imageFiles.length > 4) {
      setErrors(prev => ({ ...prev, images: 'Maximum 4 images allowed' }));
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    if (errors.images) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const statusConfig = PROJECT_STATUS_CONFIG[showcaseData.status];
  const progressValue = selectedProject?.progress || 
    (statusConfig.progressRange[0] + statusConfig.progressRange[1]) / 2;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Create Project Showcase
          </DialogTitle>
          <DialogDescription>
            Share your development journey with the DevTrack Africa community in a professional showcase
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 p-1">
            {/* Project Selection */}
            <div className="space-y-3">
              <Label>Select Project to Showcase *</Label>
              {projects.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Rocket className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">No Projects Available</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create your first project to start showcasing your work to the community!
                        </p>
                        <Button variant="outline" onClick={onClose}>
                          Create Your First Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Select 
                  value={showcaseData.projectId} 
                  onValueChange={(value) => {
                    handleInputChange('projectId', value);
                    const project = projects.find(p => p.id === value);
                    setSelectedProject(project || null);
                  }}
                >
                  <SelectTrigger className={errors.projectId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Choose a project to showcase..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-full ${PROJECT_STATUS_CONFIG[project.status].color}`}>
                            {PROJECT_STATUS_CONFIG[project.status].icon}
                          </div>
                          <div>
                            <div className="font-medium">{project.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {PROJECT_STATUS_CONFIG[project.status].label} • {project.progress}% complete
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.projectId && (
                <p className="text-sm text-destructive">{errors.projectId}</p>
              )}
            </div>

            {selectedProject && (
              <>
                {/* Project Status Overview */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statusConfig.color}`}>
                          {statusConfig.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{statusConfig.label}</h3>
                          <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {progressValue}% Complete
                      </Badge>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </CardContent>
                </Card>

                <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="media">Media & Links</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    {/* Showcase Title */}
                    <div className="space-y-2">
                      <Label htmlFor="showcaseTitle">Showcase Title *</Label>
                      <Input
                        id="showcaseTitle"
                        value={showcaseData.showcaseTitle}
                        onChange={(e) => handleInputChange('showcaseTitle', e.target.value)}
                        placeholder="Give your showcase an engaging title..."
                        className={errors.showcaseTitle ? 'border-destructive' : ''}
                      />
                      {errors.showcaseTitle && (
                        <p className="text-sm text-destructive">{errors.showcaseTitle}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Project Description *</Label>
                      <Textarea
                        id="description"
                        value={showcaseData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe what your project does and why it matters..."
                        rows={4}
                        className={errors.description ? 'border-destructive' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {showcaseData.description.length}/500 characters (min 50)
                      </p>
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Target Audience *</Label>
                      <Input
                        id="targetAudience"
                        value={showcaseData.targetAudience}
                        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                        placeholder="Who is this project for? (e.g., small businesses, students, developers)"
                        className={errors.targetAudience ? 'border-destructive' : ''}
                      />
                      {errors.targetAudience && (
                        <p className="text-sm text-destructive">{errors.targetAudience}</p>
                      )}
                    </div>

                    {/* Visibility */}
                    <div className="space-y-2">
                      <Label>Showcase Visibility</Label>
                      <Select 
                        value={showcaseData.visibility} 
                        onValueChange={(value: 'public' | 'community') => handleInputChange('visibility', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <div>
                                <div className="font-medium">Public</div>
                                <div className="text-xs text-muted-foreground">Visible to everyone</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="community">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              <div>
                                <div className="font-medium">Community Only</div>
                                <div className="text-xs text-muted-foreground">DevTrack Africa members only</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-6">
                    {/* Project Highlights */}
                    <div className="space-y-3">
                      <Label>Project Highlights * (At least 2 required)</Label>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">Suggestions:</p>
                            <ul className="text-xs text-blue-700 mt-1 space-y-1">
                              {statusConfig.prompts.highlights.map((prompt, index) => (
                                <li key={index}>• {prompt}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      {showcaseData.highlights.map((highlight, index) => (
                        <Input
                          key={index}
                          value={highlight}
                          onChange={(e) => handleHighlightChange(index, e.target.value)}
                          placeholder={`Highlight ${index + 1}...`}
                        />
                      ))}
                      {errors.highlights && (
                        <p className="text-sm text-destructive">{errors.highlights}</p>
                      )}
                    </div>

                    {/* Challenges */}
                    <div className="space-y-2">
                      <Label htmlFor="challenges">Challenges & Solutions *</Label>
                      <Textarea
                        id="challenges"
                        value={showcaseData.challenges}
                        onChange={(e) => handleInputChange('challenges', e.target.value)}
                        placeholder={statusConfig.prompts.challenges}
                        rows={3}
                        className={errors.challenges ? 'border-destructive' : ''}
                      />
                      {errors.challenges && (
                        <p className="text-sm text-destructive">{errors.challenges}</p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <Label>Key Features * (At least 2 required)</Label>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Feature Ideas:</p>
                            <ul className="text-xs text-green-700 mt-1 space-y-1">
                              {statusConfig.prompts.features.map((prompt, index) => (
                                <li key={index}>• {prompt}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      {showcaseData.features.map((feature, index) => (
                        <Input
                          key={index}
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder={`Feature ${index + 1}...`}
                        />
                      ))}
                      {errors.features && (
                        <p className="text-sm text-destructive">{errors.features}</p>
                      )}
                    </div>

                    {/* Lessons Learned */}
                    <div className="space-y-2">
                      <Label htmlFor="lessonsLearned">Lessons Learned *</Label>
                      <Textarea
                        id="lessonsLearned"
                        value={showcaseData.lessonsLearned}
                        onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
                        placeholder={statusConfig.prompts.lessons}
                        rows={3}
                        className={errors.lessonsLearned ? 'border-destructive' : ''}
                      />
                      {errors.lessonsLearned && (
                        <p className="text-sm text-destructive">{errors.lessonsLearned}</p>
                      )}
                    </div>

                    {/* Future Improvements */}
                    <div className="space-y-2">
                      <Label htmlFor="futureImprovements">Future Improvements (Optional)</Label>
                      <Textarea
                        id="futureImprovements"
                        value={showcaseData.futureImprovements}
                        onChange={(e) => handleInputChange('futureImprovements', e.target.value)}
                        placeholder="What would you like to add or improve in future versions?"
                        rows={2}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-6">
                    {/* Tech Stack */}
                    <div className="space-y-3">
                      <Label>Technologies Used *</Label>
                      
                      {/* Current Tech Stack */}
                      <div className="flex flex-wrap gap-2">
                        {showcaseData.techStack.map(tech => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechnology(tech)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      {/* Add New Technology */}
                      <div className="flex gap-2">
                        <Input
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          placeholder="Add a technology..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                        />
                        <Button type="button" onClick={() => addTechnology()} variant="outline">
                          Add
                        </Button>
                      </div>

                      {/* Tech Suggestions */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Popular Technologies:</p>
                        <div className="flex flex-wrap gap-2">
                          {TECH_SUGGESTIONS.filter(tech => !showcaseData.techStack.includes(tech))
                            .slice(0, 8).map(tech => (
                            <Button
                              key={tech}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTechnology(tech)}
                              className="text-xs h-7"
                            >
                              + {tech}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {errors.techStack && (
                        <p className="text-sm text-destructive">{errors.techStack}</p>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                      <Label>Tags (Optional)</Label>
                      
                      {/* Current Tags */}
                      <div className="flex flex-wrap gap-2">
                        {showcaseData.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      {/* Add New Tag */}
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={() => addTag()} variant="outline">
                          Add
                        </Button>
                      </div>

                      {/* Tag Suggestions */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Suggested Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {TAG_SUGGESTIONS.filter(tag => !showcaseData.tags.includes(tag))
                            .slice(0, 6).map(tag => (
                            <Button
                              key={tag}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTag(tag)}
                              className="text-xs h-7"
                            >
                              + {tag}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-6">
                    {/* Project Links */}
                    <div className="space-y-4">
                      <Label>Project Links</Label>
                      
                      <div className="space-y-3">
                        {/* GitHub URL */}
                        <div className="space-y-2">
                          <Label htmlFor="githubUrl" className="text-sm">GitHub Repository</Label>
                          <div className="flex gap-2">
                            <Github className="w-4 h-4 mt-3 text-muted-foreground" />
                            <Input
                              id="githubUrl"
                              value={showcaseData.githubUrl}
                              onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                              placeholder="https://github.com/username/repository"
                            />
                          </div>
                        </div>

                        {/* Live URL */}
                        <div className="space-y-2">
                          <Label htmlFor="liveUrl" className="text-sm">Live Demo URL</Label>
                          <div className="flex gap-2">
                            <ExternalLink className="w-4 h-4 mt-3 text-muted-foreground" />
                            <Input
                              id="liveUrl"
                              value={showcaseData.liveUrl}
                              onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                              placeholder="https://your-project.com"
                            />
                          </div>
                        </div>

                        {/* Demo URL */}
                        <div className="space-y-2">
                          <Label htmlFor="demoUrl" className="text-sm">Demo Video URL</Label>
                          <div className="flex gap-2">
                            <Play className="w-4 h-4 mt-3 text-muted-foreground" />
                            <Input
                              id="demoUrl"
                              value={showcaseData.demoUrl}
                              onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                      <Label>Project Images (Optional, Max 4)</Label>
                      
                      {/* Current Images */}
                      {imageFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {imageFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <ImageWithFallback
                                src={URL.createObjectURL(file)}
                                alt={`Project image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Button */}
                      {imageFiles.length < 4 && (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-2">
                              <Camera className="w-8 h-8 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Upload Project Images</p>
                                <p className="text-sm text-muted-foreground">
                                  PNG, JPG up to 5MB each
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      )}

                      {errors.images && (
                        <p className="text-sm text-destructive">{errors.images}</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Submit Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <div className="flex gap-3">
                    {currentTab === 'basic' && (
                      <Button 
                        type="button" 
                        onClick={() => setCurrentTab('content')}
                        variant="outline"
                      >
                        Next: Content
                      </Button>
                    )}
                    {currentTab === 'content' && (
                      <Button 
                        type="button" 
                        onClick={() => setCurrentTab('technical')}
                        variant="outline"
                      >
                        Next: Technical
                      </Button>
                    )}
                    {currentTab === 'technical' && (
                      <Button 
                        type="button" 
                        onClick={() => setCurrentTab('media')}
                        variant="outline"
                      >
                        Next: Media & Links
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Create Showcase
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg">
                    {errors.submit}
                  </div>
                )}
              </>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}