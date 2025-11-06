/**
 * Minimal Empty State - Beautiful empty states with call-to-action
 */

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  FolderOpen,
  Plus,
  FileText,
  Inbox,
  Search,
  Sparkles,
  Rocket,
  Target,
  CheckCircle2,
  Users,
  MessageSquare,
  Zap
} from 'lucide-react';

interface MinimalEmptyStateProps {
  variant?: 'projects' | 'tasks' | 'resources' | 'community' | 'messages' | 'search' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  showIllustration?: boolean;
}

export default function MinimalEmptyState({
  variant = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  showIllustration = true
}: MinimalEmptyStateProps) {
  const getContent = () => {
    switch (variant) {
      case 'projects':
        return {
          icon: FolderOpen,
          title: title || 'No projects yet',
          description: description || 'Start your development journey by creating your first project. Track tasks, manage resources, and showcase your work!',
          actionLabel: actionLabel || 'Create Project',
          gradient: 'from-blue-500 to-purple-600',
          bgColor: 'bg-blue-50'
        };
      case 'tasks':
        return {
          icon: CheckCircle2,
          title: title || 'No tasks yet',
          description: description || 'Add your first task to start organizing your work. Break down your project into manageable pieces.',
          actionLabel: actionLabel || 'Add Task',
          gradient: 'from-green-500 to-teal-600',
          bgColor: 'bg-green-50'
        };
      case 'resources':
        return {
          icon: FileText,
          title: title || 'No resources yet',
          description: description || 'Upload files, documents, and links to keep all your project resources in one place.',
          actionLabel: actionLabel || 'Add Resource',
          gradient: 'from-purple-500 to-pink-600',
          bgColor: 'bg-purple-50'
        };
      case 'community':
        return {
          icon: Users,
          title: title || 'No community posts',
          description: description || 'Share your progress, ask questions, and connect with other developers in the community.',
          actionLabel: actionLabel || 'Create Post',
          gradient: 'from-orange-500 to-red-600',
          bgColor: 'bg-orange-50'
        };
      case 'messages':
        return {
          icon: MessageSquare,
          title: title || 'No messages',
          description: description || 'Start a conversation with other developers. Collaborate and share ideas.',
          actionLabel: actionLabel || 'New Message',
          gradient: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-50'
        };
      case 'search':
        return {
          icon: Search,
          title: title || 'No results found',
          description: description || 'Try adjusting your search criteria or filters to find what you\'re looking for.',
          actionLabel: actionLabel || 'Clear Search',
          gradient: 'from-gray-500 to-gray-700',
          bgColor: 'bg-gray-50'
        };
      default:
        return {
          icon: Inbox,
          title: title || 'Nothing here yet',
          description: description || 'Get started by adding your first item.',
          actionLabel: actionLabel || 'Get Started',
          gradient: 'from-blue-500 to-purple-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <Card className="border-2 border-dashed border-gray-200">
      <CardContent className="py-16 px-6 text-center">
        {showIllustration && (
          <div className="mb-6 relative">
            {/* Main Icon */}
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${content.gradient} flex items-center justify-center mx-auto mb-4 shadow-xl animate-in zoom-in-50 duration-500`}>
              <Icon className="w-12 h-12 text-white" />
            </div>

            {/* Floating Icons */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-full max-w-xs">
              <div className="relative h-24">
                <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 left-4 animate-pulse" />
                <Zap className="w-5 h-5 text-blue-400 absolute top-2 right-8 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <Target className="w-4 h-4 text-purple-400 absolute bottom-4 left-12 animate-pulse" style={{ animationDelay: '0.4s' }} />
                <Rocket className="w-5 h-5 text-orange-400 absolute bottom-0 right-4 animate-bounce" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">{content.title}</h3>
          <p className="text-gray-600 leading-relaxed">{content.description}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {onAction && (
              <Button
                onClick={onAction}
                size="lg"
                className={`gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r ${content.gradient}`}
              >
                <Plus className="w-5 h-5" />
                {content.actionLabel}
              </Button>
            )}
            
            {onSecondaryAction && secondaryActionLabel && (
              <Button
                onClick={onSecondaryAction}
                size="lg"
                variant="outline"
                className="gap-2"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          {variant === 'projects' && (
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm font-medium text-gray-900 mb-3">Quick Start Tips</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className={`p-3 ${content.bgColor} rounded-lg`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold">1</div>
                    <p className="text-xs font-semibold">Create</p>
                  </div>
                  <p className="text-xs text-gray-600">Set up your project details</p>
                </div>
                <div className={`p-3 ${content.bgColor} rounded-lg`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold">2</div>
                    <p className="text-xs font-semibold">Organize</p>
                  </div>
                  <p className="text-xs text-gray-600">Add tasks and resources</p>
                </div>
                <div className={`p-3 ${content.bgColor} rounded-lg`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-bold">3</div>
                    <p className="text-xs font-semibold">Track</p>
                  </div>
                  <p className="text-xs text-gray-600">Monitor your progress</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
