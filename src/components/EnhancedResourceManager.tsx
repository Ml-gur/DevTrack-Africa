import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Upload,
  File,
  Image,
  FileText,
  Code,
  Archive,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  Grid3X3,
  List,
  FolderPlus,
  Tag,
  Edit,
  Share2,
  MoreVertical,
  Folder,
  Filter,
  SortAsc,
  Star,
  Clock,
  HardDrive,
  Plus,
  FileImage,
  FileCode,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import {
  fileStorageDB,
  StoredFile,
  FileMetadata,
  compressImage,
  createThumbnail,
  getFileCategory,
  formatFileSize,
  getStorageQuota
} from '../utils/indexeddb-file-storage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface EnhancedResourceManagerProps {
  projectId: string;
  currentUserId: string;
  maxFileSize?: number; // in MB
  maxTotalStorage?: number; // in MB
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';

export default function EnhancedResourceManager({
  projectId,
  currentUserId,
  maxFileSize = 25,
  maxTotalStorage = 500
}: EnhancedResourceManagerProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Dialogs
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Storage stats
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);

  // Load files and storage info
  useEffect(() => {
    loadFiles();
    updateStorageInfo();
    loadFavorites();
  }, [projectId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const projectFiles = await fileStorageDB.getProjectFiles(projectId);
      setFiles(projectFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const updateStorageInfo = async () => {
    try {
      const total = await fileStorageDB.getTotalSize(projectId);
      setStorageUsed(total);
      
      const quota = await getStorageQuota();
      setStorageQuota(quota.quota);
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  };

  const loadFavorites = () => {
    const stored = localStorage.getItem(`favorites_${projectId}`);
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  };

  const toggleFavorite = (fileId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      localStorage.setItem(`favorites_${projectId}`, JSON.stringify([...next]));
      return next;
    });
  };

  const validateFile = (file: File): string | null => {
    // Size check
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Storage quota check
    if (storageUsed + file.size > maxTotalStorage * 1024 * 1024) {
      return `Storage quota exceeded. Maximum ${maxTotalStorage}MB allowed.`;
    }

    return null;
  };

  const handleFileSelect = async (selectedFiles: FileList) => {
    setError(null);
    setSuccess(null);
    
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    let uploadedCount = 0;

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        // Simulate progress for UI
        setUploadProgress(((i / filesToUpload.length) * 100));
        
        let blob: Blob = file;
        let thumbnailUrl: string | undefined;

        // Compress images
        if (file.type.startsWith('image/')) {
          try {
            blob = await compressImage(file, 1920, 0.85);
            thumbnailUrl = await createThumbnail(file);
          } catch (error) {
            console.error('Image compression failed, using original:', error);
          }
        }

        const storedFile: StoredFile = {
          id: `file-${Date.now()}-${i}`,
          projectId,
          name: file.name,
          size: blob.size,
          type: file.type,
          category: getFileCategory(file.type, file.name),
          folder: selectedFolder === 'all' ? undefined : selectedFolder,
          tags: [],
          version: 1,
          blob,
          uploadedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedBy: currentUserId
        };

        await fileStorageDB.saveFile(storedFile);
        
        // Update thumbnail in metadata if available
        if (thumbnailUrl) {
          await fileStorageDB.updateFileMetadata(storedFile.id, { thumbnailUrl });
        }

        uploadedCount++;
      }

      setUploadProgress(100);
      setSuccess(`Successfully uploaded ${uploadedCount} file${uploadedCount > 1 ? 's' : ''}`);
      
      // Reload files and update storage
      await loadFiles();
      await updateStorageInfo();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setShowUploadModal(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) return;

    try {
      await fileStorageDB.deleteFile(fileId);
      setSuccess('File deleted successfully');
      await loadFiles();
      await updateStorageInfo();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete file');
    }
  };

  const downloadFile = async (fileId: string) => {
    try {
      const file = await fileStorageDB.getFile(fileId);
      if (!file) {
        setError('File not found');
        return;
      }

      const url = URL.createObjectURL(file.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file');
    }
  };

  const viewFile = async (fileId: string) => {
    try {
      const file = await fileStorageDB.getFile(fileId);
      if (!file) {
        setError('File not found');
        return;
      }

      const url = URL.createObjectURL(file.blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('View error:', error);
      setError('Failed to view file');
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  // Filter and sort files
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchQuery === '' ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;

    return matchesSearch && matchesFolder && matchesCategory;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });

  // Separate favorites
  const favoriteFiles = sortedFiles.filter(f => favorites.has(f.id));
  const regularFiles = sortedFiles.filter(f => !favorites.has(f.id));
  const displayFiles = [...favoriteFiles, ...regularFiles];

  // Get unique folders
  const folders = Array.from(new Set(files.map(f => f.folder).filter(Boolean)));

  // Statistics
  const stats = {
    total: files.length,
    images: files.filter(f => f.category === 'image').length,
    documents: files.filter(f => f.category === 'document').length,
    code: files.filter(f => f.category === 'code').length,
    archives: files.filter(f => f.category === 'archive').length,
    other: files.filter(f => f.category === 'other').length
  };

  const storagePercentage = storageQuota > 0
    ? (storageUsed / (maxTotalStorage * 1024 * 1024)) * 100
    : 0;

  const getFileIcon = (category: string, className: string = "w-5 h-5") => {
    switch (category) {
      case 'image': return <Image className={className} />;
      case 'document': return <FileText className={className} />;
      case 'code': return <Code className={className} />;
      case 'archive': return <Archive className={className} />;
      default: return <File className={className} />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading resources...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Storage Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <HardDrive className="w-6 h-6" />
                Project Resources
              </CardTitle>
              <CardDescription className="mt-2">
                Upload and manage project files, images, documents, and code
              </CardDescription>
            </div>
            
            <Button
              onClick={() => setShowUploadModal(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard icon={<File />} label="Total Files" value={stats.total} />
            <StatCard icon={<Image />} label="Images" value={stats.images} />
            <StatCard icon={<FileText />} label="Documents" value={stats.documents} />
            <StatCard icon={<Code />} label="Code Files" value={stats.code} />
            <StatCard icon={<Archive />} label="Archives" value={stats.archives} />
          </div>

          {/* Storage Usage */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(storageUsed)} / {maxTotalStorage}MB
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
            {storagePercentage > 80 && (
              <Alert className="mt-3" variant={storagePercentage > 95 ? "destructive" : "default"}>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {storagePercentage > 95
                    ? 'Storage almost full! Delete some files to free up space.'
                    : 'Storage is getting full. Consider deleting unused files.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="code">Code Files</SelectItem>
                <SelectItem value="archive">Archives</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Folder Filter */}
            {folders.length > 0 && (
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder} value={folder || ''}>
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Latest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="size">Largest First</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Display */}
      {displayFiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileImage className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No files uploaded yet</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== 'all' || selectedFolder !== 'all'
                ? 'No files match your filters. Try adjusting your search.'
                : 'Upload your first project resource to get started'}
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            {favoriteFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 font-semibold mb-4">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  Favorites ({favoriteFiles.length})
                </h3>
                <FileGrid 
                  files={favoriteFiles} 
                  viewMode={viewMode}
                  onView={viewFile}
                  onDownload={downloadFile}
                  onDelete={deleteFile}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                  getFileIcon={getFileIcon}
                />
              </div>
            )}

            {regularFiles.length > 0 && (
              <div>
                {favoriteFiles.length > 0 && (
                  <h3 className="font-semibold mb-4">
                    All Files ({regularFiles.length})
                  </h3>
                )}
                <FileGrid 
                  files={regularFiles} 
                  viewMode={viewMode}
                  onView={viewFile}
                  onDownload={downloadFile}
                  onDelete={deleteFile}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                  getFileIcon={getFileIcon}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload project resources, images, documents, and code files
            </DialogDescription>
          </DialogHeader>

          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <h4 className="font-semibold text-lg mb-2">
              {dragActive ? 'Drop files here' : 'Drag and drop files'}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <Input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="max-w-xs mx-auto"
            />
            <p className="text-xs text-muted-foreground mt-4">
              Max file size: {maxFileSize}MB • All file types supported
            </p>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function FileGrid({
  files,
  viewMode,
  onView,
  onDownload,
  onDelete,
  onToggleFavorite,
  favorites,
  getFileIcon
}: {
  files: FileMetadata[];
  viewMode: ViewMode;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  favorites: Set<string>;
  getFileIcon: (category: string, className?: string) => React.ReactNode;
}) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map(file => (
          <FileGridCard
            key={file.id}
            file={file}
            onView={onView}
            onDownload={onDownload}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.has(file.id)}
            getFileIcon={getFileIcon}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map(file => (
        <FileListItem
          key={file.id}
          file={file}
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites.has(file.id)}
          getFileIcon={getFileIcon}
        />
      ))}
    </div>
  );
}

function FileGridCard({ file, onView, onDownload, onDelete, onToggleFavorite, isFavorite, getFileIcon }: any) {
  return (
    <Card className="group hover:shadow-lg transition-all cursor-pointer">
      <CardContent className="p-4">
        <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          {file.thumbnailUrl ? (
            <img src={file.thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-400">
              {getFileIcon(file.category, "w-12 h-12")}
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(file.id);
              }}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
            </Button>
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {file.category === 'image' && (
              <Button size="sm" variant="secondary" onClick={() => onView(file.id)}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => onDownload(file.id)}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <p className="font-medium truncate text-sm" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDownload(file.id)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FileListItem({ file, onView, onDownload, onDelete, onToggleFavorite, isFavorite, getFileIcon }: any) {
  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex-shrink-0">
        {file.thumbnailUrl ? (
          <img src={file.thumbnailUrl} alt={file.name} className="w-10 h-10 object-cover rounded" />
        ) : (
          <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
            {getFileIcon(file.category, "w-5 h-5")}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{file.name}</p>
          <Badge variant="secondary" className="text-xs capitalize">
            {file.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleFavorite(file.id)}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
        </Button>

        {file.category === 'image' && (
          <Button variant="outline" size="sm" onClick={() => onView(file.id)}>
            <Eye className="w-4 h-4" />
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => onDownload(file.id)}>
          <Download className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(file.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
