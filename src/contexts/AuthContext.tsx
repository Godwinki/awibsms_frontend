'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/lib/services/auth.service';
import { userService } from '@/lib/services/user.service'; // Import userService for updateProfile functionality
import { useRouter } from 'next/navigation';
import axiosInstance, { setIsLoggingOut } from '@/lib/axios'; // Make sure axiosInstance is available if needed later

// Define available roles type
export type UserRole = 'admin' | 'manager' | 'loan_officer' | 'accountant' | 'cashier' | 'it' | 'clerk' | 'loan_board' | 'board_director' | 'marketing_officer' | 'hr';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  status: string;
  passwordChangeRequired: boolean;
  lastPasswordChangedAt?: string | null;
  passwordExpiresAt?: string | null;
  profilePicture?: string;
}

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
}

interface AuthError {
  status: string;
  message: string;
  attemptsRemaining?: number;
  lockoutUntil?: string;
  permanentlyLocked?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  error: AuthError | null;
  clearError: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role hierarchy - defines which roles can access what other roles' permissions
const roleHierarchy: Record<UserRole, UserRole[]> = {
  admin: ['admin', 'manager', 'loan_officer', 'accountant', 'cashier', 'it', 'clerk', 'loan_board', 'board_director', 'marketing_officer', 'hr'],
  manager: ['manager', 'loan_officer', 'accountant', 'cashier', 'clerk', 'hr'],
  loan_officer: ['loan_officer'],
  accountant: ['accountant'],
  cashier: ['cashier'],
  it: ['it'],
  clerk: ['clerk'],
  loan_board: ['loan_board'],
  board_director: ['board_director'],
  marketing_officer: ['marketing_officer'],
  hr: ['hr']
};

const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const router = useRouter();

  const clearError = () => setError(null);

  // Move logout function before its usage and memoize it
  const logout = useCallback(async () => {
    try {
      // Set flag to prevent session expired toast during intentional logout
      setIsLoggingOut(true);
      
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear all session storage
      sessionStorage.clear();
      
      // Force browser to not cache this logout action
      if (typeof window !== 'undefined') {
        // Clear browser cache by adding cache-busting parameters
        const timestamp = new Date().getTime();
        window.location.href = `/login?logout=true&t=${timestamp}`;
        
        // Force page reload to clear any cached data
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      if (typeof window !== 'undefined') {
        const timestamp = new Date().getTime();
        window.location.href = `/login?logout=true&t=${timestamp}`;
      }
    } finally {
      // Reset the flag after logout process
      setIsLoggingOut(false);
    }
  }, []);

  // Listen for storage changes (token removal by axios interceptor)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && event.newValue === null && user) {
        console.log('Token removed from storage, logging out user...');
        setUser(null);
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?message=session-expired';
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  useEffect(() => {
    const storedToken = authService.getToken();
    const storedUser = authService.getCurrentUser();

    if (storedToken && storedUser) {
      // Set auth header for axios instance on initial load if token exists
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setUser(storedUser);
      
      // Check if password change is required
      if (storedUser.passwordChangeRequired) {
        console.log('User requires password change, redirecting...');
        router.push('/change-password');
      }
    } else if (!storedToken && !storedUser) {
      // Only clear user if both token and stored user are missing
      setUser(null);
    }
    setLoading(false);
  }, [router]); // Removed user from dependency array to prevent infinite loop

  // Session timeout checker
  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime();

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        logout();
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    const activityHandler = () => setLastActivity(new Date());

    // Monitor user activity
    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keypress', activityHandler);
    window.addEventListener('click', activityHandler);
    window.addEventListener('scroll', activityHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keypress', activityHandler);
      window.removeEventListener('click', activityHandler);
      window.removeEventListener('scroll', activityHandler);
    };
  }, [user, lastActivity, logout]);

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    const userRolePermissions = roleHierarchy[user.role] || [];
    return requiredRoles.some(role => userRolePermissions.includes(role));
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('AuthContext: Attempting login...');
      const response = await authService.login(email, password);
      console.log('AuthContext: Login response:', response);
      
      // Cast the response.user to ensure role is of type UserRole
      const user: User = {
        id: response.user.id,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        role: response.user.role as UserRole,
        department: response.user.department,
        status: response.user.status,
        passwordChangeRequired: response.user.passwordChangeRequired || false,
        lastPasswordChangedAt: (response.user as any).lastPasswordChangedAt || null,
        passwordExpiresAt: (response.user as any).passwordExpiresAt || null,
        profilePicture: response.user.profilePicture
      };
      
      // Debug password change requirement
      console.log('Auth Login - User data:', response.user);
      console.log('Auth Login - Password change required (from server)?', user.passwordChangeRequired);
      console.log('Auth Login - Password expires at:', user.passwordExpiresAt);
      console.log('Auth Login - Last password changed at:', user.lastPasswordChangedAt);
      
      // Additional check - if password dates missing, force password change
      const missingPasswordDates = !user.lastPasswordChangedAt || !user.passwordExpiresAt;
      if (missingPasswordDates) {
        console.log('Frontend forcing password change due to missing password dates');
        user.passwordChangeRequired = true;
      }
      
      setUser(user);
      
      // Ensure token is set in axios headers immediately
      if (response.token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      }

      // Use timeout to ensure state is updated before redirection
      setTimeout(() => {
        // Double-check missing password dates one more time
        const missingDates = !user.lastPasswordChangedAt || !user.passwordExpiresAt;
        
        if (user.passwordChangeRequired || missingDates) {
          console.log('Password change required, redirecting...');
          router.push('/change-password');
        } else {
          console.log('No password change required, redirecting to dashboard...');
          router.push('/dashboard');
        }
      }, 100);
    } catch (err: any) {
      console.error('AuthContext: Login error:', err);
      const errorData = {
        status: 'error',
        message: err.response?.data?.message || err.message || 'An unexpected error occurred',
        lockoutUntil: err.response?.data?.lockoutUntil,
        attemptsRemaining: err.response?.data?.attemptsRemaining,
        permanentlyLocked: err.response?.data?.permanentlyLocked
      };
      setError(errorData);
      if (errorData.lockoutUntil) {
        localStorage.setItem('accountLockout', JSON.stringify({
          email,
          lockoutUntil: errorData.lockoutUntil,
          message: errorData.message
        }));
      }
      throw errorData;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserData>) => {
    try {
      const response = await userService.updateProfile(data);
      setUser(prev => prev ? { ...prev, ...data } : null);
      return response;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      error,
      clearError,
      hasPermission,
      updateProfile
    }}>
      {loading ? <div>Loading...</div> : children} {/* Optional: Show loading indicator */}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};