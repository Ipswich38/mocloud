'use client';

import { useState } from 'react';
import { useRequireClinic } from '@/lib/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClinicLayout } from '@/components/clinic/ClinicLayout';
import { Settings, KeyRound, Building2, User, CheckCircle } from 'lucide-react';

export default function ClinicSettingsPage() {
  const { profile, loading } = useRequireClinic();

  // Password change states
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Profile update states
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [contactEmail, setContactEmail] = useState(profile?.email || '');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);

    try {
      // Simulate password change API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In production, this would call the change_clinic_password function
      console.log('Password change:', {
        username: profile?.username,
        currentPassword,
        newPassword
      });

      setPasswordChanged(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      // Simulate profile update
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProfileUpdated(true);
      setTimeout(() => setProfileUpdated(false), 3000);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <ClinicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ClinicLayout>
    );
  }

  return (
    <ClinicLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Settings</h1>
          <p className="mt-2 text-gray-600">Manage your clinic account and preferences</p>
        </div>

        {/* Password Change Required Alert */}
        {profile?.must_change_password && !passwordChanged && (
          <Alert className="border-orange-200 bg-orange-50">
            <KeyRound className="h-4 w-4" />
            <AlertDescription className="text-orange-700">
              <strong>Password Change Required:</strong> You must change your password before using the system.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Messages */}
        {passwordChanged && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              Password changed successfully!
            </AlertDescription>
          </Alert>
        )}

        {profileUpdated && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter your new password"
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile?.username || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your clinic name"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="clinic@example.com"
                  />
                </div>

                <div>
                  <Label>Role</Label>
                  <Input
                    value="Clinic Administrator"
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updatingProfile}
                  variant="outline"
                  className="w-full"
                >
                  {updatingProfile ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Clinic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Clinic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label>Clinic ID</Label>
                <div className="mt-1 text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                  {profile?.clinic_id}
                </div>
              </div>

              <div>
                <Label>Clinic Name</Label>
                <div className="mt-1 text-gray-900">
                  {profile?.clinic_name || 'Not specified'}
                </div>
              </div>

              <div>
                <Label>Account Status</Label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>

              <div>
                <Label>Last Login</Label>
                <div className="mt-1 text-gray-900">
                  {new Date().toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div>
                <Label>Account Created</Label>
                <div className="mt-1 text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </div>
              </div>

              <div>
                <Label>Password Status</Label>
                <div className="mt-1">
                  {profile?.must_change_password && !passwordChanged ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Change Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Current
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-gray-600">Download your clinic's data including cards and appointments</p>
                </div>
                <Button variant="outline" disabled>
                  Export Data
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Contact Support</h4>
                  <p className="text-sm text-gray-600">Get help with technical issues or questions</p>
                </div>
                <Button variant="outline">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClinicLayout>
  );
}