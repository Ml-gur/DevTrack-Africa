import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { 
  Download, 
  Upload,
  FileJson,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
  Zap,
  Database,
  Code
} from 'lucide-react';
import { Project } from '../types/database';
import { Task } from '../types/task';

interface ProjectExportImportProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
  project?: Project;
  tasks?: Task[];
  onImport?: (data: any) => Promise<void>;
}

type ExportFormat = 'json' | 'csv' | 'markdown';

export default function ProjectExportImport({
  isOpen,
  onClose,
  mode,
  project,
  tasks = [],
  onImport
}: ProjectExportImportProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [includeOptions, setIncludeOptions] = useState({
    tasks: true,
    timeline: true,
    milestones: true,
    collaborators: true,
    files: false
  });
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!project) return;

    const data: any = {
      project: {
        title: project.title,
        description: project.description,
        category: project.category,
        status: project.status,
        tech_stack: project.tech_stack,
        created_at: project.created_at,
        updated_at: project.updated_at,
        github_repo: project.github_repo,
        live_url: project.live_url,
        progress: project.progress
      },
      exported_at: new Date().toISOString(),
      devtrack_version: '1.0.0'
    };

    if (includeOptions.tasks) {
      data.tasks = tasks.map(t => ({
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        estimatedHours: t.estimatedHours,
        timeSpentMinutes: t.timeSpentMinutes,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
        dueDate: t.dueDate
      }));
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `${project.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;

      case 'csv':
        content = convertToCSV(data);
        filename = `${project.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;

      case 'markdown':
        content = convertToMarkdown(data);
        filename = `${project.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
        break;

      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onClose();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        throw new Error('Only JSON format is supported for import');
      }

      // Validate data structure
      if (!data.project || !data.project.title) {
        throw new Error('Invalid project data format');
      }

      if (onImport) {
        await onImport(data);
        setImportSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import file');
    } finally {
      setImporting(false);
    }
  };

  const convertToCSV = (data: any): string => {
    if (!data.tasks || data.tasks.length === 0) {
      return 'No tasks to export';
    }

    const headers = ['Title', 'Status', 'Priority', 'Estimated Hours', 'Time Spent (min)', 'Created', 'Completed'];
    const rows = data.tasks.map((t: any) => [
      t.title,
      t.status,
      t.priority,
      t.estimatedHours || '',
      t.timeSpentMinutes || 0,
      t.createdAt,
      t.completedAt || ''
    ]);

    return [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const convertToMarkdown = (data: any): string => {
    let md = `# ${data.project.title}\n\n`;
    md += `${data.project.description}\n\n`;
    md += `## Project Details\n\n`;
    md += `- **Status:** ${data.project.status}\n`;
    md += `- **Category:** ${data.project.category}\n`;
    md += `- **Progress:** ${data.project.progress}%\n`;
    
    if (data.project.tech_stack && data.project.tech_stack.length > 0) {
      md += `- **Tech Stack:** ${data.project.tech_stack.join(', ')}\n`;
    }
    
    if (data.project.github_repo) {
      md += `- **GitHub:** ${data.project.github_repo}\n`;
    }
    
    if (data.project.live_url) {
      md += `- **Live URL:** ${data.project.live_url}\n`;
    }

    if (data.tasks && data.tasks.length > 0) {
      md += `\n## Tasks (${data.tasks.length})\n\n`;
      
      const tasksByStatus = {
        todo: data.tasks.filter((t: any) => t.status === 'todo'),
        in_progress: data.tasks.filter((t: any) => t.status === 'in_progress'),
        completed: data.tasks.filter((t: any) => t.status === 'completed')
      };

      if (tasksByStatus.todo.length > 0) {
        md += `### To Do (${tasksByStatus.todo.length})\n\n`;
        tasksByStatus.todo.forEach((t: any) => {
          md += `- [ ] **${t.title}** ${t.priority ? `[${t.priority}]` : ''}\n`;
          if (t.description) md += `  ${t.description}\n`;
        });
        md += '\n';
      }

      if (tasksByStatus.in_progress.length > 0) {
        md += `### In Progress (${tasksByStatus.in_progress.length})\n\n`;
        tasksByStatus.in_progress.forEach((t: any) => {
          md += `- [ ] **${t.title}** ${t.priority ? `[${t.priority}]` : ''}\n`;
          if (t.description) md += `  ${t.description}\n`;
        });
        md += '\n';
      }

      if (tasksByStatus.completed.length > 0) {
        md += `### Completed (${tasksByStatus.completed.length})\n\n`;
        tasksByStatus.completed.forEach((t: any) => {
          md += `- [x] **${t.title}**\n`;
          if (t.description) md += `  ${t.description}\n`;
        });
      }
    }

    md += `\n---\n*Exported from DevTrack Africa on ${new Date(data.exported_at).toLocaleDateString()}*\n`;

    return md;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'export' ? (
              <>
                <Download className="w-5 h-5" />
                Export Project
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import Project
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'export' 
              ? 'Export your project data to use in other tools or as a backup'
              : 'Import project data from a previously exported file'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'export' ? (
          <div className="space-y-6">
            {/* Export Format Selection */}
            <div className="space-y-3">
              <Label>Export Format</Label>
              <div className="grid grid-cols-3 gap-3">
                <Card 
                  className={`cursor-pointer transition-all ${
                    exportFormat === 'json' 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'hover:border-slate-300'
                  }`}
                  onClick={() => setExportFormat('json')}
                >
                  <CardContent className="p-4 text-center">
                    <FileJson className={`w-8 h-8 mx-auto mb-2 ${
                      exportFormat === 'json' ? 'text-blue-600' : 'text-slate-400'
                    }`} />
                    <div className="font-medium text-sm">JSON</div>
                    <div className="text-xs text-muted-foreground">Full data</div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    exportFormat === 'csv' 
                      ? 'border-green-500 bg-green-50/50' 
                      : 'hover:border-slate-300'
                  }`}
                  onClick={() => setExportFormat('csv')}
                >
                  <CardContent className="p-4 text-center">
                    <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${
                      exportFormat === 'csv' ? 'text-green-600' : 'text-slate-400'
                    }`} />
                    <div className="font-medium text-sm">CSV</div>
                    <div className="text-xs text-muted-foreground">Tasks only</div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    exportFormat === 'markdown' 
                      ? 'border-purple-500 bg-purple-50/50' 
                      : 'hover:border-slate-300'
                  }`}
                  onClick={() => setExportFormat('markdown')}
                >
                  <CardContent className="p-4 text-center">
                    <FileText className={`w-8 h-8 mx-auto mb-2 ${
                      exportFormat === 'markdown' ? 'text-purple-600' : 'text-slate-400'
                    }`} />
                    <div className="font-medium text-sm">Markdown</div>
                    <div className="text-xs text-muted-foreground">Readable</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Include Options */}
            <div className="space-y-3">
              <Label>Include in Export</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tasks"
                    checked={includeOptions.tasks}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({ ...includeOptions, tasks: checked as boolean })
                    }
                  />
                  <label htmlFor="tasks" className="text-sm cursor-pointer">
                    Tasks ({tasks.length})
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="timeline"
                    checked={includeOptions.timeline}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({ ...includeOptions, timeline: checked as boolean })
                    }
                  />
                  <label htmlFor="timeline" className="text-sm cursor-pointer">
                    Timeline & Dates
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="milestones"
                    checked={includeOptions.milestones}
                    onCheckedChange={(checked) => 
                      setIncludeOptions({ ...includeOptions, milestones: checked as boolean })
                    }
                  />
                  <label htmlFor="milestones" className="text-sm cursor-pointer">
                    Milestones
                  </label>
                </div>
              </div>
            </div>

            {/* Info */}
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                {exportFormat === 'json' && 'JSON format preserves all data and can be re-imported.'}
                {exportFormat === 'csv' && 'CSV format exports tasks for use in spreadsheets.'}
                {exportFormat === 'markdown' && 'Markdown format creates a readable document.'}
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Import Area */}
            <div
              className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="font-semibold mb-2">
                {importing ? 'Importing...' : 'Choose a file to import'}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to select a JSON export file
              </p>

              <Badge variant="secondary">Supports .json files</Badge>
            </div>

            {/* Import Status */}
            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            {importSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Project imported successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Info */}
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                <strong>Note:</strong> Importing will create a new project with the data from the file. 
                Existing projects won't be affected.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
