import axios from 'axios';
import axiosInstance from '@/lib/axios'; // Import the configured instance
import { UserRole } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface LoginResponse {
  status: string;
  message: string;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    department: string;
    status: string;
    passwordChangeRequired: boolean;
    profilePicture?: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('AuthService: Sending login request...');
      // Use the axiosInstance instead of direct axios to ensure consistency
      const response = await axiosInstance.post('users/login', { email, password });
      console.log('AuthService: Login response:', response.data);
      
      if (response.data.token) {
        // Store token in localStorage for client-side access
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Also set token as a cookie for middleware/SSR
        document.cookie = `token=${response.data.token}; path=/; max-age=86400; samesite=lax`;
        
        // Add token to axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error: any) {
      console.error('AuthService: Login error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    
    try {
      if (token) {
        // Call backend logout endpoint first
        await axiosInstance.post('users/logout');
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clean up local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Also clear the token cookie
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax";
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=lax";
      
      // Remove Authorization header
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  getCurrentUser() {
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
      const response = await axiosInstance.post('users/change-password', {
        currentPassword,
        newPassword
      });
      console.log('Change password response:', response);
      return response;
    } catch (error) {
      console.error('Change password error in service:', error);
      throw error;
    }
  }
}; 