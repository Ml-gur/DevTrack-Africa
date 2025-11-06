import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription } from './ui/dialog'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import {
  Search,
  FolderPlus,
  ListPlus,
  Settings,
  Download,
  Upload,
  Moon,
  Sun,
  LogOut,
  Home,
  BarChart3,
  Users,
  Keyboard,
  Command
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  shortcut?: string
  action: () => void
  category: 'navigation' | 'actions' | 'settings'
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject?: () => void
  onCreateTask?: () => void
  onOpenSettings?: () => void
  onExportData?: () => void
  onImportData?: () => void
  onToggleTheme?: () => void
  onLogout?: () => void
  onNavigate?: (tab: string) => void
}

export default function CommandPalette({
  open,
  onOpenChange,
  onCreateProject,
  onCreateTask,
  onOpenSettings,
  onExportData,
  onImportData,
  onToggleTheme,
  onLogout,
  onNavigate
}: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-projects',
      label: 'Go to Projects',
      description: 'View all your projects',
      icon: <Home className="w-4 h-4" />,
      shortcut: '↑P',
      category: 'navigation',
      action: () => {
        onNavigate?.('projects')
        onOpenChange(false)
      }
    },
    {
      id: 'nav-tasks',
      label: 'Go to Tasks',
      description: 'View your task board',
      icon: <ListPlus className="w-4 h-4" />,
      shortcut: '↑T',
      category: 'navigation',
      action: () => {
        onNavigate?.('tasks')
        onOpenChange(false)
      }
    },
    {
      id: 'nav-community',
      label: 'Go to Community',
      description: 'Browse community posts',
      icon: <Users className="w-4 h-4" />,
      shortcut: '↑C',
      category: 'navigation',
      action: () => {
        onNavigate?.('community')
        onOpenChange(false)
      }
    },
    {
      id: 'nav-analytics',
      label: 'Go to Analytics',
      description: 'View your statistics',
      icon: <BarChart3 className="w-4 h-4" />,
      shortcut: '↑A',
      category: 'navigation',
      action: () => {
        onNavigate?.('analytics')
        onOpenChange(false)
      }
    },
    // Actions
    {
      id: 'action-new-project',
      label: 'Create New Project',
      description: 'Start a new project',
      icon: <FolderPlus className="w-4 h-4" />,
      shortcut: '⌘N',
      category: 'actions',
      action: () => {
        onCreateProject?.()
        onOpenChange(false)
      }
    },
    {
      id: 'action-new-task',
      label: 'Create New Task',
      description: 'Add a task to a project',
      icon: <ListPlus className="w-4 h-4" />,
      shortcut: '⌘⇧N',
      category: 'actions',
      action: () => {
        onCreateTask?.()
        onOpenChange(false)
      }
    },
    {
      id: 'action-export',
      label: 'Export Data',
      description: 'Download your data as JSON',
      icon: <Download className="w-4 h-4" />,
      category: 'actions',
      action: () => {
        onExportData?.()
        onOpenChange(false)
      }
    },
    {
      id: 'action-import',
      label: 'Import Data',
      description: 'Restore from backup',
      icon: <Upload className="w-4 h-4" />,
      category: 'actions',
      action: () => {
        onImportData?.()
        onOpenChange(false)
      }
    },
    // Settings
    {
      id: 'setting-preferences',
      label: 'Open Settings',
      description: 'Manage your preferences',
      icon: <Settings className="w-4 h-4" />,
      shortcut: '⌘,',
      category: 'settings',
      action: () => {
        onOpenSettings?.()
        onOpenChange(false)
      }
    },
    {
      id: 'setting-theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: <Moon className="w-4 h-4" />,
      category: 'settings',
      action: () => {
        onToggleTheme?.()
        onOpenChange(false)
      }
    },
    {
      id: 'action-logout',
      label: 'Sign Out',
      description: 'Log out of your account',
      icon: <LogOut className="w-4 h-4" />,
      category: 'settings',
      action: () => {
        onLogout?.()
        onOpenChange(false)
      }
    }
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase())
  )

  const groupedCommands = {
    navigation: filteredCommands.filter(cmd => cmd.category === 'navigation'),
    actions: filteredCommands.filter(cmd => cmd.category === 'actions'),
    settings: filteredCommands.filter(cmd => cmd.category === 'settings')
  }

  // Keyboard navigation
  useEffect(() => {
    if (!open) {
      setSearch('')
      setSelectedIndex(0)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, filteredCommands, selectedIndex])

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    window.addEventListener('keydown', handleGlobalShortcut)
    return () => window.removeEventListener('keydown', handleGlobalShortcut)
  }, [open, onOpenChange])

  const renderCommandGroup = (title: string, commands: CommandItem[]) => {
    if (commands.length === 0) return null

    return (
      <div className="py-2">
        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </div>
        {commands.map((cmd, index) => {
          const globalIndex = filteredCommands.indexOf(cmd)
          const isSelected = globalIndex === selectedIndex

          return (
            <button
              key={cmd.id}
              onClick={cmd.action}
              className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors ${
                isSelected ? 'bg-blue-50 border-l-2 border-blue-600' : ''
              }`}
              onMouseEnter={() => setSelectedIndex(globalIndex)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-gray-600">{cmd.icon}</div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{cmd.label}</div>
                  {cmd.description && (
                    <div className="text-xs text-gray-500">{cmd.description}</div>
                  )}
                </div>
              </div>
              {cmd.shortcut && (
                <Badge variant="secondary" className="text-xs">
                  {cmd.shortcut}
                </Badge>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogDescription className="sr-only">
            Quick access command palette to search projects, navigate, and perform actions
          </DialogDescription>
          <div className="border-b">
            <div className="flex items-center px-4 py-3 space-x-3">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder="Type a command or search..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <Badge variant="outline" className="text-xs">
                <Command className="w-3 h-3 mr-1" />K
              </Badge>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No commands found</p>
                <p className="text-xs text-gray-400 mt-1">Try searching for something else</p>
              </div>
            ) : (
              <>
                {renderCommandGroup('Navigation', groupedCommands.navigation)}
                {renderCommandGroup('Actions', groupedCommands.actions)}
                {renderCommandGroup('Settings', groupedCommands.settings)}
              </>
            )}
          </div>

          <div className="border-t bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <div className="flex items-center space-x-1">
              <Keyboard className="w-3 h-3" />
              <span>Keyboard shortcuts</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Keyboard shortcuts helper component
export function KeyboardShortcutsHelp() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Global Shortcuts</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Open command palette</span>
            <Badge variant="secondary">⌘K</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Open settings</span>
            <Badge variant="secondary">⌘,</Badge>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Navigation</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Go to Projects</span>
            <Badge variant="secondary">⌘K → P</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Go to Tasks</span>
            <Badge variant="secondary">⌘K → T</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Go to Community</span>
            <Badge variant="secondary">⌘K → C</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Go to Analytics</span>
            <Badge variant="secondary">⌘K → A</Badge>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Actions</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Create new project</span>
            <Badge variant="secondary">⌘N</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Create new task</span>
            <Badge variant="secondary">⌘⇧N</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}