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
      return <div>Loading...</div>;
    }

    if (!isAuthenticated || !hasPermission(requiredRoles)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 