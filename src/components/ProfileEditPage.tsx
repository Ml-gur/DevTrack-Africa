import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/LocalOnlyAuthContext';
import { 
  formatPhoneNumber, 
  validatePhoneNumber, 
  COUNTRY_PHONE_CONFIGS,
  displayPhoneNumber
} from '../utils/phone-formatter';

interface ProfileEditPageProps {
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileEditPage({ onSave, onCancel }: ProfileEditPageProps) {
  const { profile, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    email: profile?.email || '',
    country: profile?.country || '',
    phone: profile?.phone || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user makes changes
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handlePhoneChange = (value: string) => {
    if (formData.country) {
      const formatted = formatPhoneNumber(value, formData.country);
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, phone: value }));
    }
    if (error) setError(null);
    if (success) setSuccess(false);
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
    }
    
    setFormData(prev => ({ ...prev, ...newFormData }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  // Format existing phone on mount
  useEffect(() => {
    if (profile?.phone && profile?.country) {
      const formatted = displayPhoneNumber(profile.phone, profile.country);
      setFormData(prev => ({ ...prev, phone: formatted }));
    }
  }, [profile]);

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.country) {
      setError('Please select your country');
      return false;
    }
    
    // Validate phone format
    const phoneValidation = validatePhoneNumber(formData.phone, formData.country);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Invalid phone number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        country: formData.country,
        phone: formData.phone
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSave();
        }, 1500);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Profile not found. Please try logging in again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl">Edit Profile</h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <AlertDescription className="text-green-800 dark:text-green-200">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  className="bg-input-background"
                />
              </div>

              {/* Email - Read only */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Country</span>
                </Label>
                <Select 
                  value={formData.country} 
                  onValueChange={handleCountryChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-input-background">
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
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                  {phoneConfig && (
                    <span className="text-muted-foreground ml-1">({phoneConfig.dialCode})</span>
                  )}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={phoneConfig?.placeholder || '+000 000 000 000'}
                  disabled={isLoading || !formData.country}
                  className="bg-input-background"
                />
                {phoneConfig && formData.phone && (
                  <p className="text-xs text-muted-foreground">
                    Format: {phoneConfig.format}
                  </p>
                )}
                {!formData.country && (
                  <p className="text-xs text-muted-foreground">
                    Please select a country first
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 pb-8 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
