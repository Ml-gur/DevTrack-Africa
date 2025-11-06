import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  FolderPlus,
  ListPlus,
  Users,
  FileText,
  Inbox,
  Rocket,
  Search,
  AlertCircle,
  TrendingUp
} from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md">
        {icon && (
          <div className="flex justify-center mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {action && (
          <div className="flex items-center justify-center space-x-3">
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function NoProjectsEmptyState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      icon={<FolderPlus className="w-16 h-16 text-gray-400" />}
      title="No projects yet"
      description="Create your first project to start tracking your development journey and organize your tasks."
      action={{
        label: 'Create Your First Project',
        onClick: onCreateProject
      }}
    />
  )
}

export function NoTasksEmptyState({ 
  onCreateTask,
  hasProjects 
}: { 
  onCreateTask: () => void
  hasProjects: boolean 
}) {
  if (!hasProjects) {
    return (
      <EmptyState
        icon={<ListPlus className="w-16 h-16 text-gray-400" />}
        title="No tasks yet"
        description="Create a project first, then add tasks to track your progress and stay organized."
        action={{
          label: 'Learn More',
          onClick: () => window.open('https://docs.devtrack.africa', '_blank')
        }}
      />
    )
  }

  return (
    <EmptyState
      icon={<ListPlus className="w-16 h-16 text-gray-400" />}
      title="No tasks yet"
      description="Break down your projects into smaller, manageable tasks. Track your progress with our Kanban board."
      action={{
        label: 'Create Your First Task',
        onClick: onCreateTask
      }}
    />
  )
}

export function NoCommunityPostsEmptyState({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-16 h-16 text-gray-400" />}
      title="No community posts yet"
      description="Be the first to share your development journey! Post your progress, learnings, and achievements."
      action={{
        label: 'Share Your First Update',
        onClick: onCreatePost
      }}
    />
  )
}

export function NoSearchResultsEmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      icon={<Search className="w-16 h-16 text-gray-400" />}
      title="No results found"
      description={`We couldn't find anything matching "${searchTerm}". Try different keywords or check your spelling.`}
    />
  )
}

export function NoDataEmptyState() {
  return (
    <EmptyState
      icon={<Inbox className="w-16 h-16 text-gray-400" />}
      title="No data available"
      description="There's nothing here yet. Start creating projects and tasks to populate your dashboard."
    />
  )
}

export function ErrorEmptyState({ 
  message,
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-16 h-16 text-red-400" />}
      title="Something went wrong"
      description={message || "We encountered an error while loading your data. Please try again."}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry
      } : undefined}
    />
  )
}

export function FirstTimeUserWelcome({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardContent className="py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Rocket className="w-20 h-20 text-blue-600" />
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome to DevTrack Africa! 🎉
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Your complete project management platform is ready. Let's get you started on your development journey!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <FolderPlus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Create Projects</h3>
              <p className="text-sm text-gray-600">
                Organize your work into projects with tags and tech stacks
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <ListPlus className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Track Tasks</h3>
              <p className="text-sm text-gray-600">
                Use Kanban boards to manage tasks from start to finish
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Monitor Progress</h3>
              <p className="text-sm text-gray-600">
                Get insights with analytics and performance metrics
              </p>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Get Started
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            💾 All data is stored locally in your browser - completely private and offline-capable
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function NoAnalyticsData() {
  return (
    <EmptyState
      icon={<TrendingUp className="w-16 h-16 text-gray-400" />}
      title="No analytics data yet"
      description="Start creating projects and completing tasks to see your productivity analytics and insights."
    />
  )
}
