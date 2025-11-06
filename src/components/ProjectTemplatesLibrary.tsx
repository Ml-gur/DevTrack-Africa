import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Code, 
  Smartphone, 
  Globe, 
  Palette,
  Database,
  Brain,
  Rocket,
  Search,
  Star,
  Clock,
  CheckCircle2,
  Zap,
  Layout,
  ShoppingCart,
  MessageSquare,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  estimatedDuration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techStack: string[];
  tasks: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedHours: number;
  }>;
  isPopular?: boolean;
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'web-app-saas',
    name: 'SaaS Web Application',
    description: 'Full-stack SaaS application with authentication, dashboard, and subscription management',
    category: 'web',
    icon: <Globe className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    estimatedDuration: '6-8 weeks',
    difficulty: 'advanced',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'TypeScript'],
    isPopular: true,
    tasks: [
      { title: 'Set up project structure', description: 'Initialize frontend and backend repositories', priority: 'high', estimatedHours: 4 },
      { title: 'Implement authentication', description: 'User registration, login, and JWT tokens', priority: 'high', estimatedHours: 8 },
      { title: 'Create database schema', description: 'Design and implement database tables', priority: 'high', estimatedHours: 6 },
      { title: 'Build dashboard UI', description: 'Create main dashboard with data visualization', priority: 'medium', estimatedHours: 12 },
      { title: 'Integrate payment gateway', description: 'Set up Stripe for subscriptions', priority: 'high', estimatedHours: 8 },
      { title: 'Add API endpoints', description: 'Create RESTful API for all features', priority: 'high', estimatedHours: 10 },
      { title: 'Implement user settings', description: 'Profile management and preferences', priority: 'medium', estimatedHours: 6 },
      { title: 'Add email notifications', description: 'Set up transactional emails', priority: 'medium', estimatedHours: 4 },
      { title: 'Deploy to production', description: 'Configure hosting and CI/CD', priority: 'high', estimatedHours: 6 }
    ]
  },
  {
    id: 'mobile-app',
    name: 'Cross-Platform Mobile App',
    description: 'Native mobile application for iOS and Android with offline support',
    category: 'mobile',
    icon: <Smartphone className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    estimatedDuration: '8-10 weeks',
    difficulty: 'advanced',
    techStack: ['React Native', 'Firebase', 'TypeScript', 'Redux'],
    isPopular: true,
    tasks: [
      { title: 'Initialize React Native project', description: 'Set up project with navigation', priority: 'high', estimatedHours: 4 },
      { title: 'Design app screens', description: 'Create UI components and layouts', priority: 'high', estimatedHours: 16 },
      { title: 'Implement authentication', description: 'Firebase auth integration', priority: 'high', estimatedHours: 8 },
      { title: 'Add offline storage', description: 'Implement local database with AsyncStorage', priority: 'medium', estimatedHours: 8 },
      { title: 'Create API integration', description: 'Connect to backend services', priority: 'high', estimatedHours: 10 },
      { title: 'Add push notifications', description: 'Firebase Cloud Messaging setup', priority: 'medium', estimatedHours: 6 },
      { title: 'Test on devices', description: 'Test iOS and Android builds', priority: 'high', estimatedHours: 8 },
      { title: 'Submit to app stores', description: 'Prepare and submit to stores', priority: 'high', estimatedHours: 6 }
    ]
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio Website',
    description: 'Modern portfolio website with blog and project showcase',
    category: 'web',
    icon: <Palette className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
    estimatedDuration: '2-3 weeks',
    difficulty: 'beginner',
    techStack: ['Next.js', 'Tailwind CSS', 'MDX', 'Vercel'],
    isPopular: true,
    tasks: [
      { title: 'Set up Next.js project', description: 'Initialize with TypeScript', priority: 'high', estimatedHours: 2 },
      { title: 'Design homepage', description: 'Hero section and about', priority: 'high', estimatedHours: 6 },
      { title: 'Create projects showcase', description: 'Project grid with filtering', priority: 'high', estimatedHours: 8 },
      { title: 'Build blog system', description: 'MDX blog with CMS', priority: 'medium', estimatedHours: 8 },
      { title: 'Add contact form', description: 'Email integration', priority: 'medium', estimatedHours: 4 },
      { title: 'Implement dark mode', description: 'Theme switcher', priority: 'low', estimatedHours: 3 },
      { title: 'Optimize SEO', description: 'Meta tags and sitemap', priority: 'medium', estimatedHours: 3 },
      { title: 'Deploy to Vercel', description: 'Production deployment', priority: 'high', estimatedHours: 2 }
    ]
  },
  {
    id: 'rest-api',
    name: 'RESTful API Service',
    description: 'Backend API with authentication, database, and documentation',
    category: 'backend',
    icon: <Database className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    estimatedDuration: '4-5 weeks',
    difficulty: 'intermediate',
    techStack: ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'Swagger'],
    tasks: [
      { title: 'Set up Express server', description: 'Initialize with middleware', priority: 'high', estimatedHours: 3 },
      { title: 'Design database schema', description: 'Create tables and relationships', priority: 'high', estimatedHours: 6 },
      { title: 'Implement auth endpoints', description: 'Register, login, refresh tokens', priority: 'high', estimatedHours: 8 },
      { title: 'Create CRUD endpoints', description: 'RESTful routes for resources', priority: 'high', estimatedHours: 12 },
      { title: 'Add validation middleware', description: 'Request validation', priority: 'medium', estimatedHours: 4 },
      { title: 'Write API documentation', description: 'Swagger/OpenAPI spec', priority: 'medium', estimatedHours: 6 },
      { title: 'Implement rate limiting', description: 'Protect against abuse', priority: 'medium', estimatedHours: 3 },
      { title: 'Add logging and monitoring', description: 'Error tracking', priority: 'medium', estimatedHours: 4 },
      { title: 'Write unit tests', description: 'Test coverage for endpoints', priority: 'high', estimatedHours: 8 }
    ]
  },
  {
    id: 'ml-project',
    name: 'Machine Learning Project',
    description: 'End-to-end ML pipeline with model training and deployment',
    category: 'ai-ml',
    icon: <Brain className="w-5 h-5" />,
    color: 'from-violet-500 to-purple-500',
    estimatedDuration: '6-8 weeks',
    difficulty: 'advanced',
    techStack: ['Python', 'TensorFlow', 'FastAPI', 'Docker', 'Scikit-learn'],
    tasks: [
      { title: 'Data collection and cleaning', description: 'Gather and prepare dataset', priority: 'high', estimatedHours: 12 },
      { title: 'Exploratory data analysis', description: 'Analyze and visualize data', priority: 'high', estimatedHours: 8 },
      { title: 'Feature engineering', description: 'Create and select features', priority: 'high', estimatedHours: 10 },
      { title: 'Train baseline model', description: 'Initial model training', priority: 'high', estimatedHours: 8 },
      { title: 'Hyperparameter tuning', description: 'Optimize model performance', priority: 'medium', estimatedHours: 12 },
      { title: 'Create API endpoint', description: 'FastAPI for predictions', priority: 'high', estimatedHours: 6 },
      { title: 'Containerize application', description: 'Docker setup', priority: 'medium', estimatedHours: 4 },
      { title: 'Deploy model', description: 'Cloud deployment', priority: 'high', estimatedHours: 6 }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Platform',
    description: 'Online store with cart, checkout, and admin panel',
    category: 'web',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'from-pink-500 to-rose-500',
    estimatedDuration: '8-10 weeks',
    difficulty: 'advanced',
    techStack: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux'],
    isPopular: true,
    tasks: [
      { title: 'Set up project structure', description: 'Frontend and backend setup', priority: 'high', estimatedHours: 4 },
      { title: 'Design product catalog', description: 'Product listing and details', priority: 'high', estimatedHours: 10 },
      { title: 'Implement shopping cart', description: 'Add to cart functionality', priority: 'high', estimatedHours: 8 },
      { title: 'Build checkout flow', description: 'Multi-step checkout process', priority: 'high', estimatedHours: 12 },
      { title: 'Integrate payments', description: 'Stripe payment processing', priority: 'high', estimatedHours: 10 },
      { title: 'Create admin panel', description: 'Product and order management', priority: 'high', estimatedHours: 16 },
      { title: 'Add search and filters', description: 'Product search functionality', priority: 'medium', estimatedHours: 8 },
      { title: 'Implement user reviews', description: 'Product rating system', priority: 'medium', estimatedHours: 6 }
    ]
  },
  {
    id: 'chat-app',
    name: 'Real-time Chat Application',
    description: 'Messaging app with real-time updates and file sharing',
    category: 'web',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-500',
    estimatedDuration: '5-6 weeks',
    difficulty: 'intermediate',
    techStack: ['React', 'Socket.io', 'Node.js', 'MongoDB', 'WebRTC'],
    tasks: [
      { title: 'Set up WebSocket server', description: 'Socket.io configuration', priority: 'high', estimatedHours: 6 },
      { title: 'Build chat UI', description: 'Message interface', priority: 'high', estimatedHours: 10 },
      { title: 'Implement authentication', description: 'User login system', priority: 'high', estimatedHours: 6 },
      { title: 'Add real-time messaging', description: 'Send and receive messages', priority: 'high', estimatedHours: 12 },
      { title: 'Create group chats', description: 'Multi-user conversations', priority: 'medium', estimatedHours: 8 },
      { title: 'Add file sharing', description: 'Upload and share files', priority: 'medium', estimatedHours: 8 },
      { title: 'Implement typing indicators', description: 'Real-time status updates', priority: 'low', estimatedHours: 4 },
      { title: 'Add video calls', description: 'WebRTC video chat', priority: 'medium', estimatedHours: 12 }
    ]
  },
  {
    id: 'task-manager',
    name: 'Task Management Tool',
    description: 'Kanban-style task manager with team collaboration',
    category: 'productivity',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'from-indigo-500 to-blue-500',
    estimatedDuration: '4-6 weeks',
    difficulty: 'intermediate',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'TailwindCSS'],
    tasks: [
      { title: 'Create board layout', description: 'Kanban board structure', priority: 'high', estimatedHours: 8 },
      { title: 'Implement drag-and-drop', description: 'Task movement functionality', priority: 'high', estimatedHours: 8 },
      { title: 'Add task creation', description: 'Task forms and validation', priority: 'high', estimatedHours: 6 },
      { title: 'Build team features', description: 'User invitations and roles', priority: 'medium', estimatedHours: 10 },
      { title: 'Add comments and attachments', description: 'Task collaboration', priority: 'medium', estimatedHours: 8 },
      { title: 'Create activity timeline', description: 'Track changes', priority: 'low', estimatedHours: 6 },
      { title: 'Implement notifications', description: 'Email and in-app alerts', priority: 'medium', estimatedHours: 6 }
    ]
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: <Layout className="w-4 h-4" /> },
  { id: 'web', label: 'Web Apps', icon: <Globe className="w-4 h-4" /> },
  { id: 'mobile', label: 'Mobile Apps', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'backend', label: 'Backend', icon: <Database className="w-4 h-4" /> },
  { id: 'ai-ml', label: 'AI/ML', icon: <Brain className="w-4 h-4" /> },
  { id: 'productivity', label: 'Productivity', icon: <CheckCircle2 className="w-4 h-4" /> }
];

