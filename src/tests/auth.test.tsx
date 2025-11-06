/**
 * Basic auth flow tests for DevTrack Africa
 * These tests ensure the auth provider works correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthProviderFixed';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  default: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            maybeSingle: vi.fn()
          }))
        }))
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: vi.fn()
        }))
      }))
    }))
  },
  auth: {
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  }
}));

// Mock retry utilities
vi.mock('../utils/retryUtils', () => ({
  withRetriesAndCircuitBreaker: vi.fn((id, operation) => operation())
}));

// Test component to access auth context
function TestComponent() {
  const { user, loading, isAuthenticated, signIn, signUp } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not authenticated'}</div>
      <div data-testid="user">{user?.email || 'no user'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp({
        email: 'test@example.com',
        password: 'password',
        fullName: 'Test User',
        country: 'Kenya',
        phone: '+254700000000'
      })}>Sign Up</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should initialize in loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no user');
  });

  it('should provide auth methods', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});

describe('Auth Flow Integration', () => {
  it('should handle sign up flow', async () => {
    const mockAuth = await import('../lib/supabaseClient');
    const signUpMock = vi.mocked(mockAuth.default.auth.signUp);
    
    signUpMock.mockResolvedValueOnce({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signUpButton = screen.getByText('Sign Up');
    signUpButton.click();

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: {
            full_name: 'Test User',
            country: 'Kenya',
            phone: '+254700000000'
          }
        }
      });
    });
  });

  it('should handle sign in flow', async () => {
    const mockAuth = await import('../lib/supabaseClient');
    const signInMock = vi.mocked(mockAuth.default.auth.signInWithPassword);
    
    signInMock.mockResolvedValueOnce({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    signInButton.click();

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
    });
  });
});