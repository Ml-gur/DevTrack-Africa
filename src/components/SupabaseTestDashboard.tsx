import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle, XCircle, Database, Users, Wifi } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import { supabaseService } from '../utils/supabase/database-service'
import { useAuth } from '../contexts/SupabaseAuthContext'

interface TestStatus {
  connection: 'success' | 'error' | 'testing'
  authentication: 'success' | 'error' | 'testing'
  database: 'success' | 'error' | 'testing'
  service: 'success' | 'error' | 'testing'
}

export default function SupabaseTestDashboard() {
  const { user, profile, signIn, signUp, signOut } = useAuth()
  const [testStatus, setTestStatus] = useState<TestStatus>({
    connection: 'testing',
    authentication: 'testing',
    database: 'testing',
    service: 'testing'
  })
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    runConnectivityTests()
  }, [])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runConnectivityTests = async () => {
    // Test 1: Basic Connection
    try {
      addResult('Testing Supabase connection...')
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error && !error.message.includes('row-level security')) {
        throw error
      }
      
      setTestStatus(prev => ({ ...prev, connection: 'success' }))
      addResult('✅ Supabase connection successful')
    } catch (error: any) {
      setTestStatus(prev => ({ ...prev, connection: 'error' }))
      addResult(`❌ Connection failed: ${error.message}`)
    }

    // Test 2: Authentication
    try {
      addResult('Testing authentication system...')
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      setTestStatus(prev => ({ ...prev, authentication: 'success' }))
      if (currentUser) {
        addResult(`✅ User authenticated: ${currentUser.email}`)
      } else {
        addResult('✅ Authentication system ready (no user logged in)')
      }
    } catch (error: any) {
      setTestStatus(prev => ({ ...prev, authentication: 'error' }))
      addResult(`❌ Authentication test failed: ${error.message}`)
    }

    // Test 3: Database Schema
    try {
      addResult('Testing database schema...')
      const tables = ['profiles', 'projects', 'tasks', 'messages', 'community_posts']
      let allTablesExist = true
      
      for (const table of tables) {
        try {
          await supabase.from(table).select('*').limit(1)
          addResult(`✅ Table '${table}' exists`)
        } catch (error: any) {
          if (!error.message.includes('row-level security')) {
            allTablesExist = false
            addResult(`❌ Table '${table}' error: ${error.message}`)
          } else {
            addResult(`✅ Table '${table}' exists (RLS active)`)
          }
        }
      }
      
      setTestStatus(prev => ({ ...prev, database: allTablesExist ? 'success' : 'error' }))
    } catch (error: any) {
      setTestStatus(prev => ({ ...prev, database: 'error' }))
      addResult(`❌ Database schema test failed: ${error.message}`)
    }

    // Test 4: Service Layer
    try {
      addResult('Testing service layer...')
      const serviceMethods = [
        'getUserProjects',
        'getPublicProjects',
        'getUserTasks',
        'getCommunityPosts',
        'getUserNotifications'
      ]
      
      let allMethodsExist = true
      for (const method of serviceMethods) {
        if (typeof (supabaseService as any)[method] === 'function') {
          addResult(`✅ Service method '${method}' available`)
        } else {
          allMethodsExist = false
          addResult(`❌ Service method '${method}' missing`)
        }
      }
      
      setTestStatus(prev => ({ ...prev, service: allMethodsExist ? 'success' : 'error' }))
    } catch (error: any) {
      setTestStatus(prev => ({ ...prev, service: 'error' }))
      addResult(`❌ Service layer test failed: ${error.message}`)
    }
  }

  const testUserRegistration = async () => {
    try {
      addResult('Testing user registration...')
      const testEmail = `test-${Date.now()}@devtrack.test`
      const testPassword = 'TestPassword123!'
      
      const result = await signUp(testEmail, testPassword, {
        fullName: 'Test User',
        username: 'testuser'
      })
      
      if (result.success) {
        addResult(`✅ User registration successful: ${testEmail}`)
        if (result.requiresConfirmation) {
          addResult('📧 Email confirmation required (normal for new accounts)')
        }
      } else {
        addResult(`❌ Registration failed: ${result.error}`)
      }
    } catch (error: any) {
      addResult(`❌ Registration test error: ${error.message}`)
    }
  }

  const testCreateProject = async () => {
    if (!user) {
      addResult('❌ User must be logged in to create projects')
      return
    }

    try {
      addResult('Testing project creation...')
      const projectData = {
        title: `Test Project ${Date.now()}`,
        description: 'A test project created during integration testing',
        user_id: user.id,
        status: 'planning' as const,
        priority: 'medium' as const,
        category: 'Testing',
        tags: ['test', 'integration'],
        tech_stack: ['React', 'TypeScript'],
        is_public: false
      }
      
      const newProject = await supabaseService.createProject(projectData)
      
      if (newProject) {
        addResult(`✅ Project created successfully: ${newProject.title}`)
        addResult(`📋 Project ID: ${newProject.id}`)
      } else {
        addResult('❌ Project creation failed')
      }
    } catch (error: any) {
      addResult(`❌ Project creation error: ${error.message}`)
    }
  }

  const getStatusIcon = (status: 'success' | 'error' | 'testing') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    }
  }

  const allTestsPassed = Object.values(testStatus).every(status => status === 'success')

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
          <h2 className="text-xl text-muted-foreground">Supabase Integration Dashboard</h2>
        </div>

        {/* Overall Status */}
        <Alert className={allTestsPassed ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <div className="flex items-center space-x-2">
            {allTestsPassed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Wifi className="h-5 w-5 text-yellow-500" />
            )}
            <AlertDescription className="font-medium">
              {allTestsPassed 
                ? 'All systems operational! Supabase integration is working perfectly.' 
                : 'Running integration tests... Please wait for all tests to complete.'
              }
            </AlertDescription>
          </div>
        </Alert>

        {/* Test Status Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection</CardTitle>
              {getStatusIcon(testStatus.connection)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {testStatus.connection === 'success' ? 'Connected' : 
                 testStatus.connection === 'error' ? 'Failed' : 'Testing...'}
              </div>
              <p className="text-xs text-muted-foreground">Supabase connectivity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
              {getStatusIcon(testStatus.authentication)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {testStatus.authentication === 'success' ? 'Ready' : 
                 testStatus.authentication === 'error' ? 'Failed' : 'Testing...'}
              </div>
              <p className="text-xs text-muted-foreground">Auth system status</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              {getStatusIcon(testStatus.database)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {testStatus.database === 'success' ? 'Schema OK' : 
                 testStatus.database === 'error' ? 'Error' : 'Checking...'}
              </div>
              <p className="text-xs text-muted-foreground">Schema validation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              {getStatusIcon(testStatus.service)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {testStatus.service === 'success' ? 'Available' : 
                 testStatus.service === 'error' ? 'Error' : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">Service layer</p>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Current User</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
                {profile && (
                  <>
                    <p><strong>Full Name:</strong> {profile.full_name || 'Not set'}</p>
                    <p><strong>Username:</strong> {profile.username || 'Not set'}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={runConnectivityTests}
                variant="outline"
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                Rerun Tests
              </Button>
              
              <Button 
                onClick={testUserRegistration}
                variant="outline"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Test Registration
              </Button>
              
              {user && (
                <Button 
                  onClick={testCreateProject}
                  variant="outline"
                  size="sm"
                >
                  Test Create Project
                </Button>
              )}
              
              {user && (
                <Button 
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {testResults.length > 0 
                  ? testResults.join('\n')
                  : 'No test results yet. Click "Rerun Tests" to start testing.'
                }
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}