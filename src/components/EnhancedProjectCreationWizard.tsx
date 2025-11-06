import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { 
  ArrowRight, 
  ArrowLeft,
  Check,
  Sparkles,
  Rocket,
  Code,
  Palette,
  Globe,
  Smartphone,
  Database,
  Brain,
  Gamepad2,
  Link2,
  Package,
  X,
  Plus,
  Github,
  Calendar,
  Image as ImageIcon,
  Upload,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Flag,
  Star,
  CheckCircle2
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProjectStatus } from '../types/database';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  techStack: string[];
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  images: string[];
  isPublic: boolean;
  goals: string[];
  targetAudience: string;
}

interface EnhancedProjectCreationWizardProps {
  onSubmit: (projectData: Partial<ProjectFormData>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TECH_STACK_OPTIONS = [
  // Frontend
  { name: 'React', category: 'Frontend', icon: '⚛️', color: 'bg-cyan-100 text-cyan-700' },
  { name: 'Vue.js', category: 'Frontend', icon: '🌿', color: 'bg-green-100 text-green-700' },
  { name: 'Angular', category: 'Frontend', icon: '🅰️', color: 'bg-red-100 text-red-700' },
  { name: 'Next.js', category: 'Frontend', icon: '▲', color: 'bg-slate-100 text-slate-700' },
  { name: 'Svelte', category: 'Frontend', icon: '🔥', color: 'bg-orange-100 text-orange-700' },
  { name: 'TypeScript', category: 'Language', icon: '📘', color: 'bg-blue-100 text-blue-700' },
  
  // Backend
  { name: 'Node.js', category: 'Backend', icon: '🟢', color: 'bg-green-100 text-green-700' },
  { name: 'Python', category: 'Language', icon: '🐍', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Django', category: 'Backend', icon: '🎸', color: 'bg-green-100 text-green-700' },
  { name: 'FastAPI', category: 'Backend', icon: '⚡', color: 'bg-teal-100 text-teal-700' },
  { name: 'Express', category: 'Backend', icon: '🚂', color: 'bg-slate-100 text-slate-700' },
  { name: 'Go', category: 'Language', icon: '🐹', color: 'bg-cyan-100 text-cyan-700' },
  
  // Database
  { name: 'PostgreSQL', category: 'Database', icon: '🐘', color: 'bg-blue-100 text-blue-700' },
  { name: 'MongoDB', category: 'Database', icon: '🍃', color: 'bg-green-100 text-green-700' },
  { name: 'MySQL', category: 'Database', icon: '🐬', color: 'bg-blue-100 text-blue-700' },
  { name: 'Redis', category: 'Database', icon: '🔴', color: 'bg-red-100 text-red-700' },
  
  // Mobile
  { name: 'React Native', category: 'Mobile', icon: '📱', color: 'bg-blue-100 text-blue-700' },
  { name: 'Flutter', category: 'Mobile', icon: '🦋', color: 'bg-blue-100 text-blue-700' },
  
  // Styling
  { name: 'Tailwind CSS', category: 'Styling', icon: '🎨', color: 'bg-cyan-100 text-cyan-700' },
  { name: 'Sass', category: 'Styling', icon: '💅', color: 'bg-pink-100 text-pink-700' },
  
  // Cloud
  { name: 'AWS', category: 'Cloud', icon: '☁️', color: 'bg-orange-100 text-orange-700' },
  { name: 'Vercel', category: 'Cloud', icon: '▲', color: 'bg-slate-100 text-slate-700' },
  { name: 'Docker', category: 'DevOps', icon: '🐳', color: 'bg-blue-100 text-blue-700' }
];

const PROJECT_CATEGORIES = [
  {
    value: 'Web Application',
    label: 'Web Application',
    icon: <Globe className="w-6 h-6" />,
    description: 'Full-stack web apps, dashboards, SaaS',
    color: 'from-blue-500 to-cyan-500',
    examples: 'E-commerce, CMS, Analytics Dashboard'
  },
  {
    value: 'Mobile App',
    label: 'Mobile App',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'iOS, Android, or cross-platform apps',
    color: 'from-purple-500 to-pink-500',
    examples: 'Social App, Fitness Tracker, E-wallet'
  },
  {
    value: 'API/Backend',
    label: 'API/Backend',
    icon: <Database className="w-6 h-6" />,
    description: 'REST APIs, GraphQL, microservices',
    color: 'from-green-500 to-emerald-500',
    examples: 'REST API, GraphQL Server, Auth Service'
  },
  {
    value: 'AI/ML Project',
    label: 'AI/ML Project',
    icon: <Brain className="w-6 h-6" />,
    description: 'Machine learning, data science',
    color: 'from-violet-500 to-purple-500',
    examples: 'Chatbot, Image Recognition, Predictor'
  },
  {
    value: 'Library/Package',
    label: 'Library/Package',
    icon: <Package className="w-6 h-6" />,
    description: 'NPM packages, libraries, SDKs',
    color: 'from-yellow-500 to-orange-500',
    examples: 'UI Library, Utility Package, Framework'
  },
  {
    value: 'Game',
    label: 'Game',
    icon: <Gamepad2 className="w-6 h-6" />,
    description: '2D/3D games, interactive experiences',
    color: 'from-red-500 to-pink-500',
    examples: 'Puzzle Game, RPG, Browser Game'
  },
  {
    value: 'Design System',
    label: 'Design System',
    icon: <Palette className="w-6 h-6" />,
    description: 'UI kits, component libraries',
    color: 'from-pink-500 to-rose-500',
    examples: 'Component Library, Style Guide, Figma Kit'
  },
  {
    value: 'Other',
    label: 'Other',
    icon: <Code className="w-6 h-6" />,
    description: 'CLI tools, automation, scripts',
    color: 'from-slate-500 to-gray-500',
    examples: 'CLI Tool, Automation Script, Plugin'
  }
];

const STEPS = [
  { id: 1, title: 'Basics', description: 'Project information', icon: <Rocket className="w-5 h-5" /> },
  { id: 2, title: 'Category', description: 'Project type', icon: <Target className="w-5 h-5" /> },
  { id: 3, title: 'Tech Stack', description: 'Technologies used', icon: <Code className="w-5 h-5" /> },
  { id: 4, title: 'Details', description: 'Links & timeline', icon: <Calendar className="w-5 h-5" /> },
  { id: 5, title: 'Preview', description: 'Review & create', icon: <CheckCircle2 className="w-5 h-5" /> }
];

export default function EnhancedProjectCreationWizard({
  onSubmit,
  onCancel,
  isLoading = false
}: EnhancedProjectCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    status: 'planning',
    techStack: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    githubUrl: '',
    liveUrl: '',
    images: [],
    isPublic: true,
    goals: [],
    targetAudience: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [techSearch, setTechSearch] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const progress = (currentStep / STEPS.length) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Project title is required';
      } else if (formData.title.length < 3) {
        newErrors.title = 'Title must be at least 3 characters';
      } else if (formData.title.length > 100) {
        newErrors.title = 'Title must be less than 100 characters';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Project description is required';
      } else if (formData.description.length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }
    }

    if (step === 2 && !formData.category) {
      newErrors.category = 'Please select a project category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const result = await onSubmit({
      ...formData,
      progress: 0
    });

