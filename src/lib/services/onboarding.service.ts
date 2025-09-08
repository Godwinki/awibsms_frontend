import axiosInstance from '@/lib/axios';

export interface SystemStatus {
  isInitialized: boolean;
  hasCompany: boolean;
  hasAdminUser: boolean;
  hasMainBranch: boolean;
  needsOnboarding: boolean;
  initializationDate?: string;
}

export interface CompanyInfo {
  companyName: string;
  companyCode: string;
  registrationNumber?: string;
  taxIdentificationNumber?: string;
  licenseNumber?: string;
  establishedDate?: string;
  headOfficeAddress?: string;
  city?: string;
  region?: string;
  country?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  website?: string;
}

export interface BranchInfo {
  name: string;
  branchCode: string;
  displayName?: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  primaryPhone?: string;
  email?: string;
  servicesOffered?: string[];
}

export interface AdminUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  nationalId?: string;
  dateOfBirth?: string;
}

export interface SetupOptions {
  createSampleData?: boolean;
  forcePasswordChange?: boolean;
  enableNotifications?: boolean;
  autoActivateFeatures?: boolean;
}

export interface OnboardingData {
  companyInfo: CompanyInfo;
  mainBranchInfo: BranchInfo;
  adminUserInfo: AdminUserInfo;
  setupOptions?: SetupOptions;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  data?: {
    company: {
      id: string;
      name: string;
      code: string;
    };
    mainBranch: {
      id: string;
      name: string;
      code: string;
    };
    adminUser: {
      id: string;
      email: string;
      fullName: string;
    };
    summary: any;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ValidationResponse {
  success: boolean;
  valid: boolean;
  message: string;
  step?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AvailabilityResponse {
  success: boolean;
  available: boolean;
  message: string;
}

class OnboardingService {
  /**
   * Get system initialization status
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      console.log('🔍 Frontend: Making API call to /system/onboarding/status');
      const response = await axiosInstance.get('/system/onboarding/status');
      console.log('🔍 Frontend: Raw response:', response);
      console.log('🔍 Frontend: Response data:', response.data);
      console.log('🔍 Frontend: Extracted data:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get system status:', error);
      throw error;
    }
  }

  /**
   * Start the onboarding process
   */
  static async startOnboarding(data: OnboardingData): Promise<OnboardingResponse> {
    try {
      const response = await axiosInstance.post('/system/onboarding/start', data);
      return response.data;
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      
      // Return error response in expected format
      if (error.response?.data) {
        return error.response.data;
      }
      
      throw error;
    }
  }

  /**
   * Validate onboarding data for a specific step
   */
  static async validateStep(step: string, data: any): Promise<ValidationResponse> {
    try {
      const response = await axiosInstance.post('/system/onboarding/validate', {
        step,
        data
      });
      return response.data;
    } catch (error: any) {
      console.error('Validation failed:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        valid: false,
        message: 'Validation failed',
        step
      };
    }
  }

  /**
   * Check if company code is available
   */
  static async checkCompanyCodeAvailability(companyCode: string): Promise<AvailabilityResponse> {
    try {
      const response = await axiosInstance.post('/system/onboarding/check-company-code', {
        companyCode
      });
      return response.data;
    } catch (error: any) {
      console.error('Company code check failed:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        available: false,
        message: 'Failed to check company code availability'
      };
    }
  }

  /**
   * Check if branch code is available
   */
  static async checkBranchCodeAvailability(branchCode: string): Promise<AvailabilityResponse> {
    try {
      const response = await axiosInstance.post('/system/onboarding/check-branch-code', {
        branchCode
      });
      return response.data;
    } catch (error: any) {
      console.error('Branch code check failed:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        available: false,
        message: 'Failed to check branch code availability'
      };
    }
  }

  /**
   * Reset system (development only)
   */
  static async resetSystem(confirmationCode: string): Promise<any> {
    try {
      const response = await axiosInstance.post('/system/onboarding/reset', {
        confirmationCode
      });
      return response.data;
    } catch (error: any) {
      console.error('System reset failed:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      throw error;
    }
  }
}

export default OnboardingService;
