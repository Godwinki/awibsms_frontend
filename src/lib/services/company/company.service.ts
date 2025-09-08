import axiosInstance from '@/lib/axios';

export interface CompanySettings {
  id: string;
  companyName: string;
  companyCode: string;
  displayName?: string;
  registrationNumber?: string;
  taxIdentificationNumber?: string;
  licenseNumber?: string;
  establishedDate?: string;
  headOfficeAddress?: string;
  city?: string;
  region?: string;
  country?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
  website?: string;
  logo?: string;
  description?: string;
  vision?: string;
  mission?: string;
  coreValues?: string[];
  isInitialized: boolean;
  initializedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyUpdateData {
  companyName?: string;
  displayName?: string;
  registrationNumber?: string;
  taxIdentificationNumber?: string;
  licenseNumber?: string;
  establishedDate?: string;
  headOfficeAddress?: string;
  city?: string;
  region?: string;
  country?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
  website?: string;
  description?: string;
  vision?: string;
  mission?: string;
  coreValues?: string[];
}

export interface CompanyResponse {
  success: boolean;
  message: string;
  data?: CompanySettings;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface CompanyStats {
  totalMembers: number;
  totalBranches: number;
  totalUsers: number;
  establishedYears: number;
  totalAssets?: number;
  totalLoans?: number;
  totalSavings?: number;
}

export interface CompanyDashboard {
  company: CompanySettings;
  stats: CompanyStats;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

class CompanyService {
  /**
   * Get company settings/details
   */
  static async getCompanySettings(): Promise<CompanySettings> {
    try {
      const response = await axiosInstance.get('/organization/company/settings');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get company settings:', error);
      throw error;
    }
  }

  /**
   * Update company settings
   */
  static async updateCompanySettings(data: CompanyUpdateData): Promise<CompanyResponse> {
    try {
      const response = await axiosInstance.put('/organization/company/settings', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update company settings:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Failed to update company settings',
        errors: [{ field: 'general', message: error.message || 'Unknown error' }]
      };
    }
  }

  /**
   * Get company dashboard data (stats, activities, etc.)
   */
  static async getCompanyDashboard(): Promise<CompanyDashboard> {
    try {
      const response = await axiosInstance.get('/organization/company/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get company dashboard:', error);
      throw error;
    }
  }

  /**
   * Get company statistics
   */
  static async getCompanyStats(): Promise<CompanyStats> {
    try {
      const response = await axiosInstance.get('/organization/company/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get company stats:', error);
      throw error;
    }
  }

  /**
   * Upload company logo
   */
  static async uploadLogo(file: File): Promise<CompanyResponse> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axiosInstance.post('/organization/company/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to upload logo:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Failed to upload logo',
        errors: [{ field: 'logo', message: error.message || 'Upload failed' }]
      };
    }
  }

  /**
   * Remove company logo
   */
  static async removeLogo(): Promise<CompanyResponse> {
    try {
      const response = await axiosInstance.delete('/organization/company/logo');
      return response.data;
    } catch (error: any) {
      console.error('Failed to remove logo:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Failed to remove logo'
      };
    }
  }

  /**
   * Validate company code availability (for updates)
   */
  static async validateCompanyCode(companyCode: string, currentCode?: string): Promise<{ available: boolean; message: string }> {
    try {
      const response = await axiosInstance.post('/organization/company/validate-code', {
        companyCode,
        currentCode
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to validate company code:', error);
      return {
        available: false,
        message: 'Validation failed'
      };
    }
  }

  /**
   * Get company history/audit trail
   */
  static async getCompanyHistory(page = 1, limit = 20): Promise<{
    history: Array<{
      id: string;
      action: string;
      description: string;
      changes: any;
      user: {
        id: string;
        name: string;
        email: string;
      };
      timestamp: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  }> {
    try {
      const response = await axiosInstance.get(`/organization/company/history?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get company history:', error);
      throw error;
    }
  }
}

export default CompanyService;
