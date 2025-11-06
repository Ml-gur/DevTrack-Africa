import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Local user type
interface LocalUser {
  id: string
  email: string
  fullName?: string
  created_at: string
  email_confirmed_at: string
}

// Local profile type - simplified to only registration information
interface LocalProfile {
  id: string
  userId: string
  fullName: string
  email: string
  country: string
  phone: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: LocalUser | null
  profile: LocalProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string, country?: string, phone?: string) => Promise<{ success: boolean; message?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<LocalProfile>) => Promise<{ success: boolean }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'devtrack_users',
  CURRENT_USER: 'devtrack_current_user',
  PROFILES: 'devtrack_profiles'
} as const

// Helper functions for localStorage
const getStoredUsers = (): Record<string, LocalUser & { password: string }> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const getStoredProfiles = (): Record<string, LocalProfile> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILES)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const getCurrentUser = (): LocalUser | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export function LocalOnlyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [profile, setProfile] = useState<LocalProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    try {
      console.log('🔄 Initializing local auth...')
      const currentUser = getCurrentUser()
      
      if (currentUser) {
        setUser(currentUser)
        
        // Load user profile
        const profiles = getStoredProfiles()
        const userProfile = profiles[currentUser.id]
        if (userProfile) {
          setProfile(userProfile)
        }
        
        console.log('✅ Local user restored:', currentUser.email)
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string, country?: string, phone?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const users = getStoredUsers()
      
      // Check if user already exists
      const existingUser = Object.values(users).find(u => u.email === email)
      if (existingUser) {
        return { success: false, message: 'User already exists with this email' }
      }

      // Create new user
      const userId = generateId()
      const now = new Date().toISOString()
      
      const newUser: LocalUser = {
        id: userId,
        email,
        fullName,
        created_at: now,
        email_confirmed_at: now // Auto-confirm for local storage
      }

      // Store user with password
      users[userId] = { ...newUser, password }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

      // Create profile with registration information
      const profiles = getStoredProfiles()
      const newProfile: LocalProfile = {
        id: generateId(),
        userId,
        fullName: fullName || email.split('@')[0],
        email,
        country: country || '',
        phone: phone || '',
        created_at: now,
        updated_at: now
      }
      
      profiles[userId] = newProfile
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles))

      // Set as current user
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser))
      setUser(newUser)
      setProfile(newProfile)

      console.log('✅ User registered successfully:', email)
      return { success: true, message: 'Account created successfully!' }
    } catch (error) {
      console.error('❌ Registration error:', error)
      return { success: false, message: 'Failed to create account' }
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const users = getStoredUsers()
      const user = Object.values(users).find(u => u.email === email)
      
      if (!user || user.password !== password) {
        return { success: false, message: 'Invalid email or password' }
      }

      // Remove password from user object for setting state
      const { password: _, ...userWithoutPassword } = user
      
      // Set as current user
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)

      // Load profile
      const profiles = getStoredProfiles()
      const userProfile = profiles[user.id]
      if (userProfile) {
        setProfile(userProfile)
      }

      console.log('✅ User signed in successfully:', email)
      return { success: true, message: 'Signed in successfully!' }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { success: false, message: 'Failed to sign in' }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
      setUser(null)
      setProfile(null)
      console.log('✅ User signed out successfully')
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<LocalProfile>): Promise<{ success: boolean }> => {
    try {
      if (!user || !profile) {
        return { success: false }
      }

      const profiles = getStoredProfiles()
      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      profiles[user.id] = updatedProfile
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles))
      setProfile(updatedProfile)

      console.log('✅ Profile updated successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      return { success: false }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a LocalOnlyAuthProvider')
  }
  return context
}

export type { LocalUser, LocalProfile }