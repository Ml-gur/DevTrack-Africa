import React, { useState, Suspense, lazy } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { 
  Plus, 
  Rocket,
  Loader2
} from 'lucide-react';

// Lazy load heavy components
const ProjectCreationLanding = lazy(() => import('./ProjectCreationLanding'));
const EnhancedProjectCreationWizard = lazy(() => import('./EnhancedProjectCreationWizard'));
const QuickProjectCreator = lazy(() => import('./QuickProjectCreator'));

interface ProjectCreationHubProps {
  onCreateProject: (projectData: any) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  defaultMode?: 'landing' | 'wizard' | 'quick';
  showTrigger?: boolean;
}

export default function ProjectCreationHub({
  onCreateProject,
  onCancel,
  defaultMode = 'landing',
  showTrigger = true
}: ProjectCreationHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<'landing' | 'wizard' | 'quick' | null>(null);

  const handleOpen = (mode: 'landing' | 'wizard' | 'quick' = defaultMode) => {
    setCurrentMode(mode);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentMode(null);
    onCancel?.();
  };

  const handleCreate = async (projectData: any) => {
    const result = await onCreateProject(projectData);
    if (result.success) {
      handleClose();
    }
    return result;
  };

  if (!isOpen && showTrigger) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Main Create Button */}
        <Button
          onClick={() => handleOpen('landing')}
          className="gap-2 h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </Button>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpen('quick')}
            className="gap-2 h-12"
            title="Quick create"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleOpen('wizard')}
            className="gap-2 h-12"
            title="Use wizard"
          >
            <Rocket className="w-4 h-4" />
            <span className="hidden sm:inline">Wizard</span>
          </Button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <Suspense fallback={<CreationLoadingState />}>
      {currentMode === 'landing' && (
        <ProjectCreationLanding
          onCreateProject={handleCreate}
          onCancel={handleClose}
        />
      )}
      
      {currentMode === 'wizard' && (
        <EnhancedProjectCreationWizard
          onSubmit={handleCreate}
          onCancel={handleClose}
        />
      )}
      
      {currentMode === 'quick' && (
        <QuickProjectCreator
          onSubmit={handleCreate}
          onCancel={handleClose}
          onUseFullWizard={() => setCurrentMode('wizard')}
        />
      )}
    </Suspense>
  );
}

function CreationLoadingState() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-4xl mx-4">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Floating Action Button for Mobile
export function FloatingCreateButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-3xl transition-all md:hidden p-0"
      title="Create new project"
    >
      <Plus className="w-8 h-8" />
    </Button>
  );
}

// Compact Trigger for Navigation
export function CompactCreateTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="sm"
      className="gap-2"
    >
      <Plus className="w-4 h-4" />
      New
    </Button>
  );
}

// Empty State Component
export function ProjectCreationEmptyState({ onCreateProject }: { 
  onCreateProject: (data: any) => Promise<{ success: boolean; error?: string }> 
}) {
  const [showCreation, setShowCreation] = useState(false);

  if (showCreation) {
    return (
      <ProjectCreationHub
        onCreateProject={onCreateProject}
        onCancel={() => setShowCreation(false)}
        showTrigger={false}
      />
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Rocket className="w-12 h-12 text-blue-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          No Projects Yet
        </h2>
        
        <p className="text-lg text-slate-600 mb-8">
          Start building your portfolio by creating your first project. 
          Track your progress and showcase your work to the community.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => setShowCreation(true)}
            className="gap-2 h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Create Your First Project
          </Button>
          
          <Button
            variant="outline"
            className="gap-2 h-12 px-6"
          >
            <Rocket className="w-5 h-5" />
            Browse Templates
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Quick Setup</div>
            <div>30 seconds</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Guided</div>
            <div>5 easy steps</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Templates</div>
            <div>8 options</div>
          </div>
        </div>
      </div>
    </div>
  );
}
