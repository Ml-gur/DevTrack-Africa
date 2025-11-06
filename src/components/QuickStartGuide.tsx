import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Keyboard,
  Command,
  Zap,
  Download,
  Upload,
  Settings,
  FolderPlus,
  ListPlus,
  Star,
  Lightbulb
} from 'lucide-react'

interface QuickStartGuideProps {
  onClose?: () => void
}

export default function QuickStartGuide({ onClose }: QuickStartGuideProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quick Start Guide</h2>
          <p className="text-gray-600 mt-1">
            Get the most out of DevTrack Africa with these tips and shortcuts
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5" />
            <span>Keyboard Shortcuts</span>
          </CardTitle>
          <CardDescription>
            Work faster with these productivity shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Command className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Open Command Palette</span>
                </div>
                <Badge variant="secondary">⌘K</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Open Settings</span>
                </div>
                <Badge variant="secondary">⌘,</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FolderPlus className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">New Project</span>
                </div>
                <Badge variant="secondary">⌘N</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ListPlus className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">New Task</span>
                </div>
                <Badge variant="secondary">⌘⇧N</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Navigate Tabs</span>
                <Badge variant="secondary">via ⌘K</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Quick Search</span>
                <Badge variant="secondary">⌘K</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <Zap className="w-4 h-4 inline mr-2" />
              <strong>Pro Tip:</strong> Press <kbd className="px-2 py-1 bg-white rounded border">⌘K</kbd> anywhere to access all commands and navigate quickly!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Best Practices</span>
          </CardTitle>
          <CardDescription>
            Tips for using DevTrack Africa effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Start with Projects</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Create projects to organize your work. Each project can have multiple tasks, tags, and links to your code repositories.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Break Down Tasks</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Divide projects into smaller, manageable tasks. Use the Kanban board to track progress from "To Do" to "Completed".
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Share Your Progress</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Use the Community tab to share updates and showcase your projects. Connect with other developers and get inspired!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-medium">Regular Backups</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Export your data regularly from Settings → Data to create backups. Your data is stored locally, so backups ensure you never lose progress.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-sm font-bold">5</span>
              </div>
              <div>
                <h4 className="font-medium">Monitor Performance</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Check the Performance tab to monitor storage usage and app performance. Keep your data organized for optimal speed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Keep your data safe and portable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Export Data</h4>
                </div>
                <p className="text-sm text-green-700">
                  Download all your data as a JSON file for backups or migration to another device.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Import Data</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Restore from a backup file to recover your projects, tasks, and posts on any device.
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Important Note</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Your data is stored in your browser's local storage. If you clear your browser data or use incognito mode, 
                    your projects will be lost unless you've exported a backup. We recommend exporting your data weekly!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
