'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';

export function withRoleProtection(
  WrappedComponent: React.ComponentType,
  requiredRoles: UserRole[]
) {
  return function ProtectedRoute(props: any) {
    const { hasPermission, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!loading && !hasPermission(requiredRoles)) {
        router.push('/unauthorized');
      }
    }, [loading, isAuthenticated, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || !hasPermission(requiredRoles)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 