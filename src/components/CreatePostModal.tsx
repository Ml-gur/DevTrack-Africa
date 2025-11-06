import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  Upload, 
  X, 
  Eye, 
  Camera,
  FileText,
  Hash,
  Lightbulb,
  Target
} from 'lucide-react';
import { Post, PostAttachment } from '../types/social';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreatePostModalProps {
  userId: string;
  projectId?: string;
  taskId?: string;
  prefilledData?: {
    postType?: Post['postType'];
    content?: string;
    tags?: string[];
  };
  onSubmit: (postData: CreatePostFormData) => Promise<void>;
  onClose: () => void;
}

export interface CreatePostFormData {
  postType: Post['postType'];
  content: string;
  reflectionNotes: string;
  attachments: Omit<PostAttachment, 'id' | 'postId'>[];
  tags: string[];
}

const POST_TYPES = [
  {
    type: 'progress_update' as const,
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Progress Update',
    description: 'Share your current development progress',
    color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    examples: [
      'Implemented user authentication system',
      'Built responsive navigation component',
      'Added dark mode support to the app'
    ]
  },
  {
    type: 'task_completed' as const,
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: 'Task Completed',
    description: 'Celebrate completing a specific task',
    color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    examples: [
      'Fixed critical bug in payment flow',
      'Completed user registration feature',
      'Deployed app to production server'
    ]
  },
  {
    type: 'help_request' as const,
    icon: <HelpCircle className="w-5 h-5" />,
    label: 'Help Request',
    description: 'Ask the community for help or advice',
    color: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
    examples: [
      'Struggling with React state management',
      'Need advice on database schema design',
      'How to handle file uploads in Node.js?'
    ]
  }
];

const REFLECTION_PROMPTS = {
  progress_update: [
    'What challenges did you overcome today?',
    'What new skills or concepts did you learn?',
    'How does this progress move your project forward?'
  ],
  task_completed: [
    'What was the most difficult part of this task?',
    'What would you do differently next time?',
    'What did you learn while completing this task?'
  ],
  help_request: [
    'What have you already tried to solve this?',
    'What specific outcome are you trying to achieve?',
    'What resources have you consulted so far?'
  ]
};

export default function CreatePostModal({ 
  userId, 
  projectId, 
  taskId,
  prefilledData,
  onSubmit, 
  onClose 
}: CreatePostModalProps) {
  const [formData, setFormData] = useState<CreatePostFormData>({
    postType: prefilledData?.postType || 'progress_update',
    content: prefilledData?.content || '',
    reflectionNotes: '',
    attachments: [],
    tags: prefilledData?.tags || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const selectedPostType = POST_TYPES.find(type => type.type === formData.postType);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Post content is required';
    } else if (formData.content.length > 500) {
      newErrors.content = 'Content must be less than 500 characters';
    }

    if (!formData.reflectionNotes.trim()) {
      newErrors.reflectionNotes = 'Reflection notes are required';
    } else if (formData.reflectionNotes.length < 50) {
      newErrors.reflectionNotes = 'Reflection notes must be at least 50 characters';
    } else if (formData.reflectionNotes.length > 1000) {
      newErrors.reflectionNotes = 'Reflection notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('🚀 CreatePostModal: Form submission started');
    
    if (!validateForm()) {
      console.log('❌ CreatePostModal: Validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 CreatePostModal: Calling onSubmit with data:', formData);
      await onSubmit(formData);
      console.log('✅ CreatePostModal: Post submission successful, closing modal');
      onClose();
    } catch (error) {
      console.error('❌ CreatePostModal: Error creating post:', error);
      setErrors({ submit: 'Failed to create post. Please try again.' });
    } finally {
      setIsSubmitting(false);
      console.log('🏁 CreatePostModal: Form submission completed');
    }
  };

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newAttachment: Omit<PostAttachment, 'id' | 'postId'> = {
            fileUrl: e.target?.result as string,
            fileType: 'image',
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString()
          };
          
          setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, newAttachment]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 8) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: keyof CreatePostFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getCharacterCount = (text: string, max: number) => {
    const color = text.length > max * 0.9 ? 'text-red-500' : 
                  text.length > max * 0.7 ? 'text-yellow-500' : 
                  'text-muted-foreground';
    return (
      <span className={`text-xs ${color}`}>
        {text.length}/{max}
      </span>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Progress</DialogTitle>
          <DialogDescription>
            Share your development journey with the DevTrack Africa community
          </DialogDescription>
        </DialogHeader>

        <Tabs value={showPreview ? 'preview' : 'create'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" onClick={() => setShowPreview(false)}>
              Create Post
            </TabsTrigger>
            <TabsTrigger value="preview" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Post Type Selection */}
              <div className="space-y-3">
                <Label>Post Type *</Label>
                <div className="grid grid-cols-1 gap-3">
                  {POST_TYPES.map(type => (
                    <Card 
                      key={type.type}
                      className={`cursor-pointer transition-all border-2 ${
                        formData.postType === type.type 
                          ? 'ring-2 ring-primary ring-offset-2 border-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleInputChange('postType', type.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${type.color}`}>
                            {type.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {type.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {type.examples.slice(0, 2).map((example, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {example}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  What did you accomplish? *
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder={`e.g., ${selectedPostType?.examples[0] || 'Share your progress...'}`}
                  rows={3}
                  className={errors.content ? 'border-destructive' : ''}
                />
                <div className="flex justify-between items-center">
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content}</p>
                  )}
                  <div className="ml-auto">
                    {getCharacterCount(formData.content, 500)}
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Add Images (Optional)</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Drag & drop images here</p>
                      <p className="text-sm text-muted-foreground">or click to select files</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files) handleFileUpload(files);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Uploaded Images */}
                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="relative group">
                        <ImageWithFallback
                          src={attachment.fileUrl}
                          alt={attachment.fileName}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reflection Notes */}
              <div className="space-y-2">
                <Label htmlFor="reflectionNotes">
                  Reflection Notes *
                  <Badge variant="secondary" className="ml-2">
                    Learning Required
                  </Badge>
                </Label>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Reflection Prompts:</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        {REFLECTION_PROMPTS[formData.postType].map((prompt, index) => (
                          <li key={index}>• {prompt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <Textarea
                  id="reflectionNotes"
                  value={formData.reflectionNotes}
                  onChange={(e) => handleInputChange('reflectionNotes', e.target.value)}
                  placeholder="Share what you learned, challenges you faced, or insights you gained..."
                  rows={4}
                  className={errors.reflectionNotes ? 'border-destructive' : ''}
                />
                <div className="flex justify-between items-center">
                  {errors.reflectionNotes && (
                    <p className="text-sm text-destructive">{errors.reflectionNotes}</p>
                  )}
                  <div className="ml-auto">
                    {getCharacterCount(formData.reflectionNotes, 1000)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters required to encourage thoughtful reflection
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g., react, authentication"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-destructive/20 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Add up to 8 tags to help others discover your post
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.content.trim() || !formData.reflectionNotes.trim()}
                >
                  {isSubmitting ? 'Sharing...' : 'Share Progress'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {/* Preview would render a PostCard component with the current form data */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-center text-muted-foreground">
                Post preview would appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}