import axiosInstance from '@/lib/axios';

export type UserRole = 
  | "admin"
  | "super_admin"
  | "manager"
  | "loan_officer"
  | "accountant"
  | "cashier"
  | "it"
  | "clerk"
  | "loan_board"
  | "board_director"
  | "marketing_officer"
  | "hr"; // Add hr role

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  profilePicture?: string;
  lastLogin?: Date;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: UserRole;
  password: string;
  branchId?: string;
}

export interface LockedAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  department?: string;
  role?: UserRole;
  lockoutUntil?: string;  // ISO date string
  failedLoginAttempts: number;
  lockReason?: string;
  lockedBy?: 'system' | 'admin';
  unlockRequested?: boolean;
  unlockRequestedAt?: string;
  status: string;
  recentUnlockLogs?: any[];
}

export interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    department: string;
    status: string;
    passwordChangeRequired: boolean;
    profilePicture?: string;
  };
  token: string;
}

export const userService = {
  async getAllUsers(): Promise<UserData[]> {
    const response = await axiosInstance.get('auth/users');
    // Check for different response formats
    if (response.data.data && response.data.data.users) {
      return response.data.data.users;
    } else if (response.data.users) {
      return response.data.users;
    } else {
      // If no nested structure, return the data directly (fallback)
      return Array.isArray(response.data) ? response.data : [];
    }
  },

  async createUser(userData: CreateUserData) {
    try {
      const response = await axiosInstance.post('auth/register', userData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      throw new Error(errorMessage);
    }
  },

  async updateUser(id: string, userData: Partial<UserData>) {
    const response = await axiosInstance.patch(`auth/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await axiosInstance.delete(`auth/users/${id}`);
    return response.data;
  },

  async toggleUserStatus(id: string, status: 'active' | 'inactive' | 'suspended') {
    const response = await axiosInstance.patch(`auth/users/${id}`, { status });
    return response.data;
  },

  async getLockedAccounts(): Promise<LockedAccount[]> {
    try {
      const response = await axiosInstance.get('/auth/unlock/admin/locked-accounts');
      return response.data.data.users || response.data.data.lockedAccounts || [];
    } catch (error: any) {
      console.error('Error fetching locked accounts:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to retrieve locked accounts';
      throw new Error(errorMessage);
    }
  },

  async unlockAccount(id: string, reason?: string) {
    try {
      const response = await axiosInstance.post(`/auth/unlock/admin/unlock-account/${id}`, {
        reason: reason || 'Admin-initiated unlock'
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to unlock account';
      throw new Error(errorMessage);
    }
  },

  async updateProfile(userData: Partial<UserData>) {
    try {
      const { id, ...dataWithoutId } = userData;
      const response = await axiosInstance.patch('auth/profile', dataWithoutId);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  // Role assignment methods
  async getUserRoles(userId: string) {
    try {
      const response = await axiosInstance.get(`auth/users/${userId}/roles`);
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get user roles';
      throw new Error(errorMessage);
    }
  },

  async assignRoleToUser(userId: string, roleId: string) {
    try {
      const response = await axiosInstance.post(`auth/users/${userId}/roles`, { roleId });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to assign role to user';
      throw new Error(errorMessage);
    }
  },

  async removeRoleFromUser(userId: string, roleId: string) {
    try {
      const response = await axiosInstance.delete(`auth/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to remove role from user';
      throw new Error(errorMessage);
    }
  },
};