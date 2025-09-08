'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface UnlockTokenData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  unlockRequested: boolean;
  unlockTokenExpires: string;
}

export default function UnlockAccountPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const token = params.token as string;
  
  const [step, setStep] = useState<'verify' | 'otp' | 'password' | 'success'>('verify');
  const [tokenData, setTokenData] = useState<UnlockTokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Step
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Password Step
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get(`/auth/unlock/unlock/verify-token/${token}`);
      
      if (response.data.status === 'success') {
        setTokenData(response.data.data);
        setStep('otp');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid or expired unlock token';
      setError(errorMessage);
      toast({
        title: "Token Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setOtpError('');
      
      const response = await axiosInstance.post(`/auth/unlock/unlock/verify-otp/${token}`, {
        otp: otp
      });
      
      if (response.data.status === 'success') {
        setStep('password');
        toast({
          title: "OTP Verified",
          description: "Please set a new password to complete the unlock process.",
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP';
      setOtpError(errorMessage);
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
      
      const response = await axiosInstance.post(`/auth/unlock/unlock/reset-password/${token}`, {
        password: password
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

  const requestNewOTP = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/auth/unlock/unlock/request-otp/${token}`);
      toast({
        title: "New OTP Sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send new OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify' && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Verifying unlock token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Token Verification Failed</CardTitle>
            <CardDescription>
              The unlock token is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Account Unlock</CardTitle>
          <CardDescription>
            {step === 'otp' && 'Enter the verification code sent to your email'}
            {step === 'password' && 'Set a new password for your account'}
            {step === 'success' && 'Your account has been successfully unlocked'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {tokenData && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                <strong>Account:</strong> {tokenData.firstName} {tokenData.lastName}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> {tokenData.email}
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setOtpError('');
                  }}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                {otpError && (
                  <p className="text-sm text-red-600 mt-1">{otpError}</p>
                )}
              </div>
              
              <Button 
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={requestNewOTP}
                disabled={loading}
                className="w-full"
              >
                Request New Code
              </Button>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
