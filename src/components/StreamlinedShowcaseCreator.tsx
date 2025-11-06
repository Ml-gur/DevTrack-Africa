import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  Rocket, 
  Trophy,
  CheckCircle2,
  Clock,
  Eye,
  Github,
  ExternalLink,
  Lightbulb,
  Target,
  Zap,
  Star,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Project, ProjectStatus } from '../types/project';
import { ProjectShowcaseData } from './ProjectShowcaseCreator';

interface StreamlinedShowcaseCreatorProps {
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

const PROJECT_STATUS_CONFIG = {
  'planning': {
    icon: <Lightbulb className="w-5 h-5" />,
    label: 'Just Started',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Share your project idea and early planning'
  },
  'in-progress': {
    icon: <Clock className="w-5 h-5" />,
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Showcase your development progress'
  },
  'completed': {
    icon: <Trophy className="w-5 h-5" />,
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Present your finished masterpiece'
  }
} as const;

export default function StreamlinedShowcaseCreator({ 
  isOpen, 
  onClose, 
  onCreateShowcase,
  projects,
  currentUser 
}: StreamlinedShowcaseCreatorProps) {
  const [step, setStep] = useState(1);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-populate when project is selected
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
        targetAudience: getDefaultAudience(selectedProject.category),
        tags: getDefaultTags(selectedProject)
      }));
    }
  }, [selectedProject]);

  const getDefaultAudience = (category: string): string => {
    const audiences = {
      'web-app': 'Businesses and end users',
      'mobile-app': 'Mobile users and consumers',
      'api': 'Developers and technical teams',
      'ai-ml': 'Data scientists and researchers',
      'blockchain': 'Crypto enthusiasts and investors',
      'game': 'Gamers and entertainment seekers',
      'library': 'Developers and the open source community'
    };
    return audiences[category as keyof typeof audiences] || 'General users and developers';
  };

  const getDefaultTags = (project: Project): string[] => {
    const tags = [];
    if (project.category) {
      tags.push(project.category.replace('-', ''));
    }
    tags.push(project.status === 'completed' ? 'launch' : 'wip');
    return tags.slice(0, 3);
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (stepNumber === 1) {
      if (!showcaseData.projectId) {
        newErrors.projectId = 'Please select a project';
        setErrors(newErrors);
        return false;
      }
    }

    if (stepNumber === 2) {
      if (!showcaseData.showcaseTitle.trim()) {
        newErrors.showcaseTitle = 'Showcase title is required';
      }
      if (!showcaseData.description.trim() || showcaseData.description.length < 50) {
        newErrors.description = 'Description must be at least 50 characters';
      }
      if (!showcaseData.targetAudience.trim()) {
        newErrors.targetAudience = 'Target audience is required';
      }
    }

    if (stepNumber === 3) {
      const validHighlights = showcaseData.highlights.filter(h => h.trim());
      if (validHighlights.length < 2) {
        newErrors.highlights = 'At least 2 highlights required';
      }
      if (!showcaseData.challenges.trim()) {
        newErrors.challenges = 'Please describe challenges faced';
      }
      const validFeatures = showcaseData.features.filter(f => f.trim());
      if (validFeatures.length < 2) {
        newErrors.features = 'At least 2 features required';
      }
      if (!showcaseData.lessonsLearned.trim()) {
        newErrors.lessonsLearned = 'Please share lessons learned';
      }
      if (showcaseData.techStack.length === 0) {
        newErrors.techStack = 'At least one technology required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const finalShowcaseData = {
        ...showcaseData,
        highlights: showcaseData.highlights.filter(h => h.trim()),
        features: showcaseData.features.filter(f => f.trim())
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
    setStep(1);
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
    setErrors({});
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

  const handleArrayChange = (field: 'highlights' | 'features', index: number, value: string) => {
    const currentArray = [...showcaseData[field]];
    currentArray[index] = value;
    handleInputChange(field, currentArray);
  };

  const addTech = (tech: string) => {
    if (!showcaseData.techStack.includes(tech)) {
      handleInputChange('techStack', [...showcaseData.techStack, tech]);
    }
  };

  const removeTech = (tech: string) => {
    handleInputChange('techStack', showcaseData.techStack.filter(t => t !== tech));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Create Project Showcase
          </DialogTitle>
          <DialogDescription>
            Share your amazing work with the DevTrack Africa community
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex-shrink-0 px-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1">
              <Progress value={(step / 3) * 100} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-1">
          {/* Step 1: Project Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Choose Your Project</h3>
                <p className="text-sm text-muted-foreground">
                  Select the project you'd like to showcase to the community
                </p>
              </div>

              {projects.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Projects Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first project to start showcasing!
                    </p>
                    <Button variant="outline" onClick={onClose}>
                      Create Your First Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {projects.map(project => (
                    <Card 
                      key={project.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        showcaseData.projectId === project.id ? 'ring-2 ring-primary border-primary' : ''
                      }`}
                      onClick={() => {
                        handleInputChange('projectId', project.id);
                        setSelectedProject(project);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${PROJECT_STATUS_CONFIG[project.status].color}`}>
                            {PROJECT_STATUS_CONFIG[project.status].icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{project.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{PROJECT_STATUS_CONFIG[project.status].label}</span>
                              <span>{project.progress}% complete</span>
                              <span>{project.techStack?.length || 0} technologies</span>
                            </div>
                          </div>
                          {showcaseData.projectId === project.id && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {errors.projectId && (
                <p className="text-sm text-destructive">{errors.projectId}</p>
              )}
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && selectedProject && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                  Tell the community about your project
                </p>
              </div>

              {/* Selected Project Preview */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${PROJECT_STATUS_CONFIG[selectedProject.status].color}`}>
                      {PROJECT_STATUS_CONFIG[selectedProject.status].icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{selectedProject.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {PROJECT_STATUS_CONFIG[selectedProject.status].description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
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
                    placeholder="Who is this project for?"
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

                {/* Project Links */}
                <div className="space-y-3">
                  <Label>Project Links (Optional)</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Github className="w-4 h-4 mt-3 text-muted-foreground" />
                      <Input
                        value={showcaseData.githubUrl}
                        onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                        placeholder="GitHub repository URL"
                      />
                    </div>
                    <div className="flex gap-2">
                      <ExternalLink className="w-4 h-4 mt-3 text-muted-foreground" />
                      <Input
                        value={showcaseData.liveUrl}
                        onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                        placeholder="Live demo URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Project Details */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Project Details</h3>
                <p className="text-sm text-muted-foreground">
                  Share the story behind your project
                </p>
              </div>

              <div className="space-y-4">
                {/* Quick Tech Stack */}
                <div className="space-y-3">
                  <Label>Technologies Used *</Label>
                  <div className="flex flex-wrap gap-2">
                    {showcaseData.techStack.map(tech => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTech(tech)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {showcaseData.techStack.length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <p className="text-sm text-muted-foreground">No technologies added yet</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'Python', 'TypeScript', 'Next.js', 'Supabase'].map(tech => (
                      !showcaseData.techStack.includes(tech) && (
                        <Button
                          key={tech}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTech(tech)}
                          className="text-xs h-7"
                        >
                          + {tech}
                        </Button>
                      )
                    ))}
                  </div>
                  {errors.techStack && (
                    <p className="text-sm text-destructive">{errors.techStack}</p>
                  )}
                </div>

                {/* Project Highlights */}
                <div className="space-y-3">
                  <Label>Project Highlights * (At least 2)</Label>
                  {showcaseData.highlights.map((highlight, index) => (
                    <Input
                      key={index}
                      value={highlight}
                      onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                      placeholder={`Highlight ${index + 1}...`}
                    />
                  ))}
                  {errors.highlights && (
                    <p className="text-sm text-destructive">{errors.highlights}</p>
                  )}
                </div>

                {/* Key Features */}
                <div className="space-y-3">
                  <Label>Key Features * (At least 2)</Label>
                  {showcaseData.features.map((feature, index) => (
                    <Input
                      key={index}
                      value={feature}
                      onChange={(e) => handleArrayChange('features', index, e.target.value)}
                      placeholder={`Feature ${index + 1}...`}
                    />
                  ))}
                  {errors.features && (
                    <p className="text-sm text-destructive">{errors.features}</p>
                  )}
                </div>

                {/* Challenges */}
                <div className="space-y-2">
                  <Label htmlFor="challenges">Challenges & Solutions *</Label>
                  <Textarea
                    id="challenges"
                    value={showcaseData.challenges}
                    onChange={(e) => handleInputChange('challenges', e.target.value)}
                    placeholder="What challenges did you face and how did you solve them?"
                    rows={3}
                    className={errors.challenges ? 'border-destructive' : ''}
                  />
                  {errors.challenges && (
                    <p className="text-sm text-destructive">{errors.challenges}</p>
                  )}
                </div>

                {/* Lessons Learned */}
                <div className="space-y-2">
                  <Label htmlFor="lessonsLearned">Lessons Learned *</Label>
                  <Textarea
                    id="lessonsLearned"
                    value={showcaseData.lessonsLearned}
                    onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
                    placeholder="What did you learn from this project?"
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
                    placeholder="What would you like to add or improve?"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step > 1 && (
                <Button type="button" variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {step < 3 ? (
                <Button 
                  onClick={handleNext}
                  disabled={step === 1 && !showcaseData.projectId}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
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
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="mt-3 bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg">
              {errors.submit}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}