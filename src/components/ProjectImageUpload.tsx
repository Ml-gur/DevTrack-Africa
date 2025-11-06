import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { 
  fileStorageDB, 
  compressImage, 
  createThumbnail,
  formatFileSize 
} from '../utils/indexeddb-file-storage';

interface ProjectImageUploadProps {
  projectId?: string;
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  maxSize?: number; // Max file size in bytes (default: 5MB)
  aspectRatio?: string; // e.g., "16:9", "4:3", "1:1"
}

export default function ProjectImageUpload({ 
  projectId,
  currentImage, 
  onImageChange,
  maxSize = 5 * 1024 * 1024, // 5MB default
  aspectRatio = '16:9'
}: ProjectImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`Image size must be less than ${formatFileSize(maxSize)}`);
      return;
    }

    setIsUploading(true);

    try {
      // Compress image if it's large
      let imageBlob: Blob = file;
      if (file.size > 1024 * 1024) { // Compress if > 1MB
        imageBlob = await compressImage(file, 1920, 0.85);
      }

      // Create a small thumbnail for preview (max 200KB)
      const smallThumbnail = await createThumbnail(file, 300, 0.7);
      
      // Create preview URL from small thumbnail
      setPreviewUrl(smallThumbnail);
      
      // IMPORTANT: Only store the thumbnail URL reference, NOT the full image
      // This prevents localStorage quota issues
      const imageId = `project-image-${projectId || 'temp'}-${Date.now()}`;
      onImageChange(imageId); // Pass image ID instead of data URL

      // If projectId is provided, save full image to IndexedDB
      if (projectId) {
        const storedFile = {
          id: imageId,
          projectId: projectId,
          name: file.name,
          size: imageBlob.size,
          type: file.type,
          category: 'image' as const,
          tags: ['project-image', 'cover'],
          version: 1,
          blob: imageBlob,
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedBy: 'current-user',
          thumbnailUrl: smallThumbnail
        };

        await fileStorageDB.saveFile(storedFile);
        console.log('✅ Image saved to IndexedDB. Thumbnail size:', (smallThumbnail.length / 1024).toFixed(2), 'KB');
      }

      setUploadedFile(file);
      setError(null);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setPreviewUrl(null);
      onImageChange(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadedFile(null);
    setError(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">
        Project Cover Image
        <span className="text-muted-foreground font-normal ml-2">
          (Optional - {aspectRatio} recommended)
        </span>
      </Label>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview or Upload Area */}
      {previewUrl ? (
        <Card className="relative overflow-hidden border-2 border-border">
          <div className={`relative w-full ${getAspectRatioClass()} bg-muted`}>
            <img 
              src={previewUrl} 
              alt="Project cover" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>

            {/* Upload indicator */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm">Processing image...</p>
                </div>
              </div>
            )}

            {/* Success indicator */}
            {uploadedFile && !isUploading && (
              <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* File info */}
          {uploadedFile && (
            <div className="p-3 bg-muted/50 border-t text-xs text-muted-foreground">
              <span className="font-medium">{uploadedFile.name}</span>
              <span className="mx-2">•</span>
              <span>{formatFileSize(uploadedFile.size)}</span>
            </div>
          )}
        </Card>
      ) : (
        <Card 
          className={`relative ${getAspectRatioClass()} border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/20`}
          onClick={handleUploadClick}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Processing image...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Click to upload project image</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, GIF, WebP up to {formatFileSize(maxSize)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: {aspectRatio} aspect ratio
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
