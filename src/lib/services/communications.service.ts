// communications.service.ts
import axiosInstance from '@/lib/axios';

// Types for Contact Groups
export interface ContactGroup {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  members?: GroupMember[];
}

export interface GroupMember {
  id: number;
  groupId: number;
  memberId: number;
  phoneNumber: string;
  addedAt: string;
  member?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  memberIds?: number[];
}

export interface AddMembersRequest {
  memberIds: number[];
}

// Types for SMS Messages
export interface SmsMessage {
  id: number;
  message: string;
  recipientPhoneNumber: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  externalId?: string;
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  campaignId?: number;
}

export interface SendSMSRequest {
  phoneNumber?: string;
  message: string;
  groupIds?: number[];
  memberIds?: number[];
}

export interface TestSMSRequest {
  phoneNumber: string;
  message?: string;
}

// Types for SMS Campaigns
export interface SmsCampaign {
  id: number;
  name: string;
  message: string;
  status: 'draft' | 'approved' | 'sending' | 'completed' | 'cancelled';
  scheduledFor?: string;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  approvedBy?: number;
  sentAt?: string;
  completedAt?: string;
  groups?: ContactGroup[];
  messages?: SmsMessage[];
}

export interface CreateCampaignRequest {
  name: string;
  message: string;
  groupIds?: number[];
  memberIds?: number[];
  scheduledFor?: string;
}

// Types for SMS Balance
export interface SmsBalance {
  id: number;
  currentBalance: number;
  lastCheckedAt: string;
  provider: string;
  currency: string;
}

export interface BalanceHistory {
  id: number;
  previousBalance: number;
  currentBalance: number;
  changeAmount: number;
  changeType: 'usage' | 'topup' | 'adjustment';
  description?: string;
  createdAt: string;
}

export interface BalanceStats {
  totalSent: number;
  totalCost: number;
  currentBalance: number;
  averageCostPerSMS: number;
  todayUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
}

export interface SMSStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalCost: number;
  deliveryRate: number;
  averageCostPerSMS: number;
  todayStats: {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  };
  weeklyStats: {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  };
  monthlyStats: {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  };
}

class CommunicationsService {
  // ==================== CONTACT GROUPS ====================
  
