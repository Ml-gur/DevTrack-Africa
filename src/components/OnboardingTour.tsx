import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Rocket,
  FolderPlus,
  ListPlus,
  Users,
  BarChart3,
  Keyboard,
  Download,
  Shield,
  Sparkles
} from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  highlight?: string
}

interface OnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DevTrack Africa! 🎉',
    description: 'Your complete project management platform built for African developers. Let\'s take a quick tour to get you started.',
    icon: <Rocket className="w-12 h-12 text-blue-600" />
  },
  {
    id: 'offline-first',
    title: 'Offline-First & Private',
    description: 'All your data is stored locally in your browser. No servers, no tracking, no compromises. Your data stays 100% private and works offline.',
    icon: <Shield className="w-12 h-12 text-green-600" />
  },
  {
    id: 'projects',
    title: 'Create Projects',
    description: 'Start by creating projects to organize your work. Each project can have its own tasks, tags, tech stack, and links to GitHub or live demos.',
    icon: <FolderPlus className="w-12 h-12 text-purple-600" />,
    highlight: 'projects'
  },
  {
    id: 'tasks',
    title: 'Manage Tasks with Kanban',
    description: 'Break down your projects into tasks and track them on a beautiful Kanban board. Drag and drop tasks between To Do, In Progress, and Completed.',
    icon: <ListPlus className="w-12 h-12 text-orange-600" />,
    highlight: 'tasks'
  },
  {
    id: 'community',
    title: 'Share with the Community',
    description: 'Showcase your projects and progress with the community. Like, comment, and discover what other developers are building.',
    icon: <Users className="w-12 h-12 text-pink-600" />,
    highlight: 'community'
  },
  {
    id: 'analytics',
    title: 'Track Your Progress',
    description: 'Get insights into your productivity with comprehensive analytics. See your completion rates, project timelines, and task statistics.',
    icon: <BarChart3 className="w-12 h-12 text-indigo-600" />,
    highlight: 'analytics'
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Work faster with keyboard shortcuts! Press ⌘K (or Ctrl+K) anytime to open the command palette and quickly navigate or create items.',
    icon: <Keyboard className="w-12 h-12 text-cyan-600" />
  },
  {
    id: 'backup',
    title: 'Backup Your Data',
    description: 'Export your data anytime from Settings to create backups. You can import these backups later to restore your data on any device.',
    icon: <Download className="w-12 h-12 text-yellow-600" />
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 🚀',
    description: 'You\'re ready to start tracking your development journey. Create your first project and let\'s build something amazing together!',
    icon: <Sparkles className="w-12 h-12 text-gradient" />
  }
]

const TOUR_STORAGE_KEY = 'devtrack_tour_completed'

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user has completed the tour
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!tourCompleted) {
      // Small delay to let the dashboard load first
      setTimeout(() => setShow(true), 1000)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setShow(false)
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setShow(false)
    onSkip()
  }

  if (!show) return null

  const step = tourSteps[currentStep]
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />

      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-300">
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Step {currentStep + 1} of {tourSteps.length}
                </Badge>
              </div>
              
              <Progress value={progress} className="h-1 mb-4 bg-white/20" />
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  {step.icon}
                  {currentStep === 0 && (
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse" />
                  )}
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 text-lg max-w-lg">
                    {step.description}
                  </p>
                </div>

                {step.highlight && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                    <p className="text-sm text-blue-900">
                      💡 Look for the <strong>{step.highlight}</strong> tab in your dashboard
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 p-6 rounded-b-lg">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-600"
                >
                  Skip Tour
                </Button>

                <div className="flex items-center space-x-3">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        Get Started
                        <Rocket className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center items-center space-x-2 mt-4">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Hook to reset tour for testing
export function useResetTour() {
  return () => {
    localStorage.removeItem(TOUR_STORAGE_KEY)
    window.location.reload()
  }
}
