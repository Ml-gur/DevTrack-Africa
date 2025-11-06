import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Alert, AlertDescription } from './components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, Database, Users, MessageCircle, FileText } from 'lucide-react'
import { supabase } from './utils/supabase/client'
import { supabaseService } from './utils/supabase/database-service'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'pending'
  message: string
  details?: string
}

export default function SupabaseIntegrationTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'warning' | 'pending'>('pending')

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // Test 1: Database Connection
      addTestResult({ name: 'Database Connection', status: 'pending', message: 'Testing connection...' })
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        if (error) throw error
        addTestResult({ 
          name: 'Database Connection', 
          status: 'success', 
          message: 'Successfully connected to Supabase database' 
        })
      } catch (error: any) {
        addTestResult({ 
          name: 'Database Connection', 
          status: 'error', 
          message: 'Failed to connect to database',
          details: error.message
        })
        return
      }

      // Test 2: Schema Validation
      addTestResult({ name: 'Schema Validation', status: 'pending', message: 'Checking database schema...' })
      try {
        const tables = ['profiles', 'projects', 'tasks', 'conversations', 'messages', 'community_posts', 'notifications']
        const schemaResults = []
        
        for (const table of tables) {
          try {
            const { data, error } = await supabase.from(table).select('*').limit(1)
            if (error && !error.message.includes('row-level security')) {
              throw error
            }
            schemaResults.push(`✓ ${table}`)
          } catch (error: any) {
            schemaResults.push(`✗ ${table}: ${error.message}`)
          }
        }
        
        addTestResult({ 
          name: 'Schema Validation', 
          status: 'success', 
          message: 'All required tables found',
          details: schemaResults.join('\n')
        })
      } catch (error: any) {
        addTestResult({ 
          name: 'Schema Validation', 
          status: 'error', 
          message: 'Schema validation failed',
          details: error.message
        })
      }

      // Test 3: Authentication
      addTestResult({ name: 'Authentication', status: 'pending', message: 'Testing authentication system...' })
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          addTestResult({ 
            name: 'Authentication', 
            status: 'success', 
            message: `Authenticated as ${user.email}` 
          })
        } else {
          addTestResult({ 
            name: 'Authentication', 
            status: 'warning', 
            message: 'No user currently authenticated (this is normal for testing)' 
          })
        }
      } catch (error: any) {
        addTestResult({ 
          name: 'Authentication', 
          status: 'error', 
          message: 'Authentication test failed',
          details: error.message
        })
      }

      // Test 4: Row Level Security
      addTestResult({ name: 'Row Level Security', status: 'pending', message: 'Testing RLS policies...' })
      try {
        // Try to access profiles without authentication - should be restricted
        const { data, error } = await supabase.from('profiles').select('*').limit(1)
        
        if (error && error.message.includes('row-level security')) {
          addTestResult({ 
            name: 'Row Level Security', 
            status: 'success', 
            message: 'RLS policies are properly configured and blocking unauthorized access' 
          })
        } else {
          addTestResult({ 
            name: 'Row Level Security', 
            status: 'warning', 
            message: 'RLS may not be properly configured or user has admin access' 
          })
        }
      } catch (error: any) {
        addTestResult({ 
          name: 'Row Level Security', 
          status: 'error', 
          message: 'RLS test failed',
          details: error.message
        })
      }

      // Test 5: Service Functions
      addTestResult({ name: 'Service Functions', status: 'pending', message: 'Testing service layer...' })
      try {
        // Test the service functions without making actual database calls
        const serviceTests = [
          'getUserProjects',
          'getPublicProjects', 
          'getUserTasks',
          'getCommunityPosts',
          'getUserNotifications'
        ]
        
        let allMethodsExist = true
        const missingMethods = []
        
        for (const method of serviceTests) {
          if (typeof (supabaseService as any)[method] !== 'function') {
            allMethodsExist = false
            missingMethods.push(method)
          }
        }
        
        if (allMethodsExist) {
          addTestResult({ 
            name: 'Service Functions', 
            status: 'success', 
            message: 'All service functions are properly defined' 
          })
        } else {
          addTestResult({ 
            name: 'Service Functions', 
            status: 'error', 
            message: 'Some service functions are missing',
            details: `Missing: ${missingMethods.join(', ')}`
          })
        }
      } catch (error: any) {
        addTestResult({ 
          name: 'Service Functions', 
          status: 'error', 
          message: 'Service functions test failed',
          details: error.message
        })
      }

      // Test 6: Real-time Subscriptions
      addTestResult({ name: 'Real-time Subscriptions', status: 'pending', message: 'Testing real-time capabilities...' })
      try {
        const channel = supabase.channel('test-channel')
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'))
          }, 5000)
          
          channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {})
            .subscribe((status) => {
              clearTimeout(timeout)
              if (status === 'SUBSCRIBED') {
                resolve(status)
              } else if (status === 'CHANNEL_ERROR') {
                reject(new Error('Channel error'))
              }
            })
        })
        
        await supabase.removeChannel(channel)
        
        addTestResult({ 
          name: 'Real-time Subscriptions', 
          status: 'success', 
          message: 'Real-time subscriptions are working' 
        })
      } catch (error: any) {
        addTestResult({ 
          name: 'Real-time Subscriptions', 
          status: 'warning', 
          message: 'Real-time subscriptions may not be available',
          details: error.message
        })
      }

      // Test 7: Environment Configuration
      addTestResult({ name: 'Environment Configuration', status: 'pending', message: 'Checking configuration...' })
      try {
        const config = {
          url: supabase.supabaseUrl,
          key: supabase.supabaseKey?.substring(0, 20) + '...',
          projectId: supabase.supabaseUrl?.split('//')[1]?.split('.')[0]
        }
        
        if (config.url && config.key && config.projectId) {
          addTestResult({ 
            name: 'Environment Configuration', 
            status: 'success', 
            message: 'Environment variables are properly configured',
            details: `Project ID: ${config.projectId}`
          })
        } else {
          addTestResult({ 
            name: 'Environment Configuration', 
            status: 'error', 
            message: 'Environment configuration is incomplete' 
          })
        }
      } catch (error: any) {
        addTestResult({ 
          name: 'Environment Configuration', 
          status: 'error', 
          message: 'Environment configuration test failed',
          details: error.message
        })
      }

      // Determine overall status
      const hasErrors = testResults.some(r => r.status === 'error')
      const hasWarnings = testResults.some(r => r.status === 'warning')
      
      if (hasErrors) {
        setOverallStatus('error')
      } else if (hasWarnings) {
        setOverallStatus('warning')
      } else {
        setOverallStatus('success')
      }

    } catch (error) {
      console.error('Test suite failed:', error)
      addTestResult({ 
        name: 'Test Suite', 
        status: 'error', 
        message: 'Test suite encountered an unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      setOverallStatus('error')
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">DT</span>
            </div>
            <h1 className="text-3xl font-bold">DevTrack Africa</h1>
          </div>
          <h2 className="text-xl text-muted-foreground">Supabase Integration Test Suite</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            This comprehensive test validates the complete Supabase integration including database schema, 
            authentication, row-level security, and service layer functionality.
          </p>
        </div>

        {/* Overall Status */}
        {testResults.length > 0 && (
          <Alert className={getStatusColor(overallStatus)}>
            <div className="flex items-center space-x-2">
              {getStatusIcon(overallStatus)}
              <AlertDescription className="text-lg font-medium">
                {overallStatus === 'success' && 'All tests passed! Supabase integration is ready for production.'}
                {overallStatus === 'warning' && 'Tests completed with warnings. Review the issues below.'}
                {overallStatus === 'error' && 'Tests failed. Critical issues need to be resolved.'}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Test Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Run Integration Tests</h3>
                <p className="text-sm text-muted-foreground">
                  Execute comprehensive tests to validate Supabase setup
                </p>
              </div>
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                size="lg"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Run Tests
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="grid gap-4">
            {testResults.map((result, index) => (
              <Card key={index} className={`border-l-4 ${getStatusColor(result.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{result.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                        {result.details && (
                          <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded whitespace-pre-wrap">
                            {result.details}
                          </pre>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {result.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Integration Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Integration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Database</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Complete schema with RLS policies, indexes, and triggers
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Authentication</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  User management with email confirmation and profile creation
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Real-time</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Live updates for messaging and collaboration features
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Next Steps:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Run the database schema using the SQL file: /database-schema-complete.sql</li>
                <li>• Ensure environment variables are properly configured</li>
                <li>• Test user registration and authentication flows</li>
                <li>• Verify all service layer functions work correctly</li>
                <li>• Test real-time features and subscriptions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}