/**
 * Enhanced Welcome Wizard - First-Time User Experience
 * Guides new users through the platform with a simple 3-step process
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Rocket,
  CheckCircle2,
  Target,
  Code,
  Smartphone,
  Globe,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EnhancedWelcomeWizardProps {
  open: boolean;
  onComplete: (data: WelcomeData) => void;
  onSkip: () => void;
}

interface WelcomeData {
  projectName: string;
  projectType: string;
  firstTask: string;
}

const PROJECT_TEMPLATES = [
  {
    id: 'web',
    icon: Globe,
    title: 'Web Application',
    description: 'Full-stack web app project',
    color: 'blue',
    defaultTasks: ['Setup project structure', 'Design homepage', 'Implement authentication', 'Deploy to hosting']
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile App',
    description: 'iOS/Android mobile app',
    color: 'purple',
    defaultTasks: ['Setup React Native', 'Design UI screens', 'Implement navigation', 'Test on devices']
  },
  {
    id: 'api',
    icon: Code,
    title: 'API Backend',
    description: 'RESTful API service',
    color: 'green',
    defaultTasks: ['Setup Express/Node', 'Design database schema', 'Create API endpoints', 'Write documentation']
  },
  {
    id: 'learning',
    icon: BookOpen,
    title: 'Learning Project',
    description: 'Practice & learn new skills',
    color: 'orange',
    defaultTasks: ['Choose technology to learn', 'Complete tutorial', 'Build practice project', 'Share what you learned']
  }
];

export default function EnhancedWelcomeWizard({ open, onComplete, onSkip }: EnhancedWelcomeWizardProps) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [firstTask, setFirstTask] = useState('');

  const currentTemplate = PROJECT_TEMPLATES.find(t => t.id === selectedTemplate);

  const handleNext = () => {
    if (step === 1) {
      // Validate project name
      if (!projectName.trim()) {
        toast.error('Please enter a project name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate template selection
      if (!selectedTemplate) {
        toast.error('Please select a project type');
        return;
      }
      // Auto-fill first task from template
      if (currentTemplate && !firstTask) {
        setFirstTask(currentTemplate.defaultTasks[0]);
      }
      setStep(3);
    } else if (step === 3) {
      // Complete wizard
      if (!firstTask.trim()) {
        toast.error('Please enter your first task');
        return;
      }
      onComplete({
        projectName,
        projectType: selectedTemplate,
        firstTask
      });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const getProgressPercentage = () => {
    return (step / 3) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Welcome to DevTrack Africa! 🚀</DialogTitle>
              <DialogDescription>
                Let's get you started in just 3 simple steps
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${num < 3 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  step >= num 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
                </div>
                <span className={`text-sm hidden sm:inline ${
                  step >= num ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {num === 1 ? 'Project' : num === 2 ? 'Type' : 'Task'}
                </span>
              </div>
              {num < 3 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  step > num ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="py-4">
          {/* Step 1: Project Name */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What are you building?
                </h3>
                <p className="text-gray-600">
                  Give your project a name. You can always change it later!
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Label htmlFor="project-name" className="text-base mb-2">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., My Awesome Mobile App"
                  className="text-lg h-12"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                />
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Quick Tip</p>
                      <p className="text-blue-700">
                        Choose a descriptive name that reflects what you're building. This helps you stay focused on your goals!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Type */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What type of project is it?
                </h3>
                <p className="text-gray-600">
                  We'll help you get started with relevant tasks and templates
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROJECT_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate === template.id;
                  
                  return (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        isSelected 
                          ? `ring-2 ring-${template.color}-500 shadow-md` 
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-${template.color}-50 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-6 h-6 text-${template.color}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{template.title}</h4>
                              {isSelected && (
                                <CheckCircle2 className={`w-5 h-5 text-${template.color}-600`} />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                            <Badge variant="secondary" className="text-xs">
                              {template.defaultTasks.length} starter tasks
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedTemplate && currentTemplate && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-900 mb-2">
                        We'll create these starter tasks for you:
                      </p>
                      <ul className="space-y-1 text-purple-700">
                        {currentTemplate.defaultTasks.map((task, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: First Task */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What's your first task?
                </h3>
                <p className="text-gray-600">
                  Start with something small and achievable
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <Label htmlFor="first-task" className="text-base mb-2">First Task</Label>
                <Input
                  id="first-task"
                  value={firstTask}
                  onChange={(e) => setFirstTask(e.target.value)}
                  placeholder="e.g., Setup project repository"
                  className="text-lg h-12"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                />

                {currentTemplate && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Or choose from these suggestions:</p>
                    <div className="space-y-2">
                      {currentTemplate.defaultTasks.slice(0, 3).map((task, index) => (
                        <button
                          key={index}
                          onClick={() => setFirstTask(task)}
                          className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm"
                        >
                          {task}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-900">
                      <p className="font-medium mb-1">Pro Tip</p>
                      <p className="text-green-700">
                        Break down large tasks into smaller, actionable steps. This makes progress visible and keeps you motivated!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Here's what we'll create:</p>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {projectName.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{projectName || 'Your Project'}</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {currentTemplate?.title || 'Project'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      {firstTask || 'Your first task'}
                    </div>
                    {currentTemplate?.defaultTasks.slice(1, 3).map((task, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="ghost"
            onClick={step === 1 ? onSkip : handleBack}
            className="gap-2"
          >
            {step === 1 ? (
              <>Skip for now</>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Back
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Step {step} of 3
            </span>
            <Button
              onClick={handleNext}
              className="gap-2"
              disabled={
                (step === 1 && !projectName.trim()) ||
                (step === 2 && !selectedTemplate) ||
                (step === 3 && !firstTask.trim())
              }
            >
              {step === 3 ? (
                <>
                  Complete Setup
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
