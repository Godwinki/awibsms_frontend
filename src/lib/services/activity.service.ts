import axiosInstance from '@/lib/axios';

export interface ActivityLogData {
  action: string;
  details?: Record<string, any>;
  status?: 'success' | 'failed' | 'warning' | 'info';
}

export interface ActivityLog {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  action: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning' | 'info';
  createdAt: string;
}

interface GetActivityLogsParams {
  startDate?: Date;
  endDate?: Date;
  type?: string;
}

class ActivityService {
  async getActivityLogs(params?: GetActivityLogsParams): Promise<ActivityLog[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate.toISOString());
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate.toISOString());
      }
      if (params?.type) {
        queryParams.append('type', params.type);
      }

      const response = await axiosInstance.get(
        `/activities?${queryParams.toString()}`
      );
      
      console.log('Activity logs response:', response.data);
      
      return response.data.data.activities;
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }

  async logActivity(data: ActivityLogData) {
    try {
      const response = await axiosInstance.post('/activities', data);
      return response.data;
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  }

  async logLogin(success: boolean, details?: Record<string, any>) {
    await this.logActivity({
      action: 'login',
      status: success ? 'success' : 'failed',
      details
    });
  }

  async logPasswordChange(success: boolean, details?: Record<string, any>) {
    await this.logActivity({
      action: 'password_change',
      status: success ? 'success' : 'failed',
      details
    });
  }

  async logSecurityQuestionUpdate(success: boolean, details?: Record<string, any>) {
    await this.logActivity({
      action: 'security_questions_update',
      status: success ? 'success' : 'failed',
      details
    });
  }

  async logAccountRecoveryAttempt(success: boolean, details?: Record<string, any>) {
    await this.logActivity({
      action: 'account_recovery',
      status: success ? 'success' : 'failed',
      details
    });
  }
}

export const activityService = new ActivityService(); 