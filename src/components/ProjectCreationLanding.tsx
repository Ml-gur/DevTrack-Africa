import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Rocket, 
  Zap, 
  Sparkles, 
  FileText,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  Star,
  Lightbulb
} from 'lucide-react';
import EnhancedProjectCreationWizard from './EnhancedProjectCreationWizard';
import QuickProjectCreator from './QuickProjectCreator';
import ProjectTemplatesLibrary from './ProjectTemplatesLibrary';
import { ProjectTemplate } from './ProjectTemplatesLibrary';

interface ProjectCreationLandingProps {
  onCreateProject: (projectData: any) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

type CreationMode = 'landing' | 'quick' | 'wizard' | 'template';

export default function ProjectCreationLanding({ 
  onCreateProject, 
  onCancel 
}: ProjectCreationLandingProps) {
  const [mode, setMode] = useState<CreationMode>('landing');

  const handleTemplateSelect = async (template: ProjectTemplate) => {
    // Create project from template
    const projectData = {
      title: template.name,
      description: template.description,
      category: template.category,
      techStack: template.techStack,
      status: 'planning' as const,
      startDate: new Date().toISOString().split('T')[0],
      isPublic: true,
      progress: 0,
      goals: template.tasks.slice(0, 3).map(t => t.title)
    };

    await onCreateProject(projectData);
  };

  if (mode === 'wizard') {
    return (
      <EnhancedProjectCreationWizard
        onSubmit={onCreateProject}
        onCancel={() => setMode('landing')}
      />
    );
  }

  if (mode === 'quick') {
    return (
      <QuickProjectCreator
        onSubmit={onCreateProject}
        onCancel={() => setMode('landing')}
        onUseFullWizard={() => setMode('wizard')}
      />
    );
  }

  if (mode === 'template') {
    return (
      <ProjectTemplatesLibrary
        isOpen={true}
        onClose={() => setMode('landing')}
        onSelectTemplate={handleTemplateSelect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-xl">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Start Your Next Project
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose how you'd like to create your project. We'll guide you through the process.
          </p>
        </div>

        {/* Creation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Quick Create */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 cursor-pointer">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">Quick Create</h3>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    30 sec
                  </Badge>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Create a project with just the essentials. Perfect for getting started fast.
                </p>
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Basic information only
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Start tracking immediately
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Add details later
                </li>
              </ul>

              <Button 
                onClick={() => setMode('quick')}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                Quick Start
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Guided Wizard */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-300 cursor-pointer relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                <Star className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            </div>
            
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">Guided Wizard</h3>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    <Target className="w-3 h-3 mr-1" />
                    5 steps
                  </Badge>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Step-by-step process to set up your project with all the details.
                </p>
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Comprehensive setup
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Tech stack selection
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Goals & timeline planning
                </li>
              </ul>

              <Button 
                onClick={() => setMode('wizard')}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Start Wizard
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Use Template */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 cursor-pointer">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">Use Template</h3>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    <Rocket className="w-3 h-3 mr-1" />
                    8 options
                  </Badge>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Start with pre-configured templates for common project types.
                </p>
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Pre-filled information
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Ready-made tasks
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Best practices included
                </li>
              </ul>

              <Button 
                onClick={() => setMode('template')}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Browse Templates
                <FileText className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Why Track Projects Section */}
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-100 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Why Track Your Projects?
              </h2>
              <p className="text-slate-600">
                Professional project management helps you stay organized and showcase your work
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Stay Organized</h3>
                <p className="text-sm text-slate-600">
                  Keep track of tasks, deadlines, and progress in one place
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Track Progress</h3>
                <p className="text-sm text-slate-600">
                  Visualize your journey from idea to completion
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Showcase Work</h3>
                <p className="text-sm text-slate-600">
                  Build your portfolio and share with the community
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Learn & Improve</h3>
                <p className="text-sm text-slate-600">
                  Analyze your workflow and optimize for better results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700"
          >
            Need help choosing?
          </Button>
        </div>
      </div>
    </div>
  );
}
