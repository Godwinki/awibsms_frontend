'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordPolicy } from '@/lib/services/password.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForced, setIsForced] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if this is a forced password change from login
    const reason = searchParams.get('reason');
    if (reason === 'force') {
      setIsForced(true);
      
      // Try to get pending user data from sessionStorage
      const storedUserData = sessionStorage.getItem('pendingUserData');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setPendingUserData(userData);
          
          // Set the authorization header for API calls during forced change
          if (userData.token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
          }
        } catch (error) {
          console.error('Error parsing pending user data:', error);
        }
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');
    setIsSubmitting(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrors(['New passwords do not match']);
      setIsSubmitting(false);
      return;
    }

    // Validate password policy
    const { isValid, errors: policyErrors } = PasswordPolicy.validatePassword(newPassword);
    if (!isValid) {
      setErrors(policyErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the existing change-password endpoint for both forced and normal changes
      const endpoint = '/auth/change-password';
      
      // Call API to change password
      const response = await axiosInstance.post(endpoint, {
        currentPassword,
        newPassword
      });

      const data = response.data;

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // After successful password change
      setTimeout(() => {
        if (isForced && pendingUserData) {
          // For forced password change from login, redirect back to login page
          console.log('Forced password change completed. Redirecting to login page...');
          
          // Clear pending data
          sessionStorage.removeItem('pendingUserData');
          
          // Clear any existing auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Remove Authorization header
          delete axiosInstance.defaults.headers.common['Authorization'];
          
          // Clear cookies
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax";
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax";
          
          // Redirect to login with success message
          const timestamp = new Date().getTime();
          window.location.replace(`/login?password_changed=true&t=${timestamp}`);
        } else if (user?.passwordChangeRequired) {
          // If this was a required password change for logged-in user, force logout and redirect to login
          console.log('Required password change completed. Redirecting to login...');
          
          // Clear session storage
          sessionStorage.removeItem('pendingUserData');
          
          // Manually clear local storage without calling the logout API
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Remove Authorization header
          delete axiosInstance.defaults.headers.common['Authorization'];
          
          // Clear cookies
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax";
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax";
          
          // Force direct navigation to login page with timestamp to prevent caching
          const timestamp = new Date().getTime();
          window.location.replace(`/login?password_changed=true&t=${timestamp}`);
        } else {
          // For normal password changes, just redirect to dashboard
          router.push('/dashboard');
        }
      }, 1500); // Show success message for 1.5 seconds before redirecting
      setIsSubmitting(false);
    } catch (error: any) {
      setErrors([error.response?.data?.message || error.message || 'Failed to change password']);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isForced ? 'Set New Password' : 'Change Password'}
      </h1>
      
      {(isForced || user?.passwordChangeRequired) && (
        <Alert className="mb-4 border-amber-500 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-700">
            {isForced 
              ? 'You must set a new password before accessing your account.'
              : 'Your password needs to be changed before you can continue.'
            }
          </AlertTitle>
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert className="mb-4 border-destructive text-destructive">
          <AlertCircle className="h-5 w-5" />
          <ul className="list-disc pl-4 mt-2">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle className="text-green-700">{success}</AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Current Password</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={isForced ? 'Enter your current password' : ''}
            required
          />
        </div>

        <div>
          <label className="block mb-2">New Password</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Confirm New Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Changing Password...' : (isForced ? 'Set New Password' : 'Change Password')}
        </Button>
      </form>
    </div>
  );
} 