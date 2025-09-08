'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, ArrowLeft, Key, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function UnlockPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'email-otp' | 'password' | 'success'>('email-otp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Email and OTP step
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // Password step
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // User data after OTP verification
  const [userData, setUserData] = useState<any>(null);

  const verifyOTP = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.post('/auth/unlock/verify-otp-direct', {
        email: email.trim(),
        otp: otp
      });
      
      console.log('OTP verification response:', response.data);
      
      if (response.data.status === 'success') {
        console.log('Setting user data:', response.data.data);
        setUserData(response.data.data);
        console.log('Changing step to password');
        setStep('password');
        toast({
          title: "OTP Verified",
          description: "Please set a new password to complete the unlock process.",
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid email or verification code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.post('/auth/unlock/reset-password-direct', {
        email: email.trim(),
        password: password,
        adminId: userData?.adminId // Pass the admin ID from OTP verification
      });
      
      if (response.data.status === 'success') {
        setStep('success');
        toast({
          title: "Account Unlocked",
          description: "Your account has been successfully unlocked and password reset.",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=account-unlocked');
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Unlock Your Account</CardTitle>
          <CardDescription>
            {step === 'email-otp' && 'Enter your email and verification code'}
            {step === 'password' && 'Set a new password for your account'}
            {step === 'success' && 'Your account has been successfully unlocked'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'email-otp' && (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Enter your email address and the 6-digit verification code sent by the administrator.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                />
              </div>
              
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              
              {error && (
                <Alert className="bg-red-50 text-red-700 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={verifyOTP}
                disabled={loading || !email.trim() || otp.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>
            </div>
          )}

          {step === 'password' && userData && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Account:</strong> {userData.firstName} {userData.lastName}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> {userData.email}
                </p>
              </div>
              
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert className="bg-red-50 text-red-700 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={resetPassword}
                disabled={loading || !password || !confirmPassword}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password & Unlock Account'
                )}
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-700">
                  Account Unlocked Successfully!
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Your account has been unlocked and your password has been reset. 
                  You will be redirected to the login page shortly.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Continue to Login
              </Button>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
