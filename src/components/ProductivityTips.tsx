import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Lightbulb,
  X,
  ChevronRight,
  Target,
  Zap,
  Trophy,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react'

interface Tip {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  category: 'productivity' | 'feature' | 'shortcut' | 'best-practice'
}

const tips: Tip[] = [
  {
    id: 'tip-1',
    icon: <Target className="w-5 h-5" />,
    title: 'Break Down Large Tasks',
    description: 'Divide big projects into smaller, manageable tasks. This makes progress more visible and keeps you motivated!',
    category: 'best-practice'
  },
  {
    id: 'tip-2',
    icon: <Zap className="w-5 h-5" />,
    title: 'Use Keyboard Shortcuts',
    description: 'Press ⌘K (or Ctrl+K) to open the command palette and navigate quickly without using your mouse.',
    category: 'shortcut'
  },
  {
    id: 'tip-3',
    icon: <Trophy className="w-5 h-5" />,
    title: 'Set Priorities',
    description: 'Mark your tasks and projects with priorities (High, Medium, Low) to focus on what matters most.',
    category: 'productivity'
  },
  {
    id: 'tip-4',
    icon: <Clock className="w-5 h-5" />,
    title: 'Regular Backups',
    description: 'Export your data weekly from Settings → Data to keep your progress safe. Better safe than sorry!',
    category: 'best-practice'
  },
  {
    id: 'tip-5',
    icon: <Star className="w-5 h-5" />,
    title: 'Tag Your Work',
    description: 'Use tags to categorize projects and tasks. This makes filtering and finding work much easier later.',
    category: 'feature'
  },
  {
    id: 'tip-6',
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Review Your Analytics',
    description: 'Check the Analytics tab regularly to understand your productivity patterns and celebrate your achievements!',
    category: 'productivity'
  },
  {
    id: 'tip-7',
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Share Your Progress',
    description: 'Post updates in the Community tab to showcase your work and connect with other developers.',
    category: 'feature'
  },
  {
    id: 'tip-8',
    icon: <Zap className="w-5 h-5" />,
    title: 'Create Projects First',
    description: 'Always start with a project before adding tasks. This keeps your work organized from the beginning.',
    category: 'best-practice'
  },
  {
    id: 'tip-9',
    icon: <Target className="w-5 h-5" />,
    title: 'Monitor Storage',
    description: 'Check the Performance tab to monitor your local storage usage and keep your app running smoothly.',
    category: 'productivity'
  },
  {
    id: 'tip-10',
    icon: <Trophy className="w-5 h-5" />,
    title: 'Celebrate Small Wins',
    description: 'Mark tasks as completed to track your progress. Every completed task is a step toward your goals!',
    category: 'productivity'
  }
]

const TIPS_STORAGE_KEY = 'devtrack_tips_seen'
const TIPS_DISMISSED_KEY = 'devtrack_tips_dismissed'

export default function ProductivityTips() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [show, setShow] = useState(false)
  const [seenTips, setSeenTips] = useState<string[]>([])

  useEffect(() => {
    // Check if tips are dismissed
    const dismissed = localStorage.getItem(TIPS_DISMISSED_KEY)
    if (dismissed === 'true') {
      return
    }

    // Load seen tips
    try {
      const seen = localStorage.getItem(TIPS_STORAGE_KEY)
      if (seen) {
        const seenArray = JSON.parse(seen)
        setSeenTips(seenArray)
        
        // Find the first unseen tip
        const unseenTipIndex = tips.findIndex(tip => !seenArray.includes(tip.id))
        if (unseenTipIndex !== -1) {
          setCurrentTipIndex(unseenTipIndex)
          // Show tip after a delay
          setTimeout(() => setShow(true), 5000)
        }
      } else {
        // First time - show first tip
        setTimeout(() => setShow(true), 5000)
      }
    } catch (error) {
      console.error('Error loading tips:', error)
    }
  }, [])

  const handleNextTip = () => {
    // Mark current tip as seen
    const newSeenTips = [...seenTips, tips[currentTipIndex].id]
    setSeenTips(newSeenTips)
    localStorage.setItem(TIPS_STORAGE_KEY, JSON.stringify(newSeenTips))

    // Move to next unseen tip
    const nextUnseenIndex = tips.findIndex(
      (tip, index) => index > currentTipIndex && !newSeenTips.includes(tip.id)
    )

    if (nextUnseenIndex !== -1) {
      setCurrentTipIndex(nextUnseenIndex)
    } else {
      // All tips seen
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    // Mark current tip as seen
    const newSeenTips = [...seenTips, tips[currentTipIndex].id]
    localStorage.setItem(TIPS_STORAGE_KEY, JSON.stringify(newSeenTips))
  }

  const handleDismissForever = () => {
    localStorage.setItem(TIPS_DISMISSED_KEY, 'true')
    setShow(false)
  }

  if (!show) return null

  const currentTip = tips[currentTipIndex]
  const unseenTipsCount = tips.filter(tip => !seenTips.includes(tip.id)).length

  const getCategoryColor = (category: Tip['category']) => {
    switch (category) {
      case 'productivity':
        return 'bg-blue-100 text-blue-800'
      case 'feature':
        return 'bg-purple-100 text-purple-800'
      case 'shortcut':
        return 'bg-green-100 text-green-800'
      case 'best-practice':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-md animate-in slide-in-from-bottom-5 duration-500">
      <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                {currentTip.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">Pro Tip</span>
                  <Badge className={getCategoryColor(currentTip.category)} variant="secondary">
                    {currentTip.category.replace('-', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {unseenTipsCount} {unseenTipsCount === 1 ? 'tip' : 'tips'} remaining
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {currentTip.title}
            </h4>
            <p className="text-sm text-gray-600">
              {currentTip.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleDismissForever}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Don't show tips again
            </button>
            
            <Button
              size="sm"
              onClick={handleNextTip}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {unseenTipsCount > 1 ? (
                <>
                  Next Tip
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>Got it!</>
              )}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 flex space-x-1">
            {tips.slice(0, Math.min(tips.length, 5)).map((tip, index) => (
              <div
                key={tip.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  seenTips.includes(tip.id) || index === currentTipIndex
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Component to manually show tips
export function TipsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative"
    >
      <Lightbulb className="w-4 h-4 mr-2" />
      Tips
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
    </Button>
  )
}

// Reset tips for testing
export function useResetTips() {
  return () => {
    localStorage.removeItem(TIPS_STORAGE_KEY)
    localStorage.removeItem(TIPS_DISMISSED_KEY)
    window.location.reload()
  }
}
