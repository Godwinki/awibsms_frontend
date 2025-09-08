"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import TwoFactorVerification from "./two-factor-verification"
import { LoginResponse } from "@/lib/services/auth.service"

export function LoginForm() {
  const { login, error, clearError, setUserAfter2FA } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [localError, setLocalError] = useState("")
  const router = useRouter()
  const [lockoutTime, setLockoutTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPermanentlyLocked, setIsPermanentlyLocked] = useState(false);
  
  // 2FA states - combine into single state for better reliability
  const [twoFactorState, setTwoFactorState] = useState<{
    required: boolean;
    data: {
      userId: string;
      email: string;
      twoFactorMethod: string;
    } | null;
  }>({
    required: false,
    data: null
  });
  
  // Ref to prevent multiple 2FA state updates
  const twoFactorSet = useRef(false);

  // Track component mounting/unmounting
  useEffect(() => {
    // Restore 2FA state from sessionStorage if it exists
    const storedTwoFactor = sessionStorage.getItem('twoFactorPending');
    if (storedTwoFactor) {
      const data = JSON.parse(storedTwoFactor);
      setTwoFactorState({
        required: true,
        data
      });
      twoFactorSet.current = true;
    }
  }, []);

  // Track 2FA state changes
  useEffect(() => {
    // Optional: Add any side effects when 2FA state changes
  }, [twoFactorState]);

  // Clear messages when inputs change - but don't reset 2FA state
  useEffect(() => {
    if ((email || password) && !twoFactorState.required) {
      clearError();
      setLocalError("");
    }
  }, [email, password, clearError, twoFactorState.required]);

  // Check for session expiration message or password change success
  useEffect(() => {
    if (!searchParams) return;
    
    const message = searchParams.get('message');
    const passwordChanged = searchParams.get('password_changed');
    
    if (message === 'session-expired') {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
    } else if (passwordChanged === 'true') {
      toast({
        title: "Password Changed Successfully",
        description: "Your password has been updated. Please log in with your new credentials.",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
    }
  }, [searchParams, toast]);

  // Check for existing lockout on component mount
  useEffect(() => {
    const storedLockout = localStorage.getItem('accountLockout');
    if (storedLockout) {
      const lockoutData = JSON.parse(storedLockout);
      const now = new Date();
      const lockoutUntil = new Date(lockoutData.lockoutUntil);
      
      if (lockoutUntil > now) {
        setLockoutTime(lockoutData.lockoutUntil);
        setLocalError(lockoutData.message);
      } else {
        localStorage.removeItem('accountLockout');
      }
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!lockoutTime) return;

    const updateTimer = () => {
      const now = new Date();
      const lockoutEnd = new Date(lockoutTime);
      const diff = Math.max(0, Math.floor((lockoutEnd.getTime() - now.getTime()) / 1000));
      
      if (diff <= 0) {
        setLockoutTime(null);
        setTimeRemaining(0);
        localStorage.removeItem('accountLockout');
        clearError();
      } else {
        setTimeRemaining(diff);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime, clearError]);

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime || isPermanentlyLocked) return;
    
    setIsLoading(true);
    setLocalError("");

    try {
      const response = await login(email, password);
      
      // Check if 2FA is required
      if (response && response.status === 'requires_2fa') {
        // Store 2FA data in sessionStorage to persist across re-renders
        const twoFactorData = {
          userId: response.userId || response.user.id,
          email: response.user.email,
          twoFactorMethod: response.twoFactorMethod || 'email'
        };
        
        sessionStorage.setItem('twoFactorPending', JSON.stringify(twoFactorData));
        
        // Prevent multiple updates
        if (!twoFactorSet.current) {
          twoFactorSet.current = true;
          
          // Set 2FA state immediately
          setTwoFactorState({
            required: true,
            data: twoFactorData
          });
        }
        
        toast({
          title: "Two-Factor Authentication Required",
          description: "Please enter the verification code sent to your email.",
          variant: "default",
        });
        
        // For 2FA, we don't set loading to false as we're transitioning to 2FA view
        setIsLoading(false);
        return; // Exit early to prevent further execution
      } else {
        // Normal login flow without 2FA
        // Check if password change is required
        if (response && response.user?.passwordChangeRequired) {
          console.log('Password change required, redirecting to change password');
          
          // Store the response temporarily for after password change
          sessionStorage.setItem('pendingUserData', JSON.stringify(response));
          
          toast({
            title: "Password Change Required",
            description: "You must change your password before accessing the dashboard.",
            variant: "default",
          });
          
          // Redirect to change password page
          setIsRedirecting(true);
          setTimeout(() => {
            router.push('/change-password?reason=force');
          }, 1500);
          return;
        }
        
        // Normal successful login
        toast({
          title: "Login Successful!",
          description: "Welcome back! Redirecting to dashboard...",
          variant: "default",
        });
        
        // Set redirecting state and redirect after a short delay
        setIsRedirecting(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      // Check if it's a timeout error
      const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
      
      // Show error toast
      toast({
        title: "Login Failed",
        description: isTimeout 
          ? "Request timed out. Please check your connection and try again." 
          : err.message || "Failed to login. Please try again.",
        variant: "destructive",
      });
      
      if (err.permanentlyLocked) {
        setIsPermanentlyLocked(true);
        localStorage.setItem('accountPermanentLock', JSON.stringify({
          email,
          message: err.message
        }));
      } else if (err.lockoutUntil) {
        setLockoutTime(err.lockoutUntil);
      }
      
      const errorMessage = isTimeout 
        ? "Request timed out. Please check your connection and try again."
        : err.message || "Failed to login. Please try again.";
      
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerificationSuccess = (response: LoginResponse) => {
    console.log('2FA verification successful, setting user in AuthContext:', response);
    
    // Check if password change is required
    if (response.user?.passwordChangeRequired) {
      console.log('Password change required after 2FA, redirecting to change password');
      
      // Store the response temporarily for after password change
      sessionStorage.setItem('pendingUserData', JSON.stringify(response));
      sessionStorage.removeItem('twoFactorPending');
      
      toast({
        title: "Password Change Required",
        description: "You must change your password before accessing the dashboard.",
        variant: "default",
      });
      
      // Redirect to change password page
      router.push('/change-password?reason=force');
      return;
    }
    
    // Set user in AuthContext after successful 2FA (no password change required)
    setUserAfter2FA(response);
    
    sessionStorage.removeItem('twoFactorPending');
    toast({
      title: "Verification Successful",
      description: "Welcome back! Redirecting to dashboard...",
      variant: "default",
    });
    
    // Set redirecting state and redirect after a short delay
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };
  
  const handleVerificationCancel = () => {
    twoFactorSet.current = false;
    sessionStorage.removeItem('twoFactorPending');
    setTwoFactorState({
      required: false,
      data: null
    });
    setEmail("");
    setPassword("");
  };

  const renderAlert = () => {
    const errorMessage = error?.message || localError;
    if (errorMessage) {
      const isPermanentLock = error?.permanentlyLocked || isPermanentlyLocked;
      const isTemporaryLock = timeRemaining > 0;
      
      return (
        <Alert className="mb-4 bg-red-500/15 text-red-500 border-red-500/50">
          <XCircle className="h-4 w-4" />
          <AlertTitle>
            {isPermanentLock ? 'Account Permanently Locked' : 
             isTemporaryLock ? 'Temporarily Locked' : 
             'Login Failed'}
          </AlertTitle>
          <AlertDescription className="mt-1">
            {errorMessage}
            {!isPermanentLock && error?.attemptsRemaining !== undefined && error?.attemptsRemaining > 0 && (
              <p className="mt-1 font-medium">
                Warning: {error.attemptsRemaining} attempts remaining before permanent lockout
              </p>
            )}
            {!isPermanentLock && timeRemaining > 0 && (
              <p className="mt-1 font-medium">
                Please wait {formatTimeRemaining(timeRemaining)} before trying again
              </p>
            )}
            {isPermanentLock && (
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  Your account has been locked for security reasons.
                </p>
                <div className="mt-3">
                  <Link 
                    href="/unlock" 
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Unlock Account
                  </Link>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  // Add effect to check for permanent lockout on mount
  useEffect(() => {
    const storedPermanentLock = localStorage.getItem('accountPermanentLock');
    if (storedPermanentLock) {
      const lockData = JSON.parse(storedPermanentLock);
      setIsPermanentlyLocked(true);
      setLocalError(lockData.message);
    }
  }, []);

  if (twoFactorState.required && twoFactorState.data) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">AWIB SACCO</CardTitle>
          <CardDescription>
            Two-Factor Authentication Required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorVerification 
            userId={twoFactorState.data.userId}
            email={twoFactorState.data.email}
            onVerificationSuccess={handleVerificationSuccess}
            onCancel={handleVerificationCancel}
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">WealthGuard</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderAlert()}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/unlock"
                className="text-sm text-primary hover:underline"
              >
                Need help?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading dashboard...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Need help accessing your account?{" "}
          <Link href="/unlock" className="font-medium text-primary hover:underline">
            Get Help
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
