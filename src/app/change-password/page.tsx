'use client'

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordPolicy } from '@/lib/services/password.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

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
      // Call API to change password
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // After successful password change, either redirect to dashboard or logout based on configuration
      setTimeout(() => {
        if (user?.passwordChangeRequired) {
          // If this was a required password change, log the user out and have them log in again
          console.log('Required password change completed. Logging out...');
          logout();
          // We don't need to redirect as logout will handle that
        } else {
          // For normal password changes, just redirect to dashboard
          router.push('/dashboard');
        }
      }, 1500); // Show success message for 1.5 seconds before redirecting
      setIsSubmitting(false);
    } catch (error: any) {
      setErrors([error.message]);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      
      {user?.passwordChangeRequired && (
        <Alert className="mb-4 border-amber-500 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-700">Your password needs to be changed before you can continue.</AlertTitle>
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

        <Button type="submit" className="w-full">
          Change Password
        </Button>
      </form>
    </div>
  );
} 