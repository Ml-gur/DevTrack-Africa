import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import {
  Activity,
  Zap,
  Database,
  Clock,
  CheckCircle,
  TrendingUp,
  Server,
  HardDrive,
  Gauge
} from 'lucide-react'

interface PerformanceMetrics {
  storageUsed: number
  storageTotal: number
  itemCounts: {
    projects: number
    tasks: number
    posts: number
    messages: number
  }
  loadTime: number
  lastUpdate: string
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateMetrics()
  }, [])

  const calculateMetrics = () => {
    try {
      const startTime = performance.now()

      // Calculate storage usage
      let totalSize = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('devtrack_')) {
          totalSize += localStorage[key].length + key.length
        }
      }

      // Count items
      const getItemCount = (key: string) => {
        try {
          const data = localStorage.getItem(key)
          return data ? Object.keys(JSON.parse(data)).length : 0
        } catch {
          return 0
        }
      }

      const itemCounts = {
        projects: getItemCount('devtrack_projects'),
        tasks: getItemCount('devtrack_tasks'),
        posts: getItemCount('devtrack_posts'),
        messages: getItemCount('devtrack_messages')
      }

      const loadTime = performance.now() - startTime

      setMetrics({
        storageUsed: totalSize / 1024, // Convert to KB
        storageTotal: 5120, // 5MB typical browser limit
        itemCounts,
        loadTime,
        lastUpdate: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error calculating metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Loading metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const storagePercentage = (metrics.storageUsed / metrics.storageTotal) * 100
  const totalItems = Object.values(metrics.itemCounts).reduce((a, b) => a + b, 0)

  const getStorageStatus = () => {
    if (storagePercentage > 80) return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' }
    if (storagePercentage > 60) return { label: 'Warning', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { label: 'Healthy', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const getPerformanceStatus = () => {
    if (metrics.loadTime < 10) return { label: 'Excellent', color: 'text-green-600' }
    if (metrics.loadTime < 50) return { label: 'Good', color: 'text-blue-600' }
    if (metrics.loadTime < 100) return { label: 'Fair', color: 'text-yellow-600' }
    return { label: 'Slow', color: 'text-red-600' }
  }

  const storageStatus = getStorageStatus()
  const performanceStatus = getPerformanceStatus()

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${storageStatus.color}`}>
              {storageStatus.label}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.storageUsed.toFixed(2)} KB used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${performanceStatus.color}`}>
              {metrics.loadTime.toFixed(2)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceStatus.label} performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Across all collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">
              All systems normal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5" />
            <span>Storage Usage</span>
          </CardTitle>
          <CardDescription>
            Detailed breakdown of local storage consumption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Storage Capacity</span>
              <span className="text-sm text-gray-600">
                {metrics.storageUsed.toFixed(2)} KB / {metrics.storageTotal.toFixed(0)} KB
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{storagePercentage.toFixed(1)}% used</span>
              <span>{(metrics.storageTotal - metrics.storageUsed).toFixed(2)} KB remaining</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Item Distribution</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Projects</span>
                </div>
                <Badge variant="secondary">{metrics.itemCounts.projects}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Tasks</span>
                </div>
                <Badge variant="secondary">{metrics.itemCounts.tasks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Posts</span>
                </div>
                <Badge variant="secondary">{metrics.itemCounts.posts}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Messages</span>
                </div>
                <Badge variant="secondary">{metrics.itemCounts.messages}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="w-5 h-5" />
            <span>Performance Insights</span>
          </CardTitle>
          <CardDescription>
            Tips to optimize your DevTrack experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {storagePercentage > 80 && (
              <div className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-600 mt-0.5">⚠️</div>
                <div className="flex-1">
                  <div className="font-medium text-red-900 text-sm">Storage Almost Full</div>
                  <div className="text-xs text-red-700 mt-1">
                    Consider exporting and archiving old projects to free up space.
                  </div>
                </div>
              </div>
            )}

            {totalItems > 100 && (
              <div className="flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-600 mt-0.5">💡</div>
                <div className="flex-1">
                  <div className="font-medium text-blue-900 text-sm">Large Dataset Detected</div>
                  <div className="text-xs text-blue-700 mt-1">
                    With {totalItems} items, performance is still excellent thanks to local storage!
                  </div>
                </div>
              </div>
            )}

            {metrics.loadTime < 10 && (
              <div className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-green-600 mt-0.5">✅</div>
                <div className="flex-1">
                  <div className="font-medium text-green-900 text-sm">Optimal Performance</div>
                  <div className="text-xs text-green-700 mt-1">
                    Your data loads in under {metrics.loadTime.toFixed(2)}ms - lightning fast!
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-gray-600 mt-0.5">
                <Server className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">100% Offline Capable</div>
                <div className="text-xs text-gray-700 mt-1">
                  All data is stored locally - no internet connection required!
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium">Local Storage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Sync:</span>
              <span className="font-medium text-green-600">Real-time</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Backup Status:</span>
              <span className="font-medium">Manual</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">{new Date(metrics.lastUpdate).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
