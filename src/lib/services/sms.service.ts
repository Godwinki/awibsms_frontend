// sms.service.ts
import axiosInstance from '@/lib/axios';

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
}

export interface ContactCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  count: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SMSProvider {
  id: string;
  name: string;
  logo?: string;
  apiKey?: string;
  apiSecret?: string;
  senderId?: string;
  baseUrl?: string;
  costPerSMS: number;
  isActive: boolean;
  features: string[];
  balance?: number;
  currency?: string;
  lastBalanceCheck?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SMSMessage {
  id: string;
  content: string;
  recipientCount: number;
  totalSent: number;
  deliveryRate: string;
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'DELIVERED' | 'FAILED';
  scheduledFor?: string;
  sentAt?: string;
  templateId?: string;
  providerId: string;
  createdById: string;
  totalCost?: number;
  externalId?: string; // KILAKONA shootId
  createdAt: string;
  updatedAt: string;
}

export interface SendSMSRequest {
  message: string;
  memberGroups?: string[];
  contactCategories?: string[];
  individualMembers?: string[];
  phoneNumbers?: string[];
  templateId?: string;
  providerId: string;
  scheduledFor?: string;
}

export interface SMSBalance {
  providerId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface TopUpRequest {
  providerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

class SMSService {
  /**
   * Get all SMS templates
   */
  async getTemplates(): Promise<SMSTemplate[]> {
    const response = await axiosInstance.get('/sms/templates');
    return response.data.data;
  }

  /**
   * Get an SMS template by ID
   */
  async getTemplateById(id: string): Promise<SMSTemplate> {
    const response = await axiosInstance.get(`/sms/templates/${id}`);
    return response.data.data;
  }

  /**
   * Create a new SMS template
   */
  async createTemplate(template: Partial<SMSTemplate>): Promise<SMSTemplate> {
    const response = await axiosInstance.post('/sms/templates', template);
    return response.data.data;
  }

  /**
   * Update an existing SMS template
   */
  async updateTemplate(id: string, template: Partial<SMSTemplate>): Promise<SMSTemplate> {
    const response = await axiosInstance.put(`/sms/templates/${id}`, template);
    return response.data.data;
  }

  /**
   * Delete an SMS template
   */
  async deleteTemplate(id: string): Promise<void> {
    await axiosInstance.delete(`/sms/templates/${id}`);
  }

  /**
   * Get all contact categories
   */
  async getContactCategories(): Promise<ContactCategory[]> {
    const response = await axiosInstance.get('/sms/categories');
    return response.data.data;
  }

  /**
   * Get a contact category by ID
   */
  async getContactCategoryById(id: string): Promise<ContactCategory> {
    const response = await axiosInstance.get(`/sms/categories/${id}`);
    return response.data.data;
  }

  /**
   * Create a new contact category
   */
  async createContactCategory(category: Partial<ContactCategory>): Promise<ContactCategory> {
    const response = await axiosInstance.post('/sms/categories', category);
    return response.data.data;
  }

  /**
   * Update an existing contact category
   */
  async updateContactCategory(id: string, category: Partial<ContactCategory>): Promise<ContactCategory> {
    const response = await axiosInstance.put(`/sms/categories/${id}`, category);
    return response.data.data;
  }

  /**
   * Delete a contact category
   */
  async deleteContactCategory(id: string): Promise<void> {
    await axiosInstance.delete(`/sms/categories/${id}`);
  }

  /**
   * Add members to a contact category
   */
  async addMembersToCategory(categoryId: string, memberIds: string[]): Promise<void> {
    await axiosInstance.post(`/sms/categories/${categoryId}/members`, { memberIds });
  }

  /**
   * Remove members from a contact category
   */
  async removeMembersFromCategory(categoryId: string, memberIds: string[]): Promise<void> {
    await axiosInstance.delete(`/sms/categories/${categoryId}/members`, { 
      data: { memberIds } 
    });
  }

  /**
   * Get all SMS providers
   */
  async getProviders(): Promise<SMSProvider[]> {
    const response = await axiosInstance.get('/sms/providers');
    return response.data.data;
  }

  /**
   * Get active SMS provider
   */
  async getActiveProvider(): Promise<SMSProvider> {
    const response = await axiosInstance.get('/sms/providers/active');
    return response.data.data;
  }
  
  /**
   * Update SMS provider settings
   */
  async updateProvider(id: string, provider: Partial<SMSProvider>): Promise<SMSProvider> {
    const response = await axiosInstance.put(`/sms/providers/${id}`, provider);
    return response.data.data;
  }

  /**
   * Set active SMS provider
   */
  async setActiveProvider(id: string): Promise<SMSProvider> {
    const response = await axiosInstance.put(`/sms/providers/active/${id}`);
    return response.data.data;
  }

  /**
   * Get SMS balance for a provider
   */
  async getBalance(providerId?: string): Promise<SMSBalance> {
    const url = providerId ? `/sms/balance/${providerId}` : '/sms/balance';
    const response = await axiosInstance.get(url);
    return response.data.data;
  }

  /**
   * Top up SMS balance
   */
  async topUpBalance(request: TopUpRequest): Promise<{
    transactionId: string;
    paymentUrl: string;
    status: string;
  }> {
    const response = await axiosInstance.post('/sms/balance/topup', request);
    return response.data.data;
  }

  /**
   * Get members in a contact category
   */
  async getCategoryMembers(categoryId: string): Promise<any> {
    const response = await axiosInstance.get(`/sms/categories/${categoryId}/members`);
    return response.data;
  }

  /**
   * Search for individual members
   * @param query Search query (name, phone, account number)
   * @param page Page number
   * @param limit Items per page
   */
  async getIndividualMembers(query: string, page = 1, limit = 20): Promise<{
    data: {
      id: string;
      fullName: string;
      mobile: string;
      email?: string;
      accountNumber?: string;
    }[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const response = await axiosInstance.get('/sms/members/search', {
      params: { query, page, limit }
    });
    return response.data;
  }

  /**
   * Get all member groups (e.g., active members, delinquent members)
   */
  async getMemberGroups(): Promise<{
    id: string;
    name: string;
    count: number;
  }[]> {
    const response = await axiosInstance.get('/sms/groups');
    return response.data.data;
  }

  /**
   * Send SMS message
   */
  async sendMessage(request: SendSMSRequest): Promise<SMSMessage> {
    const response = await axiosInstance.post('/sms/send', request);
    return response.data.data;
  }

  /**
   * Get message history with pagination and filtering
   */
  async getMessageHistory(params: {
    page?: number;
    limit?: number;
    status?: string;
    date?: string;
    search?: string;
    batchId?: string;
  } = {}): Promise<{
    data: SMSMessage[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await axiosInstance.get('/sms/messages', { params });
    return response.data;
  }

  /**
   * Get message details including recipients
   */
  async getMessageDetails(messageId: string): Promise<any> {
    const response = await axiosInstance.get(`/sms/messages/${messageId}`);
    return response.data.data;
  }

  /**
   * Get message statistics for analytics dashboard
   */
  async getMessageStats(): Promise<{
    total: number;
    delivered: number;
    pending: number;
    failed: number;
    deliveryRate: number;
    pendingRate: number;
    failRate: number;
  }> {
    const response = await axiosInstance.get('/sms/messages/stats');
    return response.data.data;
  }

  /**
   * Get batch message recipients
   */
  async getMessageRecipients(messageId: string, page = 1, limit = 20, status?: string): Promise<{
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    const response = await axiosInstance.get(`/sms/messages/${messageId}/recipients`, { params });
    return response.data;
  }

  /**
   * Get batch message analytics
   */
  async getBatchAnalytics(messageId: string): Promise<{
    message: any;
    analytics: {
      recipientCount: number;
      deliveredCount: number;
      pendingCount: number;
      failedCount: number;
      deliveryRate: number;
      pendingRate: number;
      failRate: number;
      statusBreakdown: any[];
    };
  }> {
    const response = await axiosInstance.get(`/sms/messages/${messageId}/analytics`);
    return response.data.data;
  }

  /**
   * Cancel a scheduled message
   */
  async cancelScheduledMessage(messageId: string): Promise<void> {
    await axiosInstance.delete(`/sms/messages/${messageId}/cancel`);
  }

  /**
   * Validate phone numbers
   * Returns an object with valid and invalid numbers
   */
  async validatePhoneNumbers(phoneNumbers: string[]): Promise<{
    valid: string[],
    invalid: string[]
  }> {
    const response = await axiosInstance.post('/sms/validate-phones', { phoneNumbers });
    return response.data.data;
  }

  /**
   * Get SMS message by ID
   */
  async getMessageById(id: string): Promise<SMSMessage> {
    const response = await axiosInstance.get(`/sms/messages/${id}`);
    return response.data.data;
  }

  /**
   * Get all SMS templates (alias for getTemplates for compatibility)
   */
  async getSMSTemplates(): Promise<SMSTemplate[]> {
    return this.getTemplates();
  }

  /**
   * Get all SMS providers (alias for getProviders for compatibility)
   */
  async getSMSProviders(): Promise<SMSProvider[]> {
    return this.getProviders();
  }
  
  /**
   * Get delivery report for a specific message using its shootId (KILAKONA specific)
   */
  async getDeliveryReport(shootId: string): Promise<any> {
    const response = await axiosInstance.get(`/sms/delivery-report/${shootId}`);
    return response.data.data;
  }
  
  /**
   * Update delivery statuses for all pending messages
   */
  async updateDeliveryStatuses(): Promise<any> {
    const response = await axiosInstance.get('/sms/update-delivery-statuses');
    return response.data.data;
  }
  
  /**
   * Check if a provider is KILAKONA
   */
  isKilakonaProvider(provider: SMSProvider): boolean {
    return provider?.name === 'KILAKONA';
  }

  /**
   * Create a new KILAKONA provider with default settings
   */
  async createKilakonaProvider(apiKey: string, apiSecret: string, senderId: string): Promise<SMSProvider> {
    const provider = {
      name: 'KILAKONA',
      apiKey,
      apiSecret,
      senderId,
      baseUrl: 'https://messaging.kilakona.co.tz/api/v1/vendor',
      costPerSMS: 10, // Default cost in TSH
      isActive: true,
      features: ['delivery_reports', 'real_time_balance']
    };

    return this.createProvider(provider);
  }

  /**
   * Create a new SMS provider
   */
  async createProvider(provider: Partial<SMSProvider>): Promise<SMSProvider> {
    const response = await axiosInstance.post('/sms/providers', provider);
    return response.data.data;
  }
}

export const smsService = new SMSService();
