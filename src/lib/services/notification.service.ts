import axiosInstance from '@/lib/axios';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'EXPENSE' | 'LEAVE' | 'SYSTEM' | 'OTHER';
  status: 'UNREAD' | 'READ';
  resourceType?: string;
  resourceId?: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

class NotificationService {
  /**
   * Get user's notifications with pagination
   */
  async getNotifications(
    options: {
      page?: number;
      limit?: number;
      status?: 'UNREAD' | 'READ';
      type?: 'EXPENSE' | 'LEAVE' | 'SYSTEM' | 'OTHER';
    } = {}
  ): Promise<NotificationListResponse> {
    const { page = 1, limit = 20, status, type } = options;
    const params: Record<string, any> = { page, limit };
    
    if (status) params.status = status;
    if (type) params.type = type;
    
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  }
  
  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data.data.count;
  }
  
  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await axiosInstance.patch(`/notifications/${id}/mark-read`);
    return response.data.data;
  }
  
  /**
   * Mark all user's notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await axiosInstance.post('/notifications/mark-all-read');
  }
}

export const notificationService = new NotificationService();
