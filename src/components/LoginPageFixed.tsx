import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, AlertCircle } from 'lucide-react';

import { useAuth } from '../contexts/LocalOnlyAuthContext';

interface LoginPageProps {
  onBack: () => void;
  onSuccess: () => void;
  onNavigateToRegister?: () => void;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage({ onBack, onSuccess, onNavigateToRegister }: LoginPageProps) {
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      console.log('🔐 Attempting sign in for:', formData.email);
      const result = await signIn(formData.email, formData.password);
      
      if (!result.success) {
        console.log('❌ Sign in failed:', result.message);
        setErrors({ 
          general: result.message || 'Sign in failed. Please check your credentials and try again.' 
        });
      } else {
        console.log('✅ Login successful for:', formData.email);
        onSuccess();
      }
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      setErrors({ 
        general: 'Sign in failed due to a technical issue. Please try again or create a new account.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      alert('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    setShowForgotPassword(true);
    
    try {
      console.log('🔐 Password reset requested for:', resetEmail);
      setResetMessage('Password reset functionality will be available soon. Please contact support if you need immediate assistance.');
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setResetMessage('Unable to send password reset email. Please try again later.');
    }

    setTimeout(() => {
      setShowForgotPassword(false);
      setResetMessage('');
      setResetEmail('');
    }, 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-2 hover:bg-blue-50"
        disabled={isLoading}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Button>

      <Card className="w-full max-w-md border-blue-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">DT</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DevTrack <span className="text-green-600">Africa</span></span>
          </div>
          <CardTitle className="text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to continue your development journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Reset Message */}
              {resetMessage && (
                <Alert variant={resetMessage.includes('sent') ? 'default' : 'destructive'}>
                  <AlertDescription>{resetMessage}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange('email', e.target.value);
                    setResetEmail(e.target.value);
                  }}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={showForgotPassword || isLoading}
                  className="text-sm text-blue-600 hover:text-green-600 hover:underline disabled:opacity-50"
                >
                  {showForgotPassword ? 'Sending reset email...' : 'Forgot Password?'}
                </button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-md" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Demo Account Helper */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-900 mb-2">
                  <strong>New to DevTrack Africa?</strong> Try it out first!
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Create a free account in seconds to explore all features.
                </p>
                <Button
                  type="button"
                  onClick={() => onNavigateToRegister?.()}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  disabled={isLoading}
                >
                  Create Free Account
                </Button>
              </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}