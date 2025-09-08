import axios from 'axios';
import axiosInstance from '@/lib/axios'; // Import the configured instance
import { UserRole } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface LoginResponse {
  status: string;
  message: string;
  token?: string;
  userId?: string;
  twoFactorMethod?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: UserRole;
    department?: string;
    status?: string;
    passwordChangeRequired?: boolean;
    profilePicture?: string;
    branchId?: string;
    branch?: {
      id: string;
      name: string;
      branchCode: string;
      displayName: string;
      branchType: string;
      isHeadOffice: boolean;
    };
    lastPasswordChangedAt?: string | null;
    passwordExpiresAt?: string | null;
  };
}

export interface OTPRequestResponse {
  status: string;
  message: string;
  expiresIn: number;
}

export interface OTPVerifyResponse extends LoginResponse {
  token: string;
}

export const authService = {
  async login(email: string, password: string, branchId?: string): Promise<LoginResponse> {
    try {
      console.log('AuthService: Sending login request...');
      const loginData: any = { email, password };
      if (branchId) {
        loginData.branchId = branchId;
      }
      
      // Use the axiosInstance instead of direct axios to ensure consistency
      const response = await axiosInstance.post('users/login', loginData);
      console.log('AuthService: Login response:', response.data);
      
      if (response.data.status === 'requires_2fa') {
        // Return the response for 2FA flow without setting token
        console.log('AuthService: 2FA required');
        return response.data;
      }
      
      if (response.data.token) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set auth header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('AuthService: Token stored and auth header set');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('AuthService: Login error:', error);
      throw error;
    }
  },

  async requestOTP(userId: string): Promise<OTPRequestResponse> {
    try {
      console.log('AuthService: Requesting OTP for user:', userId);
      const response = await axiosInstance.post('auth/2fa/request-otp', { userId });
      console.log('AuthService: OTP request response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('AuthService: OTP request error:', error);
      throw error;
    }
  },

  async verifyOTP(userId: string, otpCode: string): Promise<OTPVerifyResponse> {
    try {
      console.log('AuthService: Verifying OTP for user:', userId);
      const response = await axiosInstance.post('auth/2fa/verify-otp', {
        userId,
        otp: otpCode  // Backend expects 'otp', not 'otpCode'
      });
      console.log('AuthService: OTP verify response:', response.data);
      
      if (response.data.token) {
        // Store token and user data after successful 2FA
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set auth header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log('AuthService: Token stored and auth header set after 2FA');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('AuthService: OTP verify error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('AuthService: Logging out...');
      // Call logout endpoint if token exists
      const token = this.getToken();
      if (token) {
        try {
          await axiosInstance.post('auth/logout');
        } catch (error) {
          console.warn('AuthService: Logout endpoint failed, continuing with local cleanup');
        }
      }
    } catch (error) {
      console.warn('AuthService: Error during logout, continuing with cleanup');
    } finally {
      // Always clear local storage and headers
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      console.log('AuthService: Local cleanup completed');
    }
  },

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user'); // Clear invalid data
      localStorage.removeItem('token');
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  async changePassword(currentPassword: string, newPassword: string) {
    console.log('Sending change password request...');
    try {
      const response = await axiosInstance.post('auth/change-password', {
        currentPassword,
        newPassword
      });
      console.log('Change password response:', response);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Get branches available for login (no auth required)
  async getLoginBranches(): Promise<any[]> {
    try {
      const response = await axiosInstance.get('/branches/public');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to get login branches:', error);
      return [];
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  // Initialize auth state on app load
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};
