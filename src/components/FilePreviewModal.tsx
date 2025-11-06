import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Download,
  X,
  Edit,
  Save,
  Tag,
  Folder,
  Calendar,
  HardDrive,
  User,
  Star,
  Share2,
  Plus
} from 'lucide-react';
import { FileMetadata, fileStorageDB, formatFileSize } from '../utils/indexeddb-file-storage';

interface FilePreviewModalProps {
  file: FileMetadata;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  onUpdate?: (fileId: string, updates: Partial<FileMetadata>) => void;
  isFavorite: boolean;
  onToggleFavorite: (fileId: string) => void;
}

export default function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onUpdate,
  isFavorite,
  onToggleFavorite
}: FilePreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(file.description || '');
  const [tags, setTags] = useState<string[]>(file.tags || []);
  const [newTag, setNewTag] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file.category === 'image') {
      loadPreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, file.id]);

  const loadPreview = async () => {
    try {
      const fullFile = await fileStorageDB.getFile(file.id);
      if (fullFile) {
        const url = URL.createObjectURL(fullFile.blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
    }
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(file.id, {
        description,
        tags
      });
    }
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogDescription className="sr-only">
            Preview and manage file details, including tags, description, and download options.
          </DialogDescription>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl pr-8">{file.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(file.id)}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDownload(file.id)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {isEditing ? (
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Preview/Content */}
          <div className="lg:col-span-2">
            {file.category === 'image' && previewUrl ? (
              <div className="bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              </div>
            ) : file.category === 'document' && file.type === 'application/pdf' ? (
              <div className="bg-slate-100 rounded-lg p-8 text-center">
                <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold mb-2">PDF Document</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click download to view this PDF file
                </p>
                <Button onClick={() => onDownload(file.id)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download & View
                </Button>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-lg p-12 text-center">
                <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold mb-2">{file.type}</p>
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* File Info */}
            <div className="space-y-3">
              <h3 className="font-semibold">File Information</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{formatFileSize(file.size)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="font-medium">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">By:</span>
                  <span className="font-medium">{file.uploadedBy}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {file.category}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {file.description || 'No description'}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="h-8 text-sm"
                  />
                  <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Folder */}
            {file.folder && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Folder
                </Label>
                <Badge variant="secondary">{file.folder}</Badge>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onDownload(file.id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this file?')) {
                    onDelete(file.id);
                    onClose();
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Delete File
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
