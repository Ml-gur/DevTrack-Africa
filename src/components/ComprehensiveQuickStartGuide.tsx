/**
 * Comprehensive Quick Start Guide
 * Interactive walkthrough for new users with progress tracking
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  CheckCircle2,
  Circle,
  Rocket,
  FolderPlus,
  CheckSquare,
  Target,
  TrendingUp,
  Sparkles,
  Play,
  X,
  ArrowRight,
  Book,
  Zap
} from 'lucide-react';

interface QuickStartStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: string;
  completed: boolean;
}

interface ComprehensiveQuickStartGuideProps {
  onClose: () => void;
  onStepComplete: (stepId: string) => void;
  completedSteps: string[];
}

export default function ComprehensiveQuickStartGuide({
  onClose,
  onStepComplete,
  completedSteps = []
}: ComprehensiveQuickStartGuideProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: QuickStartStep[] = [
    {
      id: 'create_project',
      title: 'Create Your First Project',
      description: 'Start by creating a project to organize your work. A project could be a web app, mobile app, or learning goal.',
      icon: FolderPlus,
      action: 'Create Project',
      completed: completedSteps.includes('create_project')
    },
    {
      id: 'add_tasks',
      title: 'Add Tasks to Your Project',
      description: 'Break down your project into smaller, actionable tasks. You can drag tasks between columns to track progress.',
      icon: CheckSquare,
      action: 'Add Tasks',
      completed: completedSteps.includes('add_tasks')
    },
    {
      id: 'set_milestone',
      title: 'Set Your First Milestone',
      description: 'Milestones help you track major achievements and keep you motivated throughout your journey.',
      icon: Target,
      action: 'Add Milestone',
      completed: completedSteps.includes('set_milestone')
    },
    {
      id: 'track_progress',
      title: 'Track Your Progress',
      description: 'View analytics to see how you\'re progressing. Track time spent, completion rates, and productivity trends.',
      icon: TrendingUp,
      action: 'View Analytics',
      completed: completedSteps.includes('track_progress')
    }
  ];

  const completionPercentage = (completedSteps.length / steps.length) * 100;
  const currentStep = steps[activeStepIndex];
  const StepIcon = currentStep.icon;

  const handleStepComplete = (stepId: string) => {
    onStepComplete(stepId);
    
    // Move to next uncompleted step
    const nextIndex = steps.findIndex((step, index) => 
      index > activeStepIndex && !step.completed
    );
    if (nextIndex !== -1) {
      setActiveStepIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    onClose();
  };

  const handleFinish = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Quick Start Guide</DialogTitle>
                <DialogDescription>
                  Get started with DevTrack Africa in 4 simple steps
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Your Progress</span>
            <span className="font-semibold text-gray-900">
              {completedSteps.length} of {steps.length} completed
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-4 gap-3 my-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStepIndex;
            const isCompleted = step.completed;
            
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(index)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : isCompleted
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-100' 
                      : isActive 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Icon className={`w-5 h-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-900 text-center line-clamp-2">
                    {step.title.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Content */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <StepIcon className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {currentStep.title}
                  </h3>
                  {currentStep.completed && (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {currentStep.description}
                </p>

                {/* Step-specific guidance */}
                {activeStepIndex === 0 && (
                  <div className="bg-white rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-2">Quick Tips:</p>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Use templates for common project types</li>
                          <li>• Give your project a descriptive name</li>
                          <li>• Set a realistic timeline</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeStepIndex === 1 && (
                  <div className="bg-white rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-2">Quick Tips:</p>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Break tasks into small, achievable steps</li>
                          <li>• Set priorities (high, medium, low)</li>
                          <li>• Use the Kanban board to drag and drop</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {!currentStep.completed && currentStep.action && (
                    <Button
                      onClick={() => handleStepComplete(currentStep.id)}
                      size="lg"
                      className="gap-2"
                    >
                      <Play className="w-5 h-5" />
                      {currentStep.action}
                    </Button>
                  )}

                  {activeStepIndex < steps.length - 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveStepIndex(activeStepIndex + 1)}
                      className="gap-2"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}

                  {activeStepIndex === steps.length - 1 && completedSteps.length === steps.length && (
                    <Button
                      onClick={handleFinish}
                      size="lg"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Sparkles className="w-5 h-5" />
                      Finish Guide
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={() => {/* Open help center */}}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Book className="w-4 h-4" />
            <span>View Documentation</span>
          </button>

          <Button variant="ghost" onClick={handleSkip} className="text-sm">
            I'll explore on my own
          </Button>
        </div>

        {/* Completion Celebration */}
        {completedSteps.length === steps.length && (
          <div className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-lg pointer-events-none">
            <div className="text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Congratulations!
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                You've completed the quick start guide!
              </p>
              <Button
                onClick={handleFinish}
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 pointer-events-auto"
              >
                <Sparkles className="w-5 h-5" />
                Start Building
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Compact checklist version for sidebar
export function QuickStartChecklist({
  completedSteps,
  onStepClick
}: {
  completedSteps: string[];
  onStepClick: (stepId: string) => void;
}) {
  const steps = [
    { id: 'create_project', label: 'Create first project', icon: FolderPlus },
    { id: 'add_tasks', label: 'Add tasks', icon: CheckSquare },
    { id: 'set_milestone', label: 'Set milestone', icon: Target },
    { id: 'track_progress', label: 'View analytics', icon: TrendingUp }
  ];

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <Card className="border-2 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-900">Quick Start</h4>
        </div>

        <Progress value={progress} className="h-2 mb-4" />

        <div className="space-y-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {progress === 100 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-900 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              All done! You're ready to build.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
