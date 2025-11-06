/**
 * Minimal Resource View - Clean resource management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Upload,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  ExternalLink,
  Trash2,
  Search,
  Plus,
  FolderOpen,
  Paperclip
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Resource {
  id: string;
  name: string;
  type: 'file' | 'link';
  url?: string;
  size?: number;
  fileType?: string;
  uploadedAt: string;
}

interface MinimalResourceViewProps {
  projectId: string;
}

export default function MinimalResourceView({ projectId }: MinimalResourceViewProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Load resources from localStorage
  useEffect(() => {
    const loadResources = () => {
      try {
        const stored = localStorage.getItem(`project_resources_${projectId}`);
        if (stored) {
          setResources(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading resources:', error);
      }
    };
    loadResources();
  }, [projectId]);

  // Save resources to localStorage
  const saveResources = (updatedResources: Resource[]) => {
    try {
      localStorage.setItem(`project_resources_${projectId}`, JSON.stringify(updatedResources));
      setResources(updatedResources);
    } catch (error) {
      console.error('Error saving resources:', error);
      toast.error('Failed to save resource');
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newResources: Resource[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            const resource: Resource = {
              id: `file_${Date.now()}_${i}`,
              name: file.name,
              type: 'file',
              url: reader.result as string,
              size: file.size,
              fileType: file.type,
              uploadedAt: new Date().toISOString()
            };
            newResources.push(resource);
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      saveResources([...resources, ...newResources]);
      toast.success(`${newResources.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle link addition
  const handleAddLink = () => {
    const url = prompt('Enter URL:');
    if (!url) return;

    const name = prompt('Enter link name:') || url;

    const newResource: Resource = {
      id: `link_${Date.now()}`,
      name,
      type: 'link',
      url,
      uploadedAt: new Date().toISOString()
    };

    saveResources([...resources, newResource]);
    toast.success('Link added successfully');
  };

  // Delete resource
  const handleDelete = (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    const updated = resources.filter(r => r.id !== resourceId);
    saveResources(updated);
    toast.success('Resource deleted');
  };

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'files' && resource.type === 'file') ||
      (activeTab === 'links' && resource.type === 'link');
    return matchesSearch && matchesTab;
  });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-5 h-5" />;
    
    if (fileType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (fileType.startsWith('text/') || fileType.includes('document')) return <FileText className="w-5 h-5 text-green-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const fileResources = resources.filter(r => r.type === 'file');
  const linkResources = resources.filter(r => r.type === 'link');

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
                <p className="text-sm text-gray-500">Total Resources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{fileResources.length}</p>
                <p className="text-sm text-gray-500">Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{linkResources.length}</p>
                <p className="text-sm text-gray-500">Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 bg-gray-50"
              />
            </div>
            
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>

            <Button size="sm" onClick={handleAddLink} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-white p-1 shadow-sm border">
          <TabsTrigger value="all" className="data-[state=active]:bg-gray-100">
            All ({resources.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-gray-100">
            Files ({fileResources.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-gray-100">
            Links ({linkResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredResources.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No resources yet</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Upload files or add links to get started
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </Button>
                  <Button onClick={handleAddLink} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        resource.type === 'link' ? 'bg-purple-50' : 'bg-blue-50'
                      }`}>
                        {resource.type === 'link' ? (
                          <LinkIcon className="w-5 h-5 text-purple-600" />
                        ) : (
                          getFileIcon(resource.fileType)
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                          {resource.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="secondary" className="text-xs">
                            {resource.type}
                          </Badge>
                          {resource.size && (
                            <span>{formatFileSize(resource.size)}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(resource.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      {resource.type === 'link' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = resource.url || '';
                            link.download = resource.name;
                            link.click();
                          }}
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
