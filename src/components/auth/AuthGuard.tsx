'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const PROTECTED_ROUTES = ['/dashboard', '/members', '/accounting', '/budget'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't run checks while still loading or if already redirected
    if (loading || hasRedirected) return;

    const currentPath = pathname || '/';
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );

    // Only redirect if accessing protected routes without authentication
    if (isProtectedRoute && !isAuthenticated) {
      console.log('AuthGuard: Protected route requires authentication, redirecting to login...');
      setHasRedirected(true);
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router, hasRedirected]);

  return <>{children}</>;
}
