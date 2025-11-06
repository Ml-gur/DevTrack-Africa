import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  Edit
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { useAuth } from '../contexts/LocalOnlyAuthContext';
import { displayPhoneNumber, COUNTRY_PHONE_CONFIGS } from '../utils/phone-formatter';

interface ProfileViewerProps {
  userId: string;
  onBack: () => void;
  currentUserId: string;
}

export default function ProfileViewer({ 
  userId, 
  onBack, 
  currentUserId 
}: ProfileViewerProps) {
  const { profile } = useAuth();
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    // Check if viewing own profile
    setIsOwnProfile(userId === currentUserId);
  }, [userId, currentUserId]);

  // Helper function to format country display
  const formatCountry = (country: string) => {
    if (!country) return 'Not specified';
    
    const countryMap: { [key: string]: { name: string; flag: string } } = {
      'kenya': { name: 'Kenya', flag: '🇰🇪' },
      'tanzania': { name: 'Tanzania', flag: '🇹🇿' },
      'uganda': { name: 'Uganda', flag: '🇺🇬' },
      'rwanda': { name: 'Rwanda', flag: '🇷🇼' },
      'nigeria': { name: 'Nigeria', flag: '🇳🇬' },
      'ghana': { name: 'Ghana', flag: '🇬🇭' },
      'south_africa': { name: 'South Africa', flag: '🇿🇦' },
      'ethiopia': { name: 'Ethiopia', flag: '🇪🇹' },
      'morocco': { name: 'Morocco', flag: '🇲🇦' },
      'egypt': { name: 'Egypt', flag: '🇪🇬' },
      'other': { name: 'Other African Country', flag: '🌍' }
    };
    
    const countryData = countryMap[country];
    return countryData ? `${countryData.flag} ${countryData.name}` : country;
  };

  // Helper function to format phone display
  const formatPhoneDisplay = (phone: string, country: string) => {
    if (!phone) return 'Not provided';
    return displayPhoneNumber(phone, country);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!profile) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">Profile</h1>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6 bg-gradient-to-b from-blue-50 to-white">
          {/* Profile Header Card */}
          <Card className="border-blue-200 shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-blue-200">
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center text-white text-3xl font-semibold">
                      {getInitials(profile.fullName)}
                    </div>
                  </Avatar>
                </div>
                
                {/* Name */}
                <div className="space-y-2">
                  <h1 className="text-3xl text-gray-900">{profile.fullName}</h1>
                  <p className="text-gray-600">DevTrack Africa Member</p>
                </div>

                {/* Member Since */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Member since {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="border-blue-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <User className="h-5 w-5 text-blue-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{profile.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{formatPhoneDisplay(profile.phone, profile.country)}</p>
                </div>
              </div>

              {/* Country */}
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Country</p>
                  <p className="font-medium text-gray-900">{formatCountry(profile.country)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card className="border-blue-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Account Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Account Created</span>
                <span className="font-medium text-gray-900">{formatDate(profile.created_at)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-900">{formatDate(profile.updated_at)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">User ID</span>
                <span className="font-medium font-mono text-xs text-gray-900">{profile.userId}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Close Button */}
          <div className="flex justify-end">
            <Button 
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              Close Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
