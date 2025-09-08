'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Building2 } from 'lucide-react';
import OnboardingService, { SystemStatus } from '@/lib/services/onboarding.service';

interface SystemCheckProps {
  children: React.ReactNode;
}

export default function SystemCheck({ children }: SystemCheckProps) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  useEffect(() => {
    if (systemStatus && !loading) {
      handleRouting();
    }
  }, [systemStatus, loading]);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statusData = await OnboardingService.getSystemStatus();
      setSystemStatus(statusData);
    } catch (error) {
      console.error('System status check failed:', error);
      setError(error instanceof Error ? error.message : 'System check failed');
      
      // If we can't reach the backend, assume we need onboarding
      setSystemStatus({
        isInitialized: false,
        hasCompany: false,
        hasAdminUser: false,
        hasMainBranch: false,
        needsOnboarding: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRouting = () => {
    if (!systemStatus || hasRedirected) return;

    const currentPath = pathname || '/';
    const isOnboardingRoute = currentPath === '/onboarding';
    const isProtectedRoute = currentPath.startsWith('/dashboard') || 
                            currentPath.startsWith('/members') || 
                            currentPath.startsWith('/accounting') || 
                            currentPath.startsWith('/budget');

    console.log('System Status:', systemStatus);
    console.log('Current Path:', currentPath);
    console.log('Needs Onboarding:', systemStatus.needsOnboarding);
    console.log('Is Protected Route:', isProtectedRoute);

    // If system needs onboarding, only redirect from non-protected and non-onboarding routes
    if (systemStatus.needsOnboarding && !isOnboardingRoute && !isProtectedRoute) {
      console.log('Redirecting to onboarding from public route...');
      setHasRedirected(true);
      router.push('/onboarding');
      return;
    }

    // If system is ready but user is on onboarding page, redirect to home
    if (!systemStatus.needsOnboarding && isOnboardingRoute) {
      console.log('System initialized, redirecting from onboarding to home...');
      setHasRedirected(true);
      router.push('/');
      return;
    }

    // Don't redirect from protected routes - let AuthGuard handle authentication
  };

  // Show loading screen while checking system status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Checking System Status
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your SACCO setup...
          </p>
        </div>
      </div>
    );
  }

  // Show error screen if system check failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md">
          <Building2 className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            System Check Failed
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the backend system. Please check your connection and try again.
          </p>
          <p className="text-sm text-red-600 mb-4">
            Error: {error}
          </p>
          <button
            onClick={checkSystemStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render children once system status is determined
  return <>{children}</>;
}

export { SystemCheck };