    if (!result.success && result.error) {
      setErrors({ submit: result.error });
    }
  };

  const addTech = (tech: string) => {
    if (!formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
    setTechSearch('');
  };

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const addGoal = () => {
    if (goalInput.trim() && !formData.goals.includes(goalInput.trim())) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, goalInput.trim()]
      }));
      setGoalInput('');
    }
  };

  const removeGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }));
  };

  const filteredTech = TECH_STACK_OPTIONS.filter(tech =>
    tech.name.toLowerCase().includes(techSearch.toLowerCase()) &&
    !formData.techStack.includes(tech.name)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create New Project</h1>
          <p className="text-lg text-slate-600">
            Let's bring your idea to life with a structured development plan
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-500">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl shadow-slate-200/50">
          <CardContent className="p-8">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    What's your project called?
                  </h2>
                  <p className="text-slate-600">
                    Give your project a memorable name and describe what it does
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-base font-semibold">
                      Project Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., TaskMaster Pro, WeatherApp, Portfolio Site"
                      className={`mt-2 h-14 text-lg ${errors.title ? 'border-red-500' : ''}`}
                      autoFocus
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-2">{errors.title}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">
                      {formData.title.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base font-semibold">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what your project does, its key features, and what problems it solves..."
                      rows={5}
                      className={`mt-2 text-base ${errors.description ? 'border-red-500' : ''}`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-2">{errors.description}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">
                      {formData.description.length} characters • Min 10 characters
                    </p>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Pro Tips</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Be specific and descriptive</li>
                          <li>• Mention key features or technologies</li>
                          <li>• Explain the problem it solves</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Category */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    What type of project is this?
                  </h2>
                  <p className="text-slate-600">
                    Choose the category that best describes your project
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROJECT_CATEGORIES.map((category) => (
                    <Card
                      key={category.value}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        formData.category === category.value
                          ? 'ring-2 ring-blue-600 shadow-lg'
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => setFormData({ ...formData, category: category.value })}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white flex-shrink-0`}>
                            {category.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{category.label}</h3>
                              {formData.category === category.value && (
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              {category.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              Examples: {category.examples}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {errors.category && (
                  <p className="text-sm text-red-600 text-center">{errors.category}</p>
                )}
              </div>
            )}

            {/* Step 3: Tech Stack */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    What technologies are you using?
                  </h2>
                  <p className="text-slate-600">
                    Select the languages, frameworks, and tools for your project
                  </p>
                </div>

                {/* Search and Add */}
                <div className="relative">
                  <Input
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    placeholder="Search technologies (e.g., React, Python, Docker)..."
                    className="h-12 pr-12"
                  />
                  <Code className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
                </div>

                {/* Selected Technologies */}
                {formData.techStack.length > 0 && (
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Selected ({formData.techStack.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.map((tech) => {
                        const techInfo = TECH_STACK_OPTIONS.find(t => t.name === tech);
                        return (
                          <Badge
                            key={tech}
                            className={`px-4 py-2 text-sm ${techInfo?.color || 'bg-slate-100 text-slate-700'}`}
                          >
                            <span className="mr-2">{techInfo?.icon || '💻'}</span>
                            {tech}
                            <button
                              onClick={() => removeTech(tech)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Technologies */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    {techSearch ? 'Search Results' : 'Popular Technologies'}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto p-2">
                    {(techSearch ? filteredTech : TECH_STACK_OPTIONS.slice(0, 12)).map((tech) => (
                      <button
                        key={tech.name}
                        onClick={() => addTech(tech.name)}
                        className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                          formData.techStack.includes(tech.name)
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-blue-300'
                        }`}
                        disabled={formData.techStack.includes(tech.name)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{tech.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{tech.name}</div>
                            <div className="text-xs text-slate-500">{tech.category}</div>
                          </div>
                          {formData.techStack.includes(tech.name) && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom */}
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Don't see your technology?</p>
                      <p className="text-xs text-slate-500">Type and press Enter to add custom tech</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Details */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Additional Details
                  </h2>
                  <p className="text-slate-600">
                    Add links, timeline, and goals for your project
                  </p>
                </div>

                {/* Links */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="githubUrl" className="text-base font-semibold flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub Repository
                    </Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      placeholder="https://github.com/username/repo"
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="liveUrl" className="text-base font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Live Demo URL
                    </Label>
                    <Input
                      id="liveUrl"
                      type="url"
                      value={formData.liveUrl}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                      placeholder="https://your-project.com"
                      className="mt-2 h-12"
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-base font-semibold">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-base font-semibold">
                      Target End Date (Optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-2 h-12"
                    />
                  </div>
                </div>

                {/* Project Goals */}
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4" />
                    Project Goals
                  </Label>
                  
                  {formData.goals.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.goals.map((goal, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="flex-1 text-sm font-medium text-green-900">{goal}</span>
                          <button
                            onClick={() => removeGoal(goal)}
                            className="text-green-600 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                      placeholder="Add a project goal (e.g., Launch MVP by Q2)"
                      className="h-12"
                    />
                    <Button
                      type="button"
                      onClick={addGoal}
                      disabled={!goalInput.trim()}
                      className="h-12 px-6"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <Label htmlFor="targetAudience" className="text-base font-semibold">
                    Target Audience (Optional)
                  </Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="e.g., Small businesses, Developers, Students"
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Preview */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Review Your Project
                  </h2>
                  <p className="text-slate-600">
                    Everything look good? You can always edit this later
                  </p>
                </div>

                {/* Preview Card */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6 space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">
                            {formData.title}
                          </h3>
                          <p className="text-slate-700 leading-relaxed">
                            {formData.description}
                          </p>
                        </div>
                        <Badge className="bg-blue-600 text-white">
                          {formData.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    {formData.techStack.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Technologies ({formData.techStack.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.techStack.map((tech) => {
                            const techInfo = TECH_STACK_OPTIONS.find(t => t.name === tech);
                            return (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="px-3 py-1"
                              >
                                <span className="mr-1">{techInfo?.icon || '💻'}</span>
                                {tech}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {(formData.githubUrl || formData.liveUrl) && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <Link2 className="w-4 h-4" />
                          Links
                        </h4>
                        <div className="space-y-2">
                          {formData.githubUrl && (
                            <div className="flex items-center gap-2 text-sm">
                              <Github className="w-4 h-4 text-slate-600" />
                              <a
                                href={formData.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {formData.githubUrl}
                              </a>
                            </div>
                          )}
                          {formData.liveUrl && (
                            <div className="flex items-center gap-2 text-sm">
                              <Globe className="w-4 h-4 text-slate-600" />
                              <a
                                href={formData.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {formData.liveUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Goals */}
                    {formData.goals.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <Flag className="w-4 h-4" />
                          Goals
                        </h4>
                        <div className="space-y-2">
                          {formData.goals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-slate-700">{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Timeline
                      </h4>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Start:</span>{' '}
                          <span className="font-medium">
                            {new Date(formData.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        {formData.endDate && (
                          <>
                            <span className="text-slate-400">→</span>
                            <div>
                              <span className="text-slate-600">End:</span>{' '}
                              <span className="font-medium">
                                {new Date(formData.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? onCancel : prevStep}
                disabled={isLoading}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  Step {currentStep} of {STEPS.length}
                </span>

                {currentStep < STEPS.length ? (
                  <Button onClick={nextStep} className="gap-2">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Create Project
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Need help? Check out our{' '}
            <button className="text-blue-600 hover:underline font-medium">
              project creation guide
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
