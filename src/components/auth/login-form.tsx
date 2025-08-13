"use client"

import { useState, useEffect } from "react"
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

export function LoginForm() {
  const { login, error, clearError } = useAuth()
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

  // Clear messages when inputs change
  useEffect(() => {
    if (email || password) {
      clearError();
      setLocalError("");
    }
  }, [email, password, clearError]);

  // Check for session expiration message
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'session-expired') {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
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
      await login(email, password);
      
      // Show success toast
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
      
    } catch (err: any) {
      // Show error toast
      toast({
        title: "Login Failed",
        description: err.message || "Failed to login. Please try again.",
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
      setLocalError(err.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            {!isPermanentLock && error?.attemptsRemaining !== undefined && (
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
              <p className="mt-1 text-sm">
                Your account has been locked for security reasons. Please contact an administrator to unlock your account.
              </p>
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
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
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
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Contact Administrator
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
