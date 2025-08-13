'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Don't run checks while still loading
    if (loading) return;

    // Force authentication check for Chrome caching issues
    const forceAuthCheck = () => {
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      
      console.log('AuthGuard check - Path:', currentPath, 'Token:', !!token, 'User:', !!user, 'IsAuthenticated:', isAuthenticated);
      
      // Only check dashboard pages - let login page render normally
      if (currentPath.startsWith('/dashboard')) {
        // If we're on a dashboard page but no token exists, force redirect
        if (!token) {
          console.log('No token found on dashboard page, redirecting to login...');
          localStorage.clear();
          sessionStorage.clear();
          const timestamp = new Date().getTime();
          window.location.replace(`/login?message=session-expired&t=${timestamp}`);
          return;
        }
        
        // If we're on dashboard page but user is not authenticated, force redirect
        if (!isAuthenticated || !user) {
          console.log('Not authenticated on dashboard page, redirecting to login...');
          localStorage.clear();
          sessionStorage.clear();
          const timestamp = new Date().getTime();
          window.location.replace(`/login?message=unauthorized&t=${timestamp}`);
          return;
        }
      }
    };

    // Run the check immediately and after a short delay
    forceAuthCheck();
    const timeoutId = setTimeout(forceAuthCheck, 1000);

    // Listen for storage events (token removal from other tabs/windows)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && event.newValue === null && user) {
        console.log('Token removed in another tab, showing logout message...');
        toast({
          title: "Session Expired",
          description: "Your session has expired in another tab. You will be redirected to login.",
          variant: "destructive",
        });
        
        // Small delay to allow toast to show before redirect
        setTimeout(() => {
          const timestamp = new Date().getTime();
          window.location.replace(`/login?message=session-expired&t=${timestamp}`);
        }, 2000);
      }
    };

    // Listen for axios interceptor events (custom events)
    const handleTokenExpiration = () => {
      console.log('Token expiration event received...');
      if (isAuthenticated) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. You will be redirected to login.",
          variant: "destructive",
        });
      }
    };

    // Listen for unhandled promise rejections (additional safety net)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.response?.status === 401 && isAuthenticated) {
        console.log('Unhandled 401 error detected...');
        // This is already handled by axios interceptor, so we just prevent console spam
        event.preventDefault();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('token-expired', handleTokenExpiration);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('token-expired', handleTokenExpiration);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [user, toast, isAuthenticated, loading]);

  // Show loading state while authentication is being checked
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Only protect dashboard pages - allow other pages to render
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  if (currentPath.startsWith('/dashboard')) {
    // Don't render dashboard children if not authenticated
    if (!isAuthenticated || !user) {
      // Force redirect if somehow we're still on dashboard without auth
      const timestamp = new Date().getTime();
      window.location.replace(`/login?message=unauthorized&t=${timestamp}`);
      return null;
    }
  }

  return <>{children}</>;
}