interface ProjectTemplatesLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export default function ProjectTemplatesLibrary({
  isOpen,
  onClose,
  onSelectTemplate
}: ProjectTemplatesLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredTemplates = PROJECT_TEMPLATES.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const popularTemplates = PROJECT_TEMPLATES.filter(t => t.isPopular);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Project Templates</DialogTitle>
          <DialogDescription>
            Choose a template to quickly set up your project with pre-configured tasks and structure
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, technology, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  {category.icon}
                  {category.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty('all')}
              >
                All Levels
              </Button>
              <Button
                variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty('beginner')}
              >
                Beginner
              </Button>
              <Button
                variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty('intermediate')}
              >
                Intermediate
              </Button>
              <Button
                variant={selectedDifficulty === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty('advanced')}
              >
                Advanced
              </Button>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Popular Templates */}
            {selectedCategory === 'all' && searchQuery === '' && selectedDifficulty === 'all' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <h3 className="font-semibold">Popular Templates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={onSelectTemplate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            <div>
              {(selectedCategory !== 'all' || searchQuery !== '' || selectedDifficulty !== 'all') && (
                <h3 className="font-semibold mb-4">
                  {filteredTemplates.length} Template{filteredTemplates.length !== 1 ? 's' : ''} Found
                </h3>
              )}
              {filteredTemplates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold mb-2">No templates found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={onSelectTemplate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({ 
  template, 
  onSelect 
}: { 
  template: ProjectTemplate; 
  onSelect: (template: ProjectTemplate) => void;
}) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="hover:border-blue-300 transition-all cursor-pointer group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center text-white`}>
              {template.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.isPopular && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
            {template.difficulty}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            {template.estimatedDuration}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {template.tasks.length} tasks
          </Badge>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Tech Stack:</p>
          <div className="flex flex-wrap gap-1">
            {template.techStack.map((tech, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          className="w-full group-hover:bg-primary/90"
          onClick={() => onSelect(template)}
        >
          <Rocket className="w-4 h-4 mr-2" />
          Use This Template
        </Button>
      </CardContent>
    </Card>
  );
}

export { PROJECT_TEMPLATES };
export type { ProjectTemplate };
