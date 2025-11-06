/**
 * Minimal Project Notes View
 * Simple editor for project notes - editable anytime
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { FileText, Save, Edit2 } from 'lucide-react';
import { LocalProject } from '../utils/local-storage-database';
import { toast } from 'sonner@2.0.3';

interface MinimalProjectNotesViewProps {
  project: LocalProject;
  onUpdate: (updates: Partial<LocalProject>) => void;
}

export default function MinimalProjectNotesView({
  project,
  onUpdate
}: MinimalProjectNotesViewProps) {
  const [notes, setNotes] = useState(project.notes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setNotes(project.notes || '');
  }, [project.notes]);

  const handleSave = () => {
    onUpdate({ notes });
    setHasChanges(false);
    setIsEditing(false);
    toast.success('Notes saved successfully');
  };

  const handleChange = (value: string) => {
    setNotes(value);
    setHasChanges(value !== (project.notes || ''));
  };

  const handleCancel = () => {
    setNotes(project.notes || '');
    setHasChanges(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Project Notes
              </CardTitle>
              <CardDescription>
                Add detailed notes, plans, or documentation for your project
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!hasChanges}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Add your project notes here... 

You can include:
• Project overview and goals
• Technical requirements
• Implementation details
• Development roadmap
• Known issues or bugs
• Future enhancements
• Resources and references"
                className="min-h-[400px] resize-y font-mono text-sm"
              />
              {hasChanges && (
                <div className="text-xs text-muted-foreground">
                  Unsaved changes
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-[400px]">
              {notes ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {notes}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No notes yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Add notes to document your project details, plans, and progress.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Add Notes
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-0 shadow-sm bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2 text-blue-900">💡 Tips for Project Notes</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Keep notes updated as your project evolves</li>
            <li>• Document important decisions and their reasoning</li>
            <li>• Track technical challenges and their solutions</li>
            <li>• List resources, tutorials, and references used</li>
            <li>• Note future improvements and feature ideas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
