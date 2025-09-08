import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface TwoFactorVerificationProps {
  userId: string;
  email: string;
  onVerificationSuccess: (response: any) => void;
  onCancel: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  userId,
  email,
  onVerificationSuccess,
  onCancel
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds (since backend sends 10min expiry)
  const [otpRequested, setOtpRequested] = useState(true); // Set to true since OTP is already sent during login

  // Remove automatic OTP request since it's already sent during login
  // useEffect(() => {
  //   requestOtp();
  // }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpRequested && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, otpRequested]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const requestOtp = async () => {
    try {
      setRequestingOtp(true);
      setError(null);
      const response = await authService.requestOTP(userId);
      setOtpRequested(true);
      // Reset countdown based on server response or default to 5 minutes
      setCountdown(response.expiresIn || 300);
    } catch (error: any) {
      setError(error.message || 'Failed to request verification code. Please try again.');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a complete 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await authService.verifyOTP(userId, otp);
      onVerificationSuccess(response);
    } catch (error: any) {
      setError(
        error.message || 
        'Invalid verification code. Please try again or request a new code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center mb-2">
        Two-Factor Authentication
      </h2>
      
      <p className="text-sm text-center text-gray-500 mb-4">
        A verification code has been sent to <strong>{email}</strong>. 
        Please enter the code to continue.
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="otp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Verification Code
          </label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
              if (value.length <= 6) {
                setOtp(value);
              }
              if (error && value.length > 0) {
                setError(null);
              }
            }}
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter 6-digit code"
            disabled={loading || requestingOtp}
            className="w-full text-center text-lg tracking-widest"
          />
        </div>
        
        {otpRequested && (
          <p className="text-xs text-center text-gray-500">
            Code expires in: {formatTime(countdown)}
          </p>
        )}
        
        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={requestOtp}
            disabled={loading || requestingOtp || countdown > 270} // Disable for 30 seconds after request
            className="flex-1"
          >
            {requestingOtp ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Request New Code
          </Button>
          
          <Button
            type="submit"
            disabled={loading || requestingOtp || otp.length !== 6}
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Verify
          </Button>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={loading || requestingOtp}
          className="w-full"
        >
          Cancel and Sign Out
        </Button>
      </form>
    </div>
  );
};

export default TwoFactorVerification;
