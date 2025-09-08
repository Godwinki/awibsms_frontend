import axiosInstance from '@/lib/axios';

export interface Branch {
  id: string;
  companyId: string;
  branchCode: string;
  name: string;
  displayName: string;
  region: string;
  district?: string;
  ward?: string;
  street?: string;
  branchType: 'MAIN' | 'SUB_BRANCH' | 'AGENT' | 'KIOSK';
  status: 'active' | 'inactive' | 'suspended';
  isActive: boolean;
  isHeadOffice: boolean;
  primaryPhone?: string;
  email?: string;
  servicesOffered?: string[];
  accountNumberPrefix: string;
  lastAccountNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchData {
  branchCode: string;
  name: string;
  displayName: string;
  region: string;
  district?: string;
  ward?: string;
  street?: string;
  branchType: 'MAIN' | 'SUB_BRANCH' | 'AGENT' | 'KIOSK';
  primaryPhone?: string;
  email?: string;
  servicesOffered?: string[];
  accountNumberPrefix: string;
}

export interface UpdateBranchData {
  name?: string;
  displayName?: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  branchType?: 'MAIN' | 'SUB_BRANCH' | 'AGENT' | 'KIOSK';
  status?: 'active' | 'inactive' | 'suspended';
  primaryPhone?: string;
  email?: string;
  servicesOffered?: string[];
  accountNumberPrefix?: string;
}

export const branchService = {
  // Get all branches
  async getAllBranches(): Promise<Branch[]> {
    try {
      const response = await axiosInstance.get('/branches');
      return response.data.data?.branches || response.data.branches || [];
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch branches';
      throw new Error(errorMessage);
    }
  },

  // Get active branches only
  async getActiveBranches(): Promise<Branch[]> {
    try {
      const response = await axiosInstance.get('/branches?status=active');
      return response.data.data?.branches || response.data.branches || [];
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch active branches';
      throw new Error(errorMessage);
    }
  },

  // Get branch by ID
  async getBranchById(id: string): Promise<Branch> {
    try {
      const response = await axiosInstance.get(`/branches/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch branch';
      throw new Error(errorMessage);
    }
  },

  // Create new branch
  async createBranch(branchData: CreateBranchData): Promise<Branch> {
    try {
      const response = await axiosInstance.post('/branches', branchData);
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create branch';
      throw new Error(errorMessage);
    }
  },

  // Update branch
  async updateBranch(id: string, branchData: UpdateBranchData): Promise<Branch> {
    try {
      const response = await axiosInstance.patch(`/branches/${id}`, branchData);
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update branch';
      throw new Error(errorMessage);
    }
  },

  // Delete branch
  async deleteBranch(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/branches/${id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete branch';
      throw new Error(errorMessage);
    }
  },

  // Toggle branch status
  async toggleBranchStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<Branch> {
    try {
      const response = await axiosInstance.patch(`/branches/${id}/status`, { status });
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update branch status';
      throw new Error(errorMessage);
    }
  },

  // Get branch statistics
  async getBranchStats(id: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/branches/${id}/stats`);
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch branch statistics';
      throw new Error(errorMessage);
    }
  },

  // Check if branch code is available
  async checkBranchCodeAvailability(branchCode: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get(`/branches/check-code/${branchCode}`);
      return response.data.available;
    } catch (error: any) {
      return false;
    }
  },

  // Get current user's branch
  async getCurrentUserBranch(): Promise<Branch | null> {
    try {
      const response = await axiosInstance.get('/auth/user/branch');
      return response.data.data || response.data || null;
    } catch (error: any) {
      console.error('Failed to get current user branch:', error);
      return null;
    }
  }
};

export default branchService;
