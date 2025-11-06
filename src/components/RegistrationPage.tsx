import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/LocalOnlyAuthContext';
import { 
  formatPhoneNumber, 
  validatePhoneNumber, 
  COUNTRY_PHONE_CONFIGS 
} from '../utils/phone-formatter';

interface RegistrationPageProps {
  onNavigate: (page: 'login' | 'welcome') => void;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  phone: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  phone?: string;
  general?: string;
}

export default function RegistrationPage({ onNavigate }: RegistrationPageProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    phone: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const countries = [
    { value: 'kenya', label: 'Kenya', flag: '🇰🇪' },
    { value: 'tanzania', label: 'Tanzania', flag: '🇹🇿' },
    { value: 'uganda', label: 'Uganda', flag: '🇺🇬' },
    { value: 'rwanda', label: 'Rwanda', flag: '🇷🇼' },
    { value: 'nigeria', label: 'Nigeria', flag: '🇳🇬' },
    { value: 'ghana', label: 'Ghana', flag: '🇬🇭' },
    { value: 'south_africa', label: 'South Africa', flag: '🇿🇦' },
    { value: 'ethiopia', label: 'Ethiopia', flag: '🇪🇹' },
    { value: 'morocco', label: 'Morocco', flag: '🇲🇦' },
    { value: 'egypt', label: 'Egypt', flag: '🇪🇬' },
    { value: 'other', label: 'Other African Country', flag: '🌍' }
  ];

  // Get phone config based on selected country
  const phoneConfig = formData.country ? COUNTRY_PHONE_CONFIGS[formData.country] : null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.country) {
      const phoneValidation = validatePhoneNumber(formData.phone, formData.country);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.error || 'Invalid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear general error and success message
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handlePhoneChange = (value: string) => {
    if (formData.country) {
      const formatted = formatPhoneNumber(value, formData.country);
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, phone: value }));
    }
    // Clear phone error
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleCountryChange = (value: string) => {
    // When country changes, reformat phone if it exists
    const newFormData: any = { country: value };
    
    if (formData.phone) {
      // Extract just the digits from current phone
      const digitsOnly = formData.phone.replace(/\D/g, '');
      const config = COUNTRY_PHONE_CONFIGS[value];
      
      if (config) {
        // If there are digits, try to preserve them with new country code
        const dialCodeDigits = config.dialCode.substring(1);
        let phoneDigits = digitsOnly;
        
        // Remove old country code if present
        for (const oldConfig of Object.values(COUNTRY_PHONE_CONFIGS)) {
          const oldDialCodeDigits = oldConfig.dialCode.substring(1);
          if (phoneDigits.startsWith(oldDialCodeDigits)) {
            phoneDigits = phoneDigits.substring(oldDialCodeDigits.length);
            break;
          }
        }
        
        // Format with new country code
        if (phoneDigits) {
          newFormData.phone = formatPhoneNumber(config.dialCode + phoneDigits, value);
        } else {
          newFormData.phone = config.dialCode + ' ';
        }
      }
    } else if (COUNTRY_PHONE_CONFIGS[value]) {
      // Set initial country code
      newFormData.phone = COUNTRY_PHONE_CONFIGS[value].dialCode + ' ';
    }
    
    setFormData(prev => ({ ...prev, ...newFormData }));
    
    // Clear country error
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: undefined }));
    }
  };

  // Auto-format phone when country is selected
  useEffect(() => {
    if (formData.country && !formData.phone && COUNTRY_PHONE_CONFIGS[formData.country]) {
      setFormData(prev => ({ 
        ...prev, 
        phone: COUNTRY_PHONE_CONFIGS[formData.country].dialCode + ' '
      }));
    }
  }, [formData.country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      console.log('🚀 Starting registration process for:', formData.email);
      const result = await signUp(
        formData.email, 
        formData.password, 
        formData.fullName,
        formData.country,
        formData.phone
      );

      console.log('📝 Registration result:', { 
        success: result.success, 
        message: result.message
      });

      if (!result.success) {
        console.log('❌ Registration failed:', result.message);
        setErrors({ general: result.message || 'Registration failed. Please try again.' });
      } else {
        console.log('✅ Registration successful, redirecting to login');
        setSuccessMessage('Account created successfully! You can now sign in.');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      setErrors({ general: 'Registration failed. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => onNavigate('welcome')}
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
          <CardTitle className="text-gray-900">Create Your Account</CardTitle>
          <CardDescription className="text-gray-600">
            Join the African developer community and start showcasing your journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Registration form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* General Error */}
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="email"
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
                  placeholder="Create a strong password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={handleCountryChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number
                  {phoneConfig && (
                    <span className="text-muted-foreground ml-2">({phoneConfig.dialCode})</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={phoneConfig?.placeholder || '+000 000 000 000'}
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={errors.phone ? 'border-destructive' : ''}
                    disabled={isLoading || !formData.country}
                    autoComplete="tel"
                  />
                  {!formData.country && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please select a country first
                    </p>
                  )}
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
                {phoneConfig && !errors.phone && formData.phone && (
                  <p className="text-xs text-muted-foreground">
                    Format: {phoneConfig.format}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}