  /**
   * Get all contact groups
   */
  async getContactGroups(page = 1, limit = 10): Promise<{
    groups: ContactGroup[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await axiosInstance.get(`/communications/groups?page=${page}&limit=${limit}`);
    const data = response.data.data;
    
    return {
      groups: data.groups || [],
      total: data.pagination?.totalItems || 0,
      page: data.pagination?.currentPage || page,
      totalPages: data.pagination?.totalPages || 1
    };
  }

  /**
   * Get a specific contact group with members
   */
  async getContactGroup(id: number): Promise<ContactGroup> {
    const response = await axiosInstance.get(`/communications/groups/${id}`);
    return response.data.data;
  }

  /**
   * Create a new contact group
   */
  async createContactGroup(groupData: CreateGroupRequest): Promise<ContactGroup> {
    const response = await axiosInstance.post('/communications/groups', groupData);
    return response.data.data;
  }

  /**
   * Update a contact group
   */
  async updateContactGroup(id: number, groupData: Partial<CreateGroupRequest>): Promise<ContactGroup> {
    const response = await axiosInstance.put(`/communications/groups/${id}`, groupData);
    return response.data.data;
  }

  /**
   * Delete a contact group
   */
  async deleteContactGroup(id: number, hardDelete: boolean = false): Promise<void> {
    const params = hardDelete ? '?hardDelete=true' : '';
    await axiosInstance.delete(`/communications/groups/${id}${params}`);
  }

  /**
   * Add members to a group
   */
  async addMembersToGroup(groupId: number, memberData: AddMembersRequest): Promise<GroupMember[]> {
    const response = await axiosInstance.post(`/communications/groups/${groupId}/members`, memberData);
    return response.data.data;
  }

  /**
   * Remove a member from a group
   */
  async removeMemberFromGroup(groupId: number, memberId: number): Promise<void> {
    await axiosInstance.delete(`/communications/groups/${groupId}/members/${memberId}`);
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const response = await axiosInstance.get(`/communications/groups/${groupId}/members`);
    return response.data.data;
  }

  // ==================== SMS MESSAGES ====================

  /**
   * Send an individual SMS
   */
  async sendSMS(smsData: SendSMSRequest): Promise<SmsMessage | SmsMessage[]> {
    const response = await axiosInstance.post('/communications/sms/send', smsData);
    return response.data.data;
  }

  /**
   * Send a test SMS (admin only)
   */
  async sendTestSMS(testData: TestSMSRequest): Promise<SmsMessage> {
    const response = await axiosInstance.post('/communications/sms/test', testData);
    return response.data.data;
  }

  /**
   * Get SMS history
   */
  async getSMSHistory(page = 1, limit = 10, status?: string): Promise<{
    messages: SmsMessage[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let url = `/communications/sms/history?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  }

  /**
   * Get SMS details
   */
  async getSMSDetails(id: number): Promise<SmsMessage> {
    const response = await axiosInstance.get(`/communications/sms/${id}`);
    return response.data.data;
  }

  /**
   * Get SMS statistics
   */
  async getSMSStats(period?: 'today' | 'week' | 'month'): Promise<SMSStats> {
    let url = '/communications/sms/stats/overview';
    if (period) {
      url += `?period=${period}`;
    }
    const response = await axiosInstance.get(url);
    return response.data.data;
  }

  // ==================== SMS CAMPAIGNS ====================

  /**
   * Get all SMS campaigns
   */
  async getCampaigns(page = 1, limit = 10, status?: string): Promise<{
    campaigns: SmsCampaign[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let url = `/communications/campaigns?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  }

  /**
   * Get campaign details
   */
  async getCampaignDetails(id: number): Promise<SmsCampaign> {
    const response = await axiosInstance.get(`/communications/campaigns/${id}`);
    return response.data.data;
  }

  /**
   * Create a new SMS campaign
   */
  async createCampaign(campaignData: CreateCampaignRequest): Promise<SmsCampaign> {
    const response = await axiosInstance.post('/communications/campaigns', campaignData);
    return response.data.data;
  }

  /**
   * Update a campaign (draft only)
   */
  async updateCampaign(id: number, campaignData: Partial<CreateCampaignRequest>): Promise<SmsCampaign> {
    const response = await axiosInstance.put(`/communications/campaigns/${id}`, campaignData);
    return response.data.data;
  }

  /**
   * Approve a campaign
   */
  async approveCampaign(id: number): Promise<SmsCampaign> {
    const response = await axiosInstance.post(`/communications/campaigns/${id}/approve`);
    return response.data.data;
  }

  /**
   * Send a campaign immediately
   */
  async sendCampaign(id: number): Promise<SmsCampaign> {
    const response = await axiosInstance.post(`/communications/campaigns/${id}/send`);
    return response.data.data;
  }

  /**
   * Cancel a campaign
   */
  async cancelCampaign(id: number): Promise<SmsCampaign> {
    const response = await axiosInstance.post(`/communications/campaigns/${id}/cancel`);
    return response.data.data;
  }

  // ==================== SMS BALANCE ====================

  /**
   * Get current SMS balance
   */
  async getCurrentBalance(): Promise<SmsBalance> {
    const response = await axiosInstance.get('/communications/balance/current');
    return response.data.data;
  }

  /**
   * Get balance history
   */
  async getBalanceHistory(page = 1, limit = 10): Promise<{
    history: BalanceHistory[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await axiosInstance.get(`/communications/balance/history?page=${page}&limit=${limit}`);
    return response.data;
  }

  /**
   * Get balance statistics
   */
  async getBalanceStats(): Promise<BalanceStats> {
    const response = await axiosInstance.get('/communications/balance/stats');
    return response.data.data;
  }

  /**
   * Update balance manually (admin only)
   */
  async updateBalance(amount: number, description?: string): Promise<SmsBalance> {
    const response = await axiosInstance.post('/communications/balance/update', {
      amount,
      description
    });
    return response.data.data;
  }
}

// Export singleton instance
const communicationsService = new CommunicationsService();
export default communicationsService;
