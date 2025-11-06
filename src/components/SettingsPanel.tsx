import React, { useState } from 'react'
import { useAuth } from '../contexts/LocalOnlyAuthContext'
import { localDatabase } from '../utils/local-storage-database'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { toast } from 'sonner@2.0.3'
import DataBackupManager from './DataBackupManager'
import ProductionReadinessChecker from './ProductionReadinessChecker'
import { StorageQuotaMonitor } from './StorageQuotaMonitor'
import {
  Download,
  Upload,
  Trash2,
  Database,
  User,
  Settings,
  Moon,
  Sun,
  AlertTriangle,
  CheckCircle,
  Shield,
  FileJson,
  HardDrive,
  Info,
  Keyboard,
  Activity
} from 'lucide-react'

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onThemeToggle?: () => void
  isDarkMode?: boolean
}

// Helper component for displaying keyboard shortcuts
function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-xs text-gray-400 mx-1">then</span>}
            <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-xs">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPanel({ 
  open, 
  onOpenChange,
  onThemeToggle,
  isDarkMode = false
}: SettingsPanelProps) {
  const { user, profile, updateProfile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [storageStats, setStorageStats] = useState<{
    used: number
    total: number
    percentage: number
  } | null>(null)

  // Profile form state - only registration information
  const [profileForm, setProfileForm] = useState({
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    country: profile?.country || '',
    phone: profile?.phone || ''
  })

  // Calculate storage usage
  React.useEffect(() => {
    if (open) {
      calculateStorageUsage()
    }
  }, [open])

  const calculateStorageUsage = () => {
    try {
      let totalSize = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length
        }
      }
      
      // Convert to KB
      const usedKB = totalSize / 1024
      const totalKB = 5120 // Most browsers allow 5-10MB, we'll use 5MB as baseline
      const percentage = (usedKB / totalKB) * 100

      setStorageStats({
        used: usedKB,
        total: totalKB,
        percentage: Math.min(percentage, 100)
      })
    } catch (error) {
      console.error('Error calculating storage:', error)
    }
  }

  const handleExportData = () => {
    try {
      setLoading(true)
      
      // Collect all DevTrack data
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        user: {
          id: user?.id,
          email: user?.email,
          fullName: user?.fullName
        },
        profile,
        data: {
          projects: localStorage.getItem('devtrack_projects'),
          tasks: localStorage.getItem('devtrack_tasks'),
          posts: localStorage.getItem('devtrack_posts'),
          messages: localStorage.getItem('devtrack_messages')
        }
      }

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devtrack-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        
        // Validate data structure
        if (!importData.version || !importData.data) {
          throw new Error('Invalid backup file format')
        }

        // Confirm before overwriting
        if (confirm('This will overwrite your current data. Are you sure you want to continue?')) {
          // Import data
          if (importData.data.projects) {
            localStorage.setItem('devtrack_projects', importData.data.projects)
          }
          if (importData.data.tasks) {
            localStorage.setItem('devtrack_tasks', importData.data.tasks)
          }
          if (importData.data.posts) {
            localStorage.setItem('devtrack_posts', importData.data.posts)
          }
          if (importData.data.messages) {
            localStorage.setItem('devtrack_messages', importData.data.messages)
          }

          toast.success('Data imported successfully! Refreshing...')
          
          // Reload page to reflect changes
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to import data. Please check the file format.')
      } finally {
        setLoading(false)
      }
    }

    reader.readAsText(file)
  }

  const handleClearAllData = () => {
    if (!confirm('⚠️ This will delete ALL your data permanently. Are you absolutely sure?')) {
      return
    }

    if (!confirm('This action cannot be undone. Type "DELETE" to confirm you want to delete all data.')) {
      return
    }

    try {
      // Clear all DevTrack data
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('devtrack_')
      )
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      toast.success('All data cleared. Signing out...')
      
      // Sign out and reload
      setTimeout(async () => {
        await signOut()
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Clear data error:', error)
      toast.error('Failed to clear data')
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      await updateProfile(profileForm)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const getStorageStatusColor = () => {
    if (!storageStats) return 'text-gray-600'
    if (storageStats.percentage > 80) return 'text-red-600'
    if (storageStats.percentage > 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your account, data, and application preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-7 gap-1">
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              <User className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="text-xs sm:text-sm">
              <HardDrive className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Storage</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs sm:text-sm">
              <Database className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs sm:text-sm">
              <Activity className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="text-xs sm:text-sm">
              <Keyboard className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Keys</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm">
              {isDarkMode ? <Moon className="w-4 h-4 mr-0 sm:mr-2" /> : <Sun className="w-4 h-4 mr-0 sm:mr-2" />}
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm">
              <Info className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information from registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileForm.email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Your country"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254 712 345 678"
                  />
                </div>

                <Button onClick={handleUpdateProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">User ID:</span>
                  <span className="text-sm font-mono text-xs">{user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Created:</span>
                  <span className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-4">
            <StorageQuotaMonitor />
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-4">
            <DataBackupManager />
          </TabsContent>

          {/* Health & Production Readiness Tab */}
          <TabsContent value="health" className="space-y-4">
            <ProductionReadinessChecker />
          </TabsContent>

          {/* Keyboard Shortcuts Tab */}
          <TabsContent value="shortcuts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Speed up your workflow with keyboard shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Navigation</h4>
                    <div className="space-y-2">
                      <ShortcutRow keys={['g', 'h']} description="Go to Homepage" />
                      <ShortcutRow keys={['g', 'p']} description="Go to Projects" />
                      <ShortcutRow keys={['g', 'a']} description="Go to Analytics" />
                      <ShortcutRow keys={['g', 's']} description="Go to Settings" />
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium text-sm mb-2">Actions</h4>
                    <div className="space-y-2">
                      <ShortcutRow keys={['c']} description="Create New Project" />
                      <ShortcutRow keys={['/']} description="Open Search" />
                      <ShortcutRow keys={['Ctrl', 'K']} description="Command Palette" />
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium text-sm mb-2">General</h4>
                    <div className="space-y-2">
                      <ShortcutRow keys={['?']} description="Show Shortcuts Help" />
                      <ShortcutRow keys={['Esc']} description="Close Modal/Dialog" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <Info className="w-4 h-4 inline mr-2" />
                    Press <kbd className="px-2 py-1 bg-white rounded border border-blue-200 font-mono text-xs">?</kbd> anytime to view all available shortcuts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Preferences</CardTitle>
                <CardDescription>
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Dark Mode</div>
                    <div className="text-sm text-gray-600">
                      {isDarkMode ? 'Dark mode is enabled' : 'Light mode is enabled'}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={onThemeToggle}
                  >
                    {isDarkMode ? (
                      <><Sun className="w-4 h-4 mr-2" /> Switch to Light</>
                    ) : (
                      <><Moon className="w-4 h-4 mr-2" /> Switch to Dark</>
                    )}
                  </Button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <Info className="w-4 h-4 inline mr-2" />
                    Dark mode will be implemented in a future update. Stay tuned!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About DevTrack Africa</CardTitle>
                <CardDescription>Version 1.0.0 - Local Storage Edition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Key Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>100% offline-capable with local storage</li>
                    <li>Comprehensive Kanban project management</li>
                    <li>Task tracking with priorities and tags</li>
                    <li>Community showcase and social features</li>
                    <li>Real-time analytics and insights</li>
                    <li>Data export and backup capabilities</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Storage Information</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <Shield className="w-4 h-4 inline mr-2" />
                      All your data is stored locally in your browser. No data is sent to any server. 
                      Your information stays completely private and under your control.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Technology Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge>React</Badge>
                    <Badge>TypeScript</Badge>
                    <Badge>Tailwind CSS</Badge>
                    <Badge>Local Storage API</Badge>
                    <Badge>shadcn/ui</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Built with ❤️ for African developers
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
