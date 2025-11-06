/**
 * Project Edit Modal
 * Complete project information editing
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner@2.0.3';
import { X, Calendar as CalendarIcon, Plus, Tag as TagIcon } from 'lucide-react';
import { Project } from '../types/database';
import { format } from 'date-fns';

interface ProjectEditModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Project>) => Promise<void>;
}

const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'Desktop App',
  'Game Development',
  'Machine Learning',
  'Data Science',
  'DevOps',
  'Other'
];

const TECH_STACK_OPTIONS = [
  // Frontend
  'React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'TypeScript', 'JavaScript',
  // Backend
  'Node.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Express', 'NestJS',
  'Java', 'Spring Boot', 'Go', 'Rust', 'PHP', 'Laravel',
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic',
  // Database
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Firebase', 'Supabase',
  // Cloud/DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Vercel', 'Netlify',
  // Other
  'TensorFlow', 'PyTorch', 'GraphQL', 'REST API', 'WebSocket'
];

export default function ProjectEditModal({
  project,
  isOpen,
  onClose,
  onSave
}: ProjectEditModalProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    category: project.category || '',
    status: project.status,
    priority: project.priority || 'medium',
    techStack: project.tech_stack || [],
    tags: project.tags || [],
    githubUrl: project.githubUrl || '',
    liveUrl: project.liveUrl || '',
    startDate: project.startDate ? new Date(project.startDate) : undefined,
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    targetAudience: project.targetAudience || '',
    projectGoals: project.projectGoals || '',
    isPublic: project.isPublic ?? true
  });

  const [newTag, setNewTag] = useState('');
  const [newTech, setNewTech] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Reset form when project changes
    setFormData({
      title: project.title,
      description: project.description || '',
      category: project.category || '',
      status: project.status,
      priority: project.priority || 'medium',
      techStack: project.tech_stack || [],
      tags: project.tags || [],
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      startDate: project.startDate ? new Date(project.startDate) : undefined,
      endDate: project.endDate ? new Date(project.endDate) : undefined,
      targetAudience: project.targetAudience || '',
      projectGoals: project.projectGoals || '',
      isPublic: project.isPublic ?? true
    });
  }, [project]);

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddTech = (tech: string) => {
    if (!formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Project title is required');
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<Project> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        status: formData.status,
        priority: formData.priority,
        tech_stack: formData.techStack,
        tags: formData.tags,
        githubUrl: formData.githubUrl.trim(),
        liveUrl: formData.liveUrl.trim(),
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        targetAudience: formData.targetAudience.trim(),
        projectGoals: formData.projectGoals.trim(),
        isPublic: formData.isPublic,
        updatedAt: new Date().toISOString()
      };

      await onSave(updates);
      toast.success('Project updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project information, tech stack, and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Basic Information</h3>
            
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="mt-1">
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

          {/* Tech Stack */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Tech Stack</h3>
            
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map(tech => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <button
                    onClick={() => handleRemoveTech(tech)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <Select onValueChange={handleAddTech}>
              <SelectTrigger>
                <SelectValue placeholder="Add technology..." />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {TECH_STACK_OPTIONS
                  .filter(tech => !formData.techStack.includes(tech))
                  .map(tech => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Tags</h3>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="outline" className="gap-1">
                  <TagIcon className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Links</h3>
            
            <div>
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input
                id="liveUrl"
                value={formData.liveUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Timeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Additional Details</h3>
            
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Who is this project for?"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="projectGoals">Project Goals</Label>
              <Textarea
                id="projectGoals"
                value={formData.projectGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, projectGoals: e.target.value }))}
                placeholder="What are the main goals of this project?"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked as boolean }))}
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Make this project public in the community showcase
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
