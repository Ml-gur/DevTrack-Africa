/**
 * Improved Empty States - Action-oriented and helpful
 * Shows users exactly what to do when there's no content
 */

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Rocket,
  FolderPlus,
  CheckSquare,
  Target,
  FileText,
  Package,
  TrendingUp,
  BookOpen,
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  Code,
  Smartphone,
  Globe
} from 'lucide-react';

interface ImprovedEmptyStatesProps {
  variant: 
    | 'no-projects' 
    | 'no-tasks' 
    | 'no-notes' 
    | 'no-resources'
    | 'no-milestones'
    | 'project-complete'
    | 'search-empty';
  onAction?: () => void;
  onSecondaryAction?: () => void;
  searchQuery?: string;
}

export default function ImprovedEmptyStates({
  variant,
  onAction,
  onSecondaryAction,
  searchQuery
}: ImprovedEmptyStatesProps) {
  
  const configs = {
    'no-projects': {
      icon: Rocket,
      title: 'Start Your Developer Journey',
      description: 'Create your first project and start tracking your development progress',
      primaryButton: 'Create Your First Project',
      secondaryButton: 'Explore Templates',
      tips: [
        'Projects help you organize your work and track progress',
        'Start with a small, achievable goal',
        'You can add tasks, notes, and resources later'
      ],
      quickActions: [
        { icon: Globe, label: 'Web App', color: 'blue' },
        { icon: Smartphone, label: 'Mobile App', color: 'purple' },
        { icon: Code, label: 'API Backend', color: 'green' },
        { icon: BookOpen, label: 'Learning', color: 'orange' }
      ]
    },
    'no-tasks': {
      icon: CheckSquare,
      title: 'No Tasks Yet',
      description: 'Break down your project into actionable tasks to start making progress',
      primaryButton: 'Add Your First Task',
      secondaryButton: 'Use Task Template',
      tips: [
        'Good tasks are specific and actionable',
        'Start with the most important task first',
        'Drag tasks between columns to update their status'
      ]
    },
    'no-notes': {
      icon: FileText,
      title: 'No Notes Yet',
      description: 'Document your ideas, decisions, and progress as you work',
      primaryButton: 'Create First Note',
      tips: [
        'Notes help you remember important decisions',
        'Document blockers and how you solved them',
        'Keep a development journal for learning'
      ]
    },
    'no-resources': {
      icon: Package,
      title: 'No Resources Yet',
      description: 'Upload files, images, and documents related to your project',
      primaryButton: 'Upload Resource',
      tips: [
        'Store design files, documentation, and assets',
        'Keep everything project-related in one place',
        'Supports images, PDFs, and more'
      ]
    },
    'no-milestones': {
      icon: Target,
      title: 'No Milestones Set',
      description: 'Set milestones to mark important goals and achievements',
      primaryButton: 'Add Milestone',
      tips: [
        'Milestones help you celebrate progress',
        'Break your project into phases',
        'Mark key deliverables and deadlines'
      ]
    },
    'project-complete': {
      icon: TrendingUp,
      title: '🎉 Project Complete!',
      description: 'Congratulations! You\'ve completed all tasks for this project',
      primaryButton: 'Archive Project',
      secondaryButton: 'Add More Tasks',
      tips: [
        'Take a moment to celebrate your achievement',
        'Document what you learned',
        'Share your success with the community'
      ],
      isSuccess: true
    },
    'search-empty': {
      icon: Target,
      title: 'No Results Found',
      description: searchQuery 
        ? `No items match "${searchQuery}". Try different keywords or clear filters.`
        : 'Try adjusting your search or filters',
      primaryButton: 'Clear Filters',
      tips: [
        'Use specific keywords',
        'Check your spelling',
        'Try broader search terms'
      ]
    }
  };

  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
          config.isSuccess 
            ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
            : 'bg-gradient-to-br from-blue-50 to-purple-50'
        }`}>
          <Icon className={`w-12 h-12 ${
            config.isSuccess ? 'text-green-600' : 'text-blue-600'
          }`} />
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          {config.title}
        </h3>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          {config.description}
        </p>

        {/* Quick Actions for Projects */}
        {variant === 'no-projects' && config.quickActions && (
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-4">Quick Start Templates:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              {config.quickActions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={onSecondaryAction}
                    className={`p-4 rounded-lg border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-all hover:scale-105 hover:shadow-md group`}
                  >
                    <ActionIcon className={`w-8 h-8 text-${action.color}-600 mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {onAction && (
            <Button
              onClick={onAction}
              size="lg"
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Sparkles className="w-5 h-5" />
              {config.primaryButton}
            </Button>
          )}
          {config.secondaryButton && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              {config.secondaryButton}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Tips Card */}
        {config.tips && config.tips.length > 0 && (
          <Card className="max-w-md mx-auto border-2 border-dashed">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-gray-900">Quick Tips</h4>
              </div>
              <ul className="space-y-3 text-left">
                {config.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Additional Help Link */}
        <div className="mt-6">
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto group">
            <BookOpen className="w-4 h-4" />
            <span className="border-b border-transparent group-hover:border-blue-600">
              Learn more about best practices
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactEmptyState({
  icon: Icon = FolderPlus,
  title,
  description,
  action,
  onAction
}: {
  icon?: React.ComponentType<any>;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      {description && (
        <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto">{description}</p>
      )}
      {action && onAction && (
        <Button onClick={onAction} size="sm" variant="outline" className="gap-2">
          <Play className="w-4 h-4" />
          {action}
        </Button>
      )}
    </div>
  );
}
