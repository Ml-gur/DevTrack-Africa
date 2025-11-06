import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, Plus, Code2, Globe, Github, Eye, EyeOff } from 'lucide-react';
import { Project, ProjectStatus, ProjectCategory } from '../types/project';
import { CategorySelector, TechStackSelector } from './ImprovedCategoryTechInput';
import ProjectImageUpload from './ProjectImageUpload';

interface MinimalProjectCreatorProps {
  project?: Project;
  onSubmit: (projectData: Omit<Project, 'id' | 'userId' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MinimalProjectCreator({ 
  project, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: MinimalProjectCreatorProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'web-app' as ProjectCategory | string,
    status: project?.status || 'planning' as ProjectStatus,
    techStack: project?.techStack || [],
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    isPublic: project?.isPublic ?? true,
    imageUrl: project?.images?.[0] || null // Changed to single image for simplicity
  });

  const [error, setError] = useState<string | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.imageUrl && typeof formData.imageUrl === 'string' && formData.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.imageUrl);
      }
    };
  }, []);

  const addTechStack = (tech: string) => {
    if (!formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Project description is required');
      return;
    }

    const submitData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      techStack: formData.techStack,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      images: formData.imageUrl ? [formData.imageUrl] : [],
      isPublic: formData.isPublic,
      progress: 0
    };

    const result = await onSubmit(submitData as any);
    
    if (!result.success) {
      setError(result.error || 'Failed to save project');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header - Simple & Beautiful */}
        <div className="mb-10 text-center">
          <div className="text-3xl text-foreground mb-3">
            {project ? 'Edit Your Project' : 'Create New Project'}
          </div>
          <p className="text-muted-foreground text-lg">
            {project ? 'Update your project details' : 'Share your development journey with the community'}
          </p>
        </div>

        {/* Form Card - Clean & Minimal */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* Project Title - Larger, more prominent */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-foreground text-base">
                Project Name *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Task Manager App, E-commerce API..."
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
                required
              />
            </div>

            {/* Description - Better placeholder */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-foreground text-base">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell us about your project - what problem does it solve, who is it for, and what makes it special?"
                rows={4}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground resize-none text-base"
                required
              />
            </div>

            {/* Section Divider */}
            <div className="border-t border-border my-8" />

            {/* Category & Tech Stack Section */}
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                Help others discover your project
              </div>
              
              {/* Category */}
              <CategorySelector
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                allowCustom={true}
              />

              {/* Tech Stack */}
              <TechStackSelector
                selectedTech={formData.techStack}
                onAdd={addTechStack}
                onRemove={removeTechStack}
              />
            </div>

            {/* Section Divider */}
            <div className="border-t border-border my-8" />

            {/* Image Upload Section */}
            <ProjectImageUpload
              projectId={project?.id}
              currentImage={formData.imageUrl || undefined}
              onImageChange={handleImageChange}
              maxSize={5 * 1024 * 1024}
              aspectRatio="16:9"
            />

            {/* Section Divider */}
            <div className="border-t border-border my-8" />

            {/* Links Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-foreground text-base mb-1">
                  Project Links
                </Label>
                <p className="text-sm text-muted-foreground">
                  Share your code and live demo (optional)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-foreground flex items-center space-x-2 text-sm">
                    <Github className="w-4 h-4" />
                    <span>GitHub Repository</span>
                  </Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liveUrl" className="text-foreground flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4" />
                    <span>Live Demo</span>
                  </Label>
                  <Input
                    id="liveUrl"
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                    placeholder="https://your-demo.com"
                    className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Section Divider */}
            <div className="border-t border-border my-8" />

            {/* Visibility Toggle - More prominent */}
            <div className="space-y-2">
              <Label className="text-foreground text-base mb-2">
                Visibility
              </Label>
              <div className="flex items-center justify-between p-5 border-2 border-border rounded-xl bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    formData.isPublic ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {formData.isPublic ? (
                      <Eye className="w-6 h-6 text-primary" />
                    ) : (
                      <EyeOff className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-base">
                      {formData.isPublic ? 'Public Project' : 'Private Project'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formData.isPublic 
                        ? 'Anyone can view your project in the community' 
                        : 'Only you can see this project'
                      }
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    formData.isPublic ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transform ring-0 transition duration-200 ease-in-out ${
                      formData.isPublic ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Actions - More prominent buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-8 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="border-border text-muted-foreground hover:text-foreground h-11 px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>{project ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  <>
                    <Code2 className="w-5 h-5 mr-2" />
                    {project ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer hint */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {project ? 'Changes will be saved immediately' : 'Your project will be created and you can start tracking tasks right away'}
        </div>
      </div>
    </div>
  );
}