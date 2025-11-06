import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import ProjectImageUpload from './ProjectImageUpload';
import { 
  Zap, 
  X, 
  Sparkles,
  Code,
  Globe,
  Smartphone,
  Database,
  Check,
  Brain,
  Gamepad2,
  Package,
  Palette,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';

interface QuickProjectCreatorProps {
  onSubmit: (projectData: any) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  onUseFullWizard: () => void;
}

const PROJECT_CATEGORIES = [
  { value: 'Web Application', label: 'Web Application', icon: Globe },
  { value: 'Mobile App', label: 'Mobile App', icon: Smartphone },
  { value: 'API/Backend', label: 'API/Backend', icon: Database },
  { value: 'AI/ML Project', label: 'AI/ML Project', icon: Brain },
  { value: 'Library/Package', label: 'Library/Package', icon: Package },
  { value: 'Game', label: 'Game', icon: Gamepad2 },
  { value: 'Design System', label: 'Design System', icon: Palette },
  { value: 'Other', label: 'Other', icon: Code }
];

const POPULAR_TECH = [
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Language' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Express', category: 'Backend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Django', category: 'Backend' },
  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Other', category: 'Custom' }
];

export default function QuickProjectCreator({ 
  onSubmit, 
  onCancel,
  onUseFullWizard 
}: QuickProjectCreatorProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    techStack: [] as string[],
    customTech: '',
    status: 'planning' as const,
    startDate: new Date().toISOString().split('T')[0],
    isPublic: true,
    coverImage: null as string | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showTechInput, setShowTechInput] = useState(false);
  const [newTechInput, setNewTechInput] = useState('');

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value, customCategory: '' }));
    setShowCustomCategory(value === 'Other');
  };

  const handleTechSelect = (tech: string) => {
    if (tech === 'Other') {
      setShowTechInput(true);
      return;
    }
    
    if (!formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
  };

  const addCustomTech = () => {
    if (newTechInput.trim() && !formData.techStack.includes(newTechInput.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, newTechInput.trim()]
      }));
      setNewTechInput('');
      setShowTechInput(false);
    }
  };

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      setError('Please specify your custom category');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;

    const result = await onSubmit({
      ...formData,
      category: finalCategory,
      progress: 0,
      goals: [],
      images: formData.coverImage ? [formData.coverImage] : []
    });

    if (!result.success && result.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Quick Create</h2>
                <p className="text-sm text-slate-600">Get started in seconds</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-slate-900 mb-2">
                Project Name *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., My Awesome App"
                className="h-12 text-base"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-slate-900 mb-2">
                Quick Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does it do?"
                rows={3}
                className="text-base resize-none"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <Label htmlFor="category" className="text-sm font-semibold text-slate-900 mb-2">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Custom Category Input */}
              {showCustomCategory && (
                <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                  <Input
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    placeholder="Enter your custom category"
                    className="h-11"
                  />
                </div>
              )}
            </div>

            {/* Tech Stack Dropdown */}
            <div>
              <Label htmlFor="techStack" className="text-sm font-semibold text-slate-900 mb-2">
                Tech Stack (Optional)
              </Label>
              <Select value="" onValueChange={handleTechSelect}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select technologies" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {/* Group by category */}
                  {Array.from(new Set(POPULAR_TECH.map(t => t.category))).map(category => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {category}
                      </div>
                      {POPULAR_TECH.filter(t => t.category === category).map(tech => (
                        <SelectItem 
                          key={tech.name} 
                          value={tech.name}
                          disabled={formData.techStack.includes(tech.name) && tech.name !== 'Other'}
                        >
                          <div className="flex items-center gap-2">
                            <span>{tech.name}</span>
                            {formData.techStack.includes(tech.name) && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>

              {/* Custom Tech Input */}
              {showTechInput && (
                <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2">
                    <Input
                      value={newTechInput}
                      onChange={(e) => setNewTechInput(e.target.value)}
                      placeholder="Enter technology name"
                      className="h-11"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomTech();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addCustomTech}
                      size="sm"
                      className="h-11 px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowTechInput(false);
                        setNewTechInput('');
                      }}
                      size="sm"
                      className="h-11 px-4"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected Tech Stack */}
              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-1.5"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Project Cover Image */}
            <div className="pt-2">
              <ProjectImageUpload
                currentImage={formData.coverImage || undefined}
                onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, coverImage: imageUrl }))}
                maxSize={5 * 1024 * 1024}
                aspectRatio="16:9"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={onUseFullWizard}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Use Full Wizard
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
