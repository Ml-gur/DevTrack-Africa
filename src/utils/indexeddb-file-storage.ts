/**
 * IndexedDB File Storage Service
 * Handles storing and retrieving large files locally using IndexedDB
 */

const DB_NAME = 'DevTrackAfrica_FileStorage';
const DB_VERSION = 1;
const FILE_STORE = 'files';
const METADATA_STORE = 'file_metadata';

export interface StoredFile {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  category: 'image' | 'document' | 'code' | 'archive' | 'other';
  folder?: string;
  tags: string[];
  description?: string;
  version: number;
  blob: Blob;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: string;
}

export interface FileMetadata {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  category: 'image' | 'document' | 'code' | 'archive' | 'other';
  folder?: string;
  tags: string[];
  description?: string;
  version: number;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: string;
  thumbnailUrl?: string;
}

class FileStorageDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create file store for binary data
        if (!db.objectStoreNames.contains(FILE_STORE)) {
          const fileStore = db.createObjectStore(FILE_STORE, { keyPath: 'id' });
          fileStore.createIndex('projectId', 'projectId', { unique: false });
          fileStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }

        // Create metadata store for quick queries
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          const metadataStore = db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
          metadataStore.createIndex('projectId', 'projectId', { unique: false });
          metadataStore.createIndex('category', 'category', { unique: false });
          metadataStore.createIndex('folder', 'folder', { unique: false });
          metadataStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }
      };
    });
  }

  async saveFile(file: StoredFile): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILE_STORE, METADATA_STORE], 'readwrite');
      
      // Store full file with blob
      const fileStore = transaction.objectStore(FILE_STORE);
      fileStore.put(file);

      // Store metadata separately for fast queries
      const metadata: FileMetadata = {
        id: file.id,
        projectId: file.projectId,
        name: file.name,
        size: file.size,
        type: file.type,
        category: file.category,
        folder: file.folder,
        tags: file.tags,
        description: file.description,
        version: file.version,
        uploadedAt: file.uploadedAt,
        updatedAt: file.updatedAt,
        uploadedBy: file.uploadedBy
      };

      const metadataStore = transaction.objectStore(METADATA_STORE);
      metadataStore.put(metadata);

      transaction.oncomplete = () => {
        // Trigger project status update after file upload
        this.updateProjectStatusAfterResourceChange(file.projectId).catch(err => {
          console.error('Failed to auto-update project status:', err);
        });
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getFile(fileId: string): Promise<StoredFile | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILE_STORE], 'readonly');
      const store = transaction.objectStore(FILE_STORE);
      const request = store.get(fileId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.get(fileId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getProjectFiles(projectId: string): Promise<FileMetadata[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByCategory(projectId: string, category: string): Promise<FileMetadata[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const files = request.result || [];
        const filtered = files.filter(f => f.projectId === projectId && f.category === category);
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByFolder(projectId: string, folder: string): Promise<FileMetadata[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const files = request.result || [];
        const filtered = files.filter(f => f.projectId === projectId && f.folder === folder);
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.db) await this.init();

    // Get metadata before deleting to know which project to update
    const metadata = await this.getFileMetadata(fileId);
    const projectId = metadata?.projectId;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILE_STORE, METADATA_STORE], 'readwrite');
      
      const fileStore = transaction.objectStore(FILE_STORE);
      fileStore.delete(fileId);

      const metadataStore = transaction.objectStore(METADATA_STORE);
      metadataStore.delete(fileId);

      transaction.oncomplete = () => {
        // Trigger project status update after file deletion
        if (projectId) {
          this.updateProjectStatusAfterResourceChange(projectId).catch(err => {
            console.error('Failed to auto-update project status:', err);
          });
        }
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async updateFileMetadata(fileId: string, updates: Partial<FileMetadata>): Promise<void> {
    if (!this.db) await this.init();

    const metadata = await this.getFileMetadata(fileId);
    if (!metadata) throw new Error('File not found');

    const updated = { ...metadata, ...updates, updatedAt: new Date().toISOString() };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readwrite');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.put(updated);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTotalSize(projectId?: string): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const files = request.result || [];
        const filtered = projectId ? files.filter(f => f.projectId === projectId) : files;
        const totalSize = filtered.reduce((sum, file) => sum + file.size, 0);
        resolve(totalSize);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async searchFiles(projectId: string, searchTerm: string): Promise<FileMetadata[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => {
        const files = request.result || [];
        const searchLower = searchTerm.toLowerCase();
        const filtered = files.filter(f => 
          f.name.toLowerCase().includes(searchLower) ||
          f.description?.toLowerCase().includes(searchLower) ||
          f.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearProjectFiles(projectId: string): Promise<void> {
    const files = await this.getProjectFiles(projectId);
    await Promise.all(files.map(f => this.deleteFile(f.id)));
  }

  async clearAllFiles(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([FILE_STORE, METADATA_STORE], 'readwrite');
      
      transaction.objectStore(FILE_STORE).clear();
      transaction.objectStore(METADATA_STORE).clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Helper method to update project status when resources change
   * This is called after file upload/delete to ensure project status reflects resource state
   */
  private async updateProjectStatusAfterResourceChange(projectId: string): Promise<void> {
    try {
      // Import here to avoid circular dependencies
      const { LocalStorageDatabase } = await import('./local-storage-database');
      const db = new LocalStorageDatabase();
      
      // Get project and tasks
      const projects = localStorage.getItem('devtrack_projects');
      if (!projects) return;
      
      const projectsData = JSON.parse(projects);
      const project = projectsData[projectId];
      if (!project) return;
      
      // Get tasks for this project
      const tasks = await db.getTasks(projectId);
      
      // Import and use the calculator
      const { calculateProjectStatus } = await import('./project-status-calculator');
      const newStatus = await calculateProjectStatus(projectId, tasks, project.status);
      
      // Update if changed
      if (newStatus !== project.status) {
        project.status = newStatus;
        project.updated_at = new Date().toISOString();
        projectsData[projectId] = project;
        localStorage.setItem('devtrack_projects', JSON.stringify(projectsData));
      }
    } catch (error) {
      console.error('Failed to auto-update project status from resources:', error);
    }
  }
}

export const fileStorageDB = new FileStorageDB();

// Helper functions
export async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.readAsDataURL(file);
  });
}

export async function createThumbnail(file: File, size: number = 200, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(size / img.width, size / img.height);
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Use JPEG for better compression, fallback to original type
      const outputType = file.type === 'image/png' ? 'image/jpeg' : file.type;
      resolve(canvas.toDataURL(outputType, quality));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.readAsDataURL(file);
  });
}

export function getFileCategory(type: string, name: string): 'image' | 'document' | 'code' | 'archive' | 'other' {
  if (type.startsWith('image/')) return 'image';
  
  if (
    type.includes('pdf') || 
    type.includes('doc') || 
    type.includes('text') ||
    type.includes('markdown') ||
    name.endsWith('.md') ||
    name.endsWith('.txt')
  ) return 'document';
  
  if (
    type.includes('javascript') || 
    type.includes('typescript') ||
    name.endsWith('.js') ||
    name.endsWith('.ts') ||
    name.endsWith('.jsx') ||
    name.endsWith('.tsx') ||
    name.endsWith('.py') ||
    name.endsWith('.java') ||
    name.endsWith('.cpp') ||
    name.endsWith('.c') ||
    name.endsWith('.cs') ||
    name.endsWith('.go') ||
    name.endsWith('.rs')
  ) return 'code';
  
  if (
    type.includes('zip') || 
    type.includes('rar') || 
    type.includes('7z') ||
    type.includes('tar') ||
    type.includes('gz')
  ) return 'archive';
  
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getStorageQuota(): Promise<{ used: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return navigator.storage.estimate().then(estimate => ({
      used: estimate.usage || 0,
      quota: estimate.quota || 0
    }));
  }
  return Promise.resolve({ used: 0, quota: 0 });
}